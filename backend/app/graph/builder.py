import asyncio
import json

import ollama

from langgraph.graph import (
    StateGraph,
    START,
    END,
)

from langgraph.types import Send

from .state import GraphState

from .specialists import (
    xray_node,
    mri_node,
    ct_node,
    document_node,
)


# ============================================================
# EXTRACTION
# ============================================================

async def extraction_node(
    state: GraphState,
    config,
):
    reporter = config["configurable"]["reporter"]

    from ..store import case_store

    case = case_store.get_case(
        state["case_id"]
    )

    if case is None:
        return {
            "logs": ["Case not found"]
        }

    case.status = "running"

    reporter.agent(
        "extraction",
        "active",
    )

    reporter.log(
        "extraction",
        "Starting file extraction",
    )

    reporter.start_timer(
        "extraction"
    )

    await asyncio.to_thread(
        _extract_files,
        state["case_id"],
        reporter,
    )

    reporter.stop_timer(
        "extraction",
        "Extraction agent",
        "pydicom · nibabel · pdfplumber",
    )

    reporter.agent(
        "extraction",
        "done",
    )

    reporter.log(
        "extraction",
        "File extraction complete",
    )

    return {
        "files": case.files,
        "logs": [
            "Extraction complete"
        ],
    }


def _extract_files(
    case_id,
    reporter,
):
    from ..store import case_store
    from ..schemas import RoutingItem

    case = case_store.get_case(
        case_id
    )

    if case is None:
        return

    for file in case.files:

        reporter.log(
            "extraction",
            f"Received file: {file.name}",
        )

        case.routing.append(
            RoutingItem(
                file_name=file.name,
                kind=file.kind,
                model="pending",
                reason="Waiting for specialist",
                status="Queued",
                progress=0,
            )
        )


# ============================================================
# ORCHESTRATOR
# ============================================================

async def orchestrator_node(
    state: GraphState,
    config,
):
    reporter = config["configurable"]["reporter"]

    from ..store import case_store

    case = case_store.get_case(
        state["case_id"]
    )

    if case is None:
        return {
            "logs": ["Case not found"]
        }

    reporter.agent(
        "orchestrator",
        "active",
    )

    reporter.log(
        "orchestrator",
        "Routing files to specialist agents",
    )

    reporter.start_timer(
        "orchestrator"
    )

    xray_files = []
    mri_files = []
    ct_files = []
    document_files = []

    for file in case.files:

        if file.kind == "xray":
            xray_files.append(file)

        elif file.kind == "mri":
            mri_files.append(file)

        elif file.kind == "ct":
            ct_files.append(file)

        elif file.kind == "prescription":
            document_files.append(file)

    # Mark unused agents as skipped

    if not xray_files:
        reporter.agent(
            "xray",
            "skipped",
        )

    if not mri_files:
        reporter.agent(
            "mri",
            "skipped",
        )

    if not ct_files:
        reporter.agent(
            "ct",
            "skipped",
        )

    if not document_files:
        reporter.agent(
            "document",
            "skipped",
        )

    # Update routing rows

    for file in case.files:

        if file.kind == "xray":

            model = "chest-xray-classifier"
            reason = "Detected X-ray file"

        elif file.kind == "mri":

            model = "brain-mri-classifier"
            reason = "Detected MRI file"

        elif file.kind == "ct":

            model = "lung-ct-classifier"
            reason = "Detected CT file"

        else:

            model = "biomedical-ner"
            reason = "Detected prescription/document"

        for routing in case.routing:

            if routing.file_name == file.name:

                routing.model = model
                routing.reason = reason
                routing.status = "Queued"

                break

    reporter.log(
        "orchestrator",
        (
            f"Routing complete: "
            f"{len(xray_files)} X-ray, "
            f"{len(mri_files)} MRI, "
            f"{len(ct_files)} CT, "
            f"{len(document_files)} documents"
        ),
    )

    reporter.stop_timer(
        "orchestrator",
        "Orchestrator",
        "routing",
    )

    reporter.agent(
        "orchestrator",
        "done",
    )

    return {
        "logs": [
            "Orchestration complete"
        ]
    }


# ============================================================
# ROUTING
# ============================================================

def route(state: GraphState):

    case_id = state["case_id"]

    from ..store import case_store

    case = case_store.get_case(
        case_id
    )

    if case is None:
        return "narrator"

    xray_files = []
    mri_files = []
    ct_files = []
    document_files = []

    for file in case.files:

        if file.kind == "xray":
            xray_files.append(file)

        elif file.kind == "mri":
            mri_files.append(file)

        elif file.kind == "ct":
            ct_files.append(file)

        elif file.kind == "prescription":
            document_files.append(file)

    sends = []

    if xray_files:

        sends.append(
            Send(
                "xray",
                {
                    "case_id": case_id,
                    "files": xray_files,
                },
            )
        )

    if mri_files:

        sends.append(
            Send(
                "mri",
                {
                    "case_id": case_id,
                    "files": mri_files,
                },
            )
        )

    if ct_files:

        sends.append(
            Send(
                "ct",
                {
                    "case_id": case_id,
                    "files": ct_files,
                },
            )
        )

    if document_files:

        sends.append(
            Send(
                "document",
                {
                    "case_id": case_id,
                    "files": document_files,
                },
            )
        )

    if not sends:
        return "narrator"

    return sends


