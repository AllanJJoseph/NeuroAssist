from fastapi import APIRouter, status

from app.schemas.report import ClinicalReportRequest, ClinicalReportResponse
from app.services.report_service import generate_clinical_report

router = APIRouter(tags=['report'])


@router.post('/generate-report', response_model=ClinicalReportResponse, status_code=status.HTTP_200_OK)
def generate_report(payload: ClinicalReportRequest) -> ClinicalReportResponse:
    return generate_clinical_report(payload)
