from fastapi import APIRouter, status

from app.schemas.patient import PatientCreateRequest, PatientResponse
from app.services.workflow_service import create_patient

router = APIRouter(tags=['patient'])


@router.post(
    '/patient',
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
    summary='Register Patient',
    description='Validates patient demographic and clinical data and returns a unique patient ID for the workflow.',
)
def create_patient_endpoint(payload: PatientCreateRequest) -> PatientResponse:
    """Create a new patient record in memory."""
    return create_patient(payload)