# ============================================================
# NARRATOR PROMPT
# ============================================================

def build_narrator_prompt(case):

    findings = {
        "scans": [
            {
                "fileName": scan.file_name,
                "kind": scan.kind,
                "model": scan.model,
                "results": [
                    {
                        "label": score.label,
                        "score": round(
                            score.score,
                            2,
                        ),
                        "flagged": score.flagged,
                    }
                    for score in scan.scores
                ],
            }
            for scan in case.scans
        ],

        "medications": [
            {
                "name": medication.name,
                "dose": medication.dose,
                "frequency": medication.frequency,
                "duration": medication.duration,
                "readClearly": medication.read_clearly,
            }
            for medication in case.medications
        ],
    }

    return f"""
You are the narrator for a medical
document analysis system.

Write a short, cautious summary of the
structured findings below.

IMPORTANT RULES:

- Do not diagnose the patient.
- Do not invent diseases or conditions.
- Do not reinterpret model labels.
- Do not turn "positive" into a specific disease.
- Use the exact result labels provided.
- If a result is "Normal", describe it as normal.
- If a result is "Positive classification",
  describe it only as a positive classification.
- Do not create flags.
- Do not add probabilities that are not provided.
- Do not make claims beyond the supplied findings.
- Mention uncertainty when appropriate.
- Use plain language.
- Keep the summary to 3-4 sentences.

Return ONLY valid JSON:

{{
    "summary": "..."
}}

Structured findings:

{json.dumps(
    findings,
    indent=2,
)}
"""


# ============================================================
# RULE-BASED FLAGS
# ============================================================

def build_rule_based_flags(case):

    from ..schemas import ReportFlag

    flags = []

    for scan in case.scans:

        for score in scan.scores:

            if score.flagged:

                flags.append(
                    ReportFlag(
                        text=(
                            f"{score.label} "
                            f"({score.score:.2f}) "
                            f"in {scan.file_name}"
                        ),
                        source=scan.kind,
                    )
                )

    for medication in case.medications:

        if not medication.read_clearly:

            flags.append(
                ReportFlag(
                    text=(
                        f"Medication details should be "
                        f"checked for {medication.name}"
                    ),
                    source="document",
                )
            )

    return flags


# ============================================================
# NARRATOR
# ============================================================

async def narrator_node(
    state: GraphState,
    config,
):

    reporter = config["configurable"]["reporter"]

    from ..store import case_store
    from ..schemas import ReportTrail

    case = case_store.get_case(
        state["case_id"]
    )

    if case is None:
        return {
            "logs": [
                "Case not found"
            ]
        }

    reporter.agent(
        "narrator",
        "active",
    )

    reporter.log(
        "narrator",
        "Narrator started",
    )

    reporter.start_timer(
        "narrator"
    )

    def generate_report():

        prompt = build_narrator_prompt(
            case
        )

        response = ollama.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            format="json",
            options={
                "temperature": 0,
            },
        )

        return json.loads(
            response["message"]["content"]
        )

    try:

        result = await asyncio.to_thread(
            generate_report
        )

        case.summary = result.get(
            "summary",
            "No summary generated.",
        )

        case.flags = build_rule_based_flags(
            case
        )

        reporter.log(
            "narrator",
            "Narrator generated final summary",
        )

    except Exception as exc:

        reporter.log(
            "narrator",
            f"Narrator failed: {exc}",
        )

        case.summary = (
            "The analysis completed, "
            "but the narrative summary "
            "could not be generated."
        )

        case.flags = build_rule_based_flags(
            case
        )

    reporter.stop_timer(
        "narrator",
        "Narrator agent",
        "llama3.2:3b",
    )

    # Save all completed timings
    # into the final report.
    case.trail = [
        ReportTrail(
            agent=item["agent"],
            used=item["used"],
            seconds=item["seconds"],
        )
        for item in reporter.timings
    ]

    reporter.agent(
        "narrator",
        "done",
    )

    case.status = "complete"

    return {
        "logs": [
            "Narrator complete"
        ]
    }


# ============================================================
# BUILD GRAPH
# ============================================================

def build_graph():

    graph = StateGraph(
        GraphState
    )

    graph.add_node(
        "extraction",
        extraction_node,
    )

    graph.add_node(
        "orchestrator",
        orchestrator_node,
    )

    graph.add_node(
        "xray",
        xray_node,
    )

    graph.add_node(
        "mri",
        mri_node,
    )

    graph.add_node(
        "ct",
        ct_node,
    )

    graph.add_node(
        "document",
        document_node,
    )

    graph.add_node(
        "narrator",
        narrator_node,
    )

    graph.add_edge(
        START,
        "extraction",
    )

    graph.add_edge(
        "extraction",
        "orchestrator",
    )

    graph.add_conditional_edges(
        "orchestrator",
        route,
        [
            "xray",
            "mri",
            "ct",
            "document",
            "narrator",
        ],
    )

    for agent in (
        "xray",
        "mri",
        "ct",
        "document",
    ):

        graph.add_edge(
            agent,
            "narrator",
        )

    graph.add_edge(
        "narrator",
        END,
    )

    return graph.compile()