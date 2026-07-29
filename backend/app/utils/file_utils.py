import re
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings
from app.schemas.common import ScanModality

ALLOWED_MIME_TYPES = {
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/dicom',
    'application/octet-stream',
}

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.dcm', '.nii', '.gz'}


def sanitize_filename(filename: str) -> str:
    base_name = Path(filename).name
    cleaned = re.sub(r'[^A-Za-z0-9._-]+', '_', base_name)
    return cleaned or 'scan-file'


def has_allowed_extension(filename: str) -> bool:
    lowered = filename.lower()
    return any(lowered.endswith(extension) for extension in ALLOWED_EXTENSIONS)


def validate_scan_upload(file: UploadFile, modality: ScanModality) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f'Unsupported file type: {file.content_type}',
        )

    if not file.filename or not has_allowed_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Upload a CT or MRI image with a supported extension such as .png, .jpg, .jpeg, .webp, or .dcm.',
        )

    if modality not in {ScanModality.ct, ScanModality.mri}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Modality must be CT or MRI.',
        )


def build_upload_destination(settings: Settings, original_filename: str) -> Path:
    safe_name = sanitize_filename(original_filename)
    stamped_name = f'{uuid4().hex}_{safe_name}'
    return settings.upload_path / stamped_name
