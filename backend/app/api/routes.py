from fastapi import APIRouter, UploadFile, File, Form
from app.schemas.patient_schema import PatientRequest, PatientResponse
from app.pipelines.medical_pipeline import MedicalPipeline
from app.services.document_services import DocumentService

router = APIRouter()
pipeline = MedicalPipeline()
doc_service = DocumentService()

@router.post("/analyse", response_model=PatientResponse)
def analyse(data: PatientRequest):
    return pipeline.run(data.text)

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    try:
        file_bytes = await file.read()

        result = doc_service.upload_document(
            user_id=user_id,
            file_bytes=file_bytes,
            filename=file.filename,
            content_type=file.content_type   # ✅ ADD THIS
        )

        return {
            "message": "Upload successful",
            "document": result
        }

    except Exception as e:
        return {"error": str(e)}