from pathlib import Path

from ..document import build_medications

from ..store import DATA_DIR, case_store

from ..imaging.loaders import load_medical_file

from ..ml.huggingface import HuggingFaceProvider

from ..ml.registry import (
    X_RAY_MODEL,
    MRI_MODEL,
    CT_MODEL,
)

from ..schemas import (
    ReportFlag,
    ReportScan,
    ScanScore,
)


provider = HuggingFaceProvider()

ABNORMAL_LABELS = {
    "xray": {
        "PNEUMONIA",
    },
    "mri": {
        "glioma",
        "meningioma",
        "pituitary",
    },
    "ct": {
        "positive",
    },
}

DISPLAY_LABELS = {
    "NORMAL": "Normal",
    "PNEUMONIA": "Pneumonia",

    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "notumor": "No tumor",
    "pituitary": "Pituitary",

    "negative": "Negative classification",
    "positive": "Positive classification",
}


# --------------------------------------------------
# SHARED IMAGE SPECIALIST
# --------------------------------------------------

def run_specialist(
    case_id: str,
    files: list,
    agent_id: str,
    model_name: str,
    reporter,
):
    case = case_store.get_case(case_id)

    if case is None:
        return

    reporter.agent(
        agent_id,
        "active",
    )

    reporter.log(
        agent_id,
        f"{agent_id.upper()} specialist started",
    )
    
    reporter.start_timer(agent_id)

    for file in files:

        file_path = (
            DATA_DIR
            / case_id
            / "uploads"
            / file.name
        )

        try:

            # --------------------------------------
            # LOAD FILE
            # --------------------------------------

            reporter.progress(
                file.name,
                "Loading file",
                10,
            )

            image = load_medical_file(
                file_path,
                file.kind,
            )

            # --------------------------------------
            # CLASSIFICATION
            # --------------------------------------

            reporter.progress(
                file.name,
                "Running classification",
                50,
            )

            probabilities = provider.classify(
                image,
                model_name,
            )

            # --------------------------------------
            # BUILD SCORES
            # --------------------------------------

            scores = []

            abnormal_labels = ABNORMAL_LABELS.get(
                file.kind,
                set(),
            )

            for label, score in probabilities.items():

                scores.append(
                    ScanScore(
                        label=DISPLAY_LABELS.get(
                            label,
                            label,
                        ),
                        score=float(score),
                        flagged=(
                            label in abnormal_labels
                            and float(score) >= 0.5
                        ),
                    )
                )

            # --------------------------------------
            # SAVE STRUCTURED SCAN RESULT
            # --------------------------------------

            case.scans.append(
                ReportScan(
                    file_name=file.name,
                    kind=file.kind,
                    model=model_name,
                    scores=scores,
                    preview_url=None,
                    heatmap_url=None,
                )
            )

            # --------------------------------------
            # SAVE PREVIEW
            # --------------------------------------

            reporter.progress(
                file.name,
                "Saving result",
                90,
            )

            preview_dir = (
                DATA_DIR
                / case_id
                / "previews"
            )

            preview_dir.mkdir(
                parents=True,
                exist_ok=True,
            )

            preview_path = (
                preview_dir
                / f"{Path(file.name).stem}_preview.png"
            )

            image.save(
                preview_path
            )

            # --------------------------------------
            # COMPLETE
            # --------------------------------------

            reporter.progress(
                file.name,
                "Complete",
                100,
            )

            reporter.log(
                agent_id,
                (
                    f"Completed {file.name}: "
                    f"{probabilities}"
                ),
            )

            # --------------------------------------
            # UPDATE ROUTING ROW
            # --------------------------------------

            for routing in case.routing:

                if routing.file_name == file.name:

                    routing.model = model_name
                    routing.status = "Done"
                    routing.progress = 100

                    break

        except Exception as exc:

            reporter.log(
                agent_id,
                f"Failed {file.name}: {exc}",
            )

            for routing in case.routing:

                if routing.file_name == file.name:

                    routing.status = "Failed"

                    break

    reporter.stop_timer(
        agent_id,
        {
            "xray": "X-ray agent",
            "mri": "MRI agent",
            "ct": "CT agent",
        }.get(agent_id, agent_id),
        model_name,
    )

    reporter.agent(
        agent_id,
        "done",
    )

    reporter.log(
        agent_id,
        f"{agent_id.upper()} specialist finished",
    )


