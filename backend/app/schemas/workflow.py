from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from app.schemas.common import ScanModality


class ProcessStatus(str, Enum):
    queued = 'queued'
    processing = 'processing'
    completed = 'completed'
    failed = 'failed'


class UploadResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            'example': {
                'uploadId': 'up_18812a0914',
                'filename': 'brain_scan_patient12.dcm',
                'modality': 'CT',
                'message': 'File uploaded successfully',
            }
        },
    )

    upload_id: str = Field(alias='uploadId', description='Unique scan upload identifier')
    filename: str = Field(description='Stored filename on server')
    modality: ScanModality = Field(description='Scan modality (CT or MRI)')
    message: str = Field(default='File uploaded successfully', description='Status message')


class ProcessRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra='ignore',
        json_schema_extra={
            'example': {
                'patientId': 'pat_899c1bf53e',
                'uploadId': 'up_18812a0914',
            }
        },
    )

    patient_id: str = Field(
        validation_alias=AliasChoices('patient_id', 'patientId'),
        description='Patient record identifier',
    )
    upload_id: str = Field(
        validation_alias=AliasChoices('upload_id', 'uploadId'),
        description='Scan upload identifier',
    )


class ProcessResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            'example': {
                'processId': 'proc_3d832a5c9f',
                'patientId': 'pat_899c1bf53e',
                'uploadId': 'up_18812a0914',
                'status': 'completed',
                'message': 'Workflow processing completed successfully',
                'createdAt': '2026-08-02T14:00:00Z',
            }
        },
    )

    process_id: str = Field(alias='processId', description='Unique processing job identifier')
    patient_id: str = Field(alias='patientId', description='Associated patient ID')
    upload_id: str = Field(alias='uploadId', description='Associated upload ID')
    status: ProcessStatus = Field(description='Job execution status')
    message: str = Field(default='Workflow processing initiated', description='Status message')
    created_at: datetime = Field(alias='createdAt', description='Timestamp when job was created')


class StatusResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            'example': {
                'id': 'proc_3d832a5c9f',
                'status': 'completed',
                'progress': 100,
                'message': 'Processing completed successfully',
            }
        },
    )

    id: str = Field(description='Task or resource ID')
    status: ProcessStatus = Field(description='Current status')
    progress: int = Field(default=100, description='Completion percentage (0-100)')
    message: str = Field(default='Processing completed successfully', description='Status message')


class ResultsResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            'example': {
                'processId': 'proc_3d832a5c9f',
                'patientId': 'pat_899c1bf53e',
                'uploadId': 'up_18812a0914',
                'strokeProbability': 86.0,
                'confidence': 86.0,
                'confidenceScore': 86.0,
                'strokeType': 'Ischemic',
                'predictedStrokeType': 'Ischemic',
                'riskLevel': 'Critical',
                'recommendations': ['Verify last-known-well time', 'Evaluate thrombolysis eligibility'],
                'clinicalConsiderations': ['Verify last-known-well time', 'Evaluate thrombolysis eligibility'],
                'riskFactors': [{'label': 'Age', 'detail': 'Advanced age', 'score': 12}],
                'patientSummary': '67-year-old female patient...',
                'reportSummary': '67-year-old female patient...',
                'imagingSummary': 'CT pattern suggests an evolving vascular event...',
                'lesionLocation': 'Left MCA territory hypodensity',
                'signalBreakdown': [{'label': 'Age', 'value': 12}],
                'prediction': {'strokeProbability': 86.0},
                'generatedAt': '2026-08-02T14:00:00Z',
            }
        },
    )

    process_id: str = Field(alias='processId', description='Processing task identifier')
    patient_id: str = Field(alias='patientId', description='Associated patient identifier')
    upload_id: str = Field(alias='uploadId', description='Associated upload identifier')

    # Top-level fields required by React frontend
    stroke_probability: float = Field(alias='strokeProbability', description='Predicted stroke probability (0-100)')
    confidence: float = Field(description='Model confidence score')
    confidence_score: float = Field(alias='confidenceScore', description='Model confidence score (alias)')
    stroke_type: str = Field(alias='strokeType', description='Predicted stroke type (Ischemic/Hemorrhagic)')
    predicted_stroke_type: str = Field(alias='predictedStrokeType', description='Predicted stroke type (alias)')
    risk_level: str = Field(alias='riskLevel', description='Risk classification level')
    recommendations: list[str] = Field(description='Recommended next clinical steps')
    clinical_considerations: list[str] = Field(alias='clinicalConsiderations', description='Recommended next clinical considerations')
    risk_factors: list[dict[str, Any]] = Field(alias='riskFactors', description='Contributing risk factor breakdown')
    patient_summary: str = Field(alias='patientSummary', description='Clinical summary of patient and model output')
    report_summary: str = Field(alias='reportSummary', description='Summary for clinical report')
    imaging_summary: str = Field(alias='imagingSummary', description='Imaging interpretation text')
    lesion_location: str = Field(alias='lesionLocation', description='Suspected anatomical lesion location')
    signal_breakdown: list[dict[str, Any]] = Field(alias='signalBreakdown', description='Top signal drivers for visualization')

    # Preserve backward compatibility nested prediction object
    prediction: dict[str, Any] = Field(description='Nested prediction object for legacy callers')
    generated_at: datetime = Field(alias='generatedAt', description='Timestamp of report/results generation')
