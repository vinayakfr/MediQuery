from fastapi import APIRouter
from app.schemas.patient_schema import PatientRequest, PatientResponse
from app.pipelines.medical_pipeline import MedicalPipeline

router = APIRouter()
pipeline = MedicalPipeline()

@router.post("/analyse", response_model=PatientResponse)
def analyse(data: PatientRequest):
    return pipeline.run(data.text)