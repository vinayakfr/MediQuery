from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.schemas.patient_schema import PatientRequest, PatientResponse
from app.pipelines.medical_pipeline import MedicalPipeline
from app.services.document_services import DocumentService

router = APIRouter()
pipeline = MedicalPipeline()
doc_service = DocumentService()


@router.post("/analyse", response_model=PatientResponse)
def analyse(data: PatientRequest):
    return pipeline.run(data.text)


@router.post("/upload-document", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = doc_service.upload_document(
            user_id=user_id,
            file_bytes=file_bytes,
            filename=file.filename,
            content_type=file.content_type,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}") from exc

    return {"message": "Upload successful", "document": result}


@router.get("/documents")
def get_documents(user_id: str):
    try:
        docs = doc_service.get_documents(user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not fetch documents: {exc}") from exc

    return {"documents": docs}


@router.get("/download")
def get_download_url(storage_path: str):
    try:
        url = doc_service.get_download_url(storage_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not generate download URL: {exc}") from exc

    if not url:
        raise HTTPException(status_code=404, detail="Download URL could not be generated.")

    return {"url": url}


@router.delete("/document/{document_id}", status_code=200)
def delete_document(document_id: str):
    try:
        doc_service.delete_document(document_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Delete failed: {exc}") from exc

    return {"message": "Deleted"}