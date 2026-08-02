from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import Response

from app.core.config import Settings, get_settings
from app.schemas.common import ScanModality
from app.schemas.report import ClinicalReportResponse
from app.schemas.workflow import (
    ProcessRequest,
    ProcessResponse,
    ResultsResponse,
    StatusResponse,
    UploadResponse,
)
from app.services.workflow_service import (
    generate_report_download,
    get_process_report,
    get_process_results,
    get_process_status,
    process_workflow,
    store_upload,
)

router = APIRouter(tags=['workflow'])


@router.post(
    '/upload',
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary='Upload Brain Scan',
    description='Uploads a CT or MRI scan file, validates file format, stores it in backend/uploads/, and returns an upload ID.',
)
async def upload_file_endpoint(
    file: UploadFile = File(...),
    modality: ScanModality = Form(ScanModality.ct),
    settings: Settings = Depends(get_settings),
) -> UploadResponse:
    """Upload scan file and store temporarily."""
    return await store_upload(file, modality, settings)


@router.post(
    '/process',
    response_model=ProcessResponse,
    status_code=status.HTTP_200_OK,
    summary='Initiate Workflow Processing',
    description='Links patient record and scan upload, executes ML prediction pipeline, and prepares analysis outputs.',
)
def process_endpoint(payload: ProcessRequest) -> ProcessResponse:
    """Execute prediction workflow for patient ID and upload ID."""
    return process_workflow(payload)


@router.get(
    '/status/{id}',
    response_model=StatusResponse,
    status_code=status.HTTP_200_OK,
    summary='Get Task Status',
    description='Retrieves execution status (queued, processing, completed, failed) for a process or task ID.',
)
def get_status_endpoint(id: str) -> StatusResponse:
    """Get job execution status by ID."""
    return get_process_status(id)


@router.get(
    '/results/{id}',
    response_model=ResultsResponse,
    status_code=status.HTTP_200_OK,
    summary='Get Analysis Results',
    description='Retrieves complete stroke prediction metrics, risk level, risk factors, recommendations, and imaging findings.',
)
def get_results_endpoint(id: str) -> ResultsResponse:
    """Get complete workflow analysis results."""
    return get_process_results(id)


@router.get(
    '/report/{id}',
    response_model=ClinicalReportResponse,
    status_code=status.HTTP_200_OK,
    summary='Get Clinical Report',
    description='Retrieves structured clinical report object including AI findings and considerations.',
)
def get_report_endpoint(id: str) -> ClinicalReportResponse:
    """Get structured clinical report by ID."""
    return get_process_report(id)


@router.get(
    '/download/{id}',
    status_code=status.HTTP_200_OK,
    summary='Download Report Attachment',
    description='Downloads plain text formatted clinical support report as a file attachment.',
)
def download_report_endpoint(id: str) -> Response:
    """Stream downloadable report file attachment."""
    content, media_type, filename = generate_report_download(id)
    return Response(
        content=content,
        media_type=media_type,
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )
