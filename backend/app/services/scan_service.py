from datetime import UTC, datetime
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings
from app.schemas.common import ScanModality, StrokeType
from app.schemas.scan import ScanAnalysisRequest, ScanAnalysisResponse, ScanUploadResponse
from app.utils.file_utils import build_upload_destination, sanitize_filename, validate_scan_upload
from app.utils.mock_logic import build_scan_summary, clamp

MODEL_VERSION = 'mock-scan-analyzer-v1'


async def save_scan_upload(file: UploadFile, modality: ScanModality, settings: Settings) -> ScanUploadResponse:
    validate_scan_upload(file, modality)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Uploaded file is empty.')

    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f'Upload exceeds the {settings.max_upload_mb} MB limit.',
        )

    original_filename = sanitize_filename(file.filename or 'scan-file')
    destination = build_upload_destination(settings, original_filename)
    destination.write_bytes(file_bytes)

    return ScanUploadResponse(
        message='Scan uploaded successfully.',
        uploadedFilename=destination.name,
        originalFilename=original_filename,
        contentType=file.content_type or 'application/octet-stream',
        modality=modality,
        fileSizeBytes=len(file_bytes),
        storedPath=str(destination),
    )


def analyze_scan(request: ScanAnalysisRequest) -> ScanAnalysisResponse:
    stroke_type, confidence, lesion_location, imaging_summary, heatmap_path = build_scan_summary(request)
    adjusted_confidence = clamp(confidence, 60, 98)

    if request.filename and Path(request.filename).suffix.lower() == '.dcm' and stroke_type is StrokeType.ischemic:
        lesion_location = 'Left MCA territory lesion with subtle perfusion mismatch'
        imaging_summary = 'DICOM-style upload is interpreted as an ischemic pattern in this mock demo.'
        heatmap_path = '/uploads/heatmaps/mock_dicom_heatmap.png'

    return ScanAnalysisResponse(
        predictedStrokeType=stroke_type,
        confidenceScore=round(adjusted_confidence, 1),
        lesionLocation=lesion_location,
        heatmapPath=heatmap_path,
        imagingSummary=imaging_summary,
        modelVersion=MODEL_VERSION,
        generatedAt=datetime.now(UTC),
    )