# --------------------------------------------------
# X-RAY
# --------------------------------------------------

async def xray_node(
    state,
    config,
):
    import asyncio

    reporter = config[
        "configurable"
    ]["reporter"]

    await asyncio.to_thread(
        run_specialist,
        state["case_id"],
        state["files"],
        "xray",
        X_RAY_MODEL,
        reporter,
    )

    return {
        "logs": [
            "X-ray specialist complete"
        ]
    }


# --------------------------------------------------
# MRI
# --------------------------------------------------

async def mri_node(
    state,
    config,
):
    import asyncio

    reporter = config[
        "configurable"
    ]["reporter"]

    await asyncio.to_thread(
        run_specialist,
        state["case_id"],
        state["files"],
        "mri",
        MRI_MODEL,
        reporter,
    )

    return {
        "logs": [
            "MRI specialist complete"
        ]
    }


# --------------------------------------------------
# CT
# --------------------------------------------------

async def ct_node(
    state,
    config,
):
    import asyncio

    reporter = config[
        "configurable"
    ]["reporter"]

    await asyncio.to_thread(
        run_specialist,
        state["case_id"],
        state["files"],
        "ct",
        CT_MODEL,
        reporter,
    )

    return {
        "logs": [
            "CT specialist complete"
        ]
    }


# --------------------------------------------------
# DOCUMENT
# --------------------------------------------------

async def document_node(
    state,
    config,
):
    import asyncio

    reporter = config[
        "configurable"
    ]["reporter"]

    case = case_store.get_case(
        state["case_id"]
    )

    if case is None:
        return {
            "logs": [
                "Case not found"
            ]
        }
    
    reporter.stop_timer(
        "document",
        "Document agent",
        "pdfplumber · EasyOCR · biomedical-NER · Ollama",
    )

    reporter.agent(
        "document",
        "active",
    )

    reporter.log(
        "document",
        "Document specialist started",
    )
    
    reporter.start_timer("document")

    for file in state["files"]:

        file_path = (
            DATA_DIR
            / state["case_id"]
            / "uploads"
            / file.name
        )

        try:

            # ----------------------------------
            # READ DOCUMENT
            # ----------------------------------

            reporter.progress(
                file.name,
                "Reading document",
                20,
            )

            medications = await asyncio.to_thread(
                build_medications,
                file_path,
            )

            # ----------------------------------
            # EXTRACT MEDICINES
            # ----------------------------------

            reporter.progress(
                file.name,
                "Extracting medicines",
                70,
            )

            case.medications.extend(
                medications
            )

            # ----------------------------------
            # COMPLETE
            # ----------------------------------

            reporter.progress(
                file.name,
                "Complete",
                100,
            )

            # ----------------------------------
            # UPDATE ROUTING ROW
            # ----------------------------------

            for routing in case.routing:

                if routing.file_name == file.name:

                    routing.status = "Done"
                    routing.progress = 100

                    break

            reporter.log(
                "document",
                (
                    f"Found "
                    f"{len(medications)} "
                    f"medication(s) in "
                    f"{file.name}"
                ),
            )

        except Exception as exc:

            reporter.log(
                "document",
                f"Failed {file.name}: {exc}",
            )

            for routing in case.routing:

                if routing.file_name == file.name:

                    routing.status = "Failed"

                    break

    reporter.agent(
        "document",
        "done",
    )

    reporter.log(
        "document",
        "Document specialist finished",
    )

    return {
        "logs": [
            "Document specialist complete"
        ]
    }