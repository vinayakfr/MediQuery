import asyncio

from pathlib import Path

from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
)

from fastapi.responses import FileResponse

from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CaseCreateResponse,
    CaseFile,
    CaseReport,
    Patient,
    RunSnapshot,
)

from .store import DATA_DIR, case_store
from .graph.builder import build_graph
from .reporter import Reporter
from .imaging.detect import detect_kind


app = FastAPI()

graph = build_graph()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelsLoaded": 0,
    }


@app.post("/cases", response_model=CaseCreateResponse)
async def create_case(
    patient: str = Form(),
    files: list[UploadFile] = File(),
):
    # Parse patient JSON
    patient_data = Patient.model_validate_json(patient)

    # Create case record
    case = case_store.create_case(patient_data)

    # Create upload directory
    upload_dir = DATA_DIR / case.id / "uploads"

    upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Save uploaded files
    for index, upload in enumerate(files):

        filename = Path(
            upload.filename or f"file-{index}"
        ).name

        file_path = upload_dir / filename

        contents = await upload.read()

        file_path.write_bytes(contents)

        # Detect file kind using Step 4
        kind = detect_kind(file_path)

        extension = file_path.suffix.lower()

        case.files.append(
            CaseFile(
                id=f"f{index + 1}",
                name=filename,
                kind=kind,
                description=(
                    f"Uploaded file · "
                    f"{extension.lstrip('.').upper()}"
                ),
                size_bytes=len(contents),
            )
        )

    # Create live UI reporter
    reporter = Reporter(case.id)

    # Initial LangGraph state
    state = {
        "case_id": case.id,
        "logs": [],
        "progress": [],
    }

    # Run LangGraph in the background
    asyncio.create_task(
        graph.ainvoke(
            state,
            config={
                "configurable": {
                    "reporter": reporter,
                }
            },
        )
    )

    return {
        "case_id": case.id,
    }


@app.get(
    "/cases/{case_id}/run",
    response_model=RunSnapshot,
)
def get_case_run(case_id: str):

    case = case_store.get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    return case_store.to_snapshot(case)

@app.get(
    "/cases/{case_id}/report",
    response_model=CaseReport,
)
def get_case_report(
    case_id: str,
    request: Request,
):
    case = case_store.get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    if case.status != "complete":
        raise HTTPException(
            status_code=409,
            detail="Report is not ready",
        )

    base_url = str(
        request.base_url
    ).rstrip("/")

    return case_store.build_report(
        case,
        base_url,
    )
    
@app.get(
    "/cases/{case_id}/files/{file_id}/preview.png"
)
def get_file_preview(
    case_id: str,
    file_id: str,
):
    case = case_store.get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    file = next(
        (
            item
            for item in case.files
            if item.id == file_id
        ),
        None,
    )

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found",
        )

    preview_path = (
        DATA_DIR
        / case_id
        / "previews"
        / f"{Path(file.name).stem}_preview.png"
    )

    if not preview_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Preview not found",
        )

    return FileResponse(
        preview_path,
        media_type="image/png",
    )