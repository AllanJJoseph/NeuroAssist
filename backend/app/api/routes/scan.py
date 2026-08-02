from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from app.core.config import Settings, get_settings
from app.schemas.common import ScanModality
from app.schemas.scan import ScanAnalysisRequest, ScanAnalysisResponse, ScanUploadResponse
from app.services.scan_service import analyze_scan, save_scan_upload

router = APIRouter(tags=['scan'])


@router.post('/upload-scan', response_model=ScanUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_scan(
    file: UploadFile = File(...),
    modality: ScanModality = Form(...),
    settings: Settings = Depends(get_settings),
) -> ScanUploadResponse:
    return await save_scan_upload(file, modality, settings)


@router.post('/analyze-scan', response_model=ScanAnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_scan_endpoint(payload: ScanAnalysisRequest) -> ScanAnalysisResponse:
    return analyze_scan(payload)
