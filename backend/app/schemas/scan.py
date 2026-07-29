from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .common import ScanModality, StrokeType


class ScanUploadResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str
    uploaded_filename: str = Field(alias='uploadedFilename')
    original_filename: str = Field(alias='originalFilename')
    content_type: str = Field(alias='contentType')
    modality: ScanModality
    file_size_bytes: int = Field(alias='fileSizeBytes')
    stored_path: str = Field(alias='storedPath')


class ScanAnalysisRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    filename: str | None = None
    modality: ScanModality = ScanModality.ct
    notes: str | None = None


class ScanAnalysisResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    predicted_stroke_type: StrokeType = Field(alias='predictedStrokeType')
    confidence_score: float = Field(alias='confidenceScore')
    lesion_location: str = Field(alias='lesionLocation')
    heatmap_path: str = Field(alias='heatmapPath')
    imaging_summary: str = Field(alias='imagingSummary')
    model_version: str = Field(alias='modelVersion')
    generated_at: datetime = Field(alias='generatedAt')
