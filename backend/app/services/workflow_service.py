from datetime import UTC, datetime
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings
from app.schemas.common import ScanModality
from app.schemas.patient import PatientCreateRequest, PatientResponse
from app.schemas.prediction import PatientRiskRequest, PredictionResponse
from app.schemas.report import ClinicalReportRequest, ClinicalReportResponse
from app.schemas.scan import ScanAnalysisRequest, ScanAnalysisResponse
from app.schemas.workflow import (
    ProcessRequest,
    ProcessResponse,
    ProcessStatus,
    ResultsResponse,
    StatusResponse,
    UploadResponse,
)
from app.services.prediction_service import generate_prediction
from app.services.report_service import generate_clinical_report
from app.services.scan_service import analyze_scan, save_scan_upload

PATIENT_STORE: dict[str, PatientCreateRequest] = {}
UPLOAD_STORE: dict[str, dict] = {}
PROCESS_STORE: dict[str, dict] = {}


def create_patient(payload: PatientCreateRequest) -> PatientResponse:
    patient_id = f'pat_{uuid4().hex[:10]}'
    PATIENT_STORE[patient_id] = payload
    return PatientResponse(
        patientId=patient_id,
        message='Patient record created successfully',
        createdAt=datetime.now(UTC),
    )


async def store_upload(
    file: UploadFile, modality: ScanModality, settings: Settings
) -> UploadResponse:
    upload_res = await save_scan_upload(file, modality, settings)
    upload_id = f'up_{uuid4().hex[:10]}'
    UPLOAD_STORE[upload_id] = {
        'upload_id': upload_id,
        'filename': upload_res.uploaded_filename,
        'original_filename': upload_res.original_filename,
        'modality': modality,
        'content_type': upload_res.content_type,
        'file_size': upload_res.file_size_bytes,
        'stored_path': upload_res.stored_path,
        'uploaded_at': datetime.now(UTC),
    }
    return UploadResponse(
        uploadId=upload_id,
        filename=upload_res.uploaded_filename,
        modality=modality,
        message='File uploaded successfully',
    )


def process_workflow(payload: ProcessRequest) -> ProcessResponse:
    patient_id = payload.patient_id
    upload_id = payload.upload_id

    if patient_id not in PATIENT_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient ID '{patient_id}' not found.",
        )

    if upload_id not in UPLOAD_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Upload ID '{upload_id}' not found.",
        )

    patient_req = PATIENT_STORE[patient_id]
    upload_info = UPLOAD_STORE[upload_id]

    patient_risk_req = PatientRiskRequest(
        age=patient_req.age,
        gender=patient_req.gender,
        hypertension=patient_req.hypertension,
        heartDisease=patient_req.heart_disease,
        glucoseLevel=patient_req.glucose_level,
        bmi=patient_req.bmi,
        smokingHistory=patient_req.smoking_history,
        previousStroke=patient_req.previous_stroke,
        symptoms=patient_req.symptoms,
        systolicBloodPressure=patient_req.systolic_bp,
        diastolicBloodPressure=patient_req.diastolic_bp,
    )

    prediction: PredictionResponse = generate_prediction(patient_risk_req)

    scan_analysis_req = ScanAnalysisRequest(
        modality=upload_info['modality'],
        filename=upload_info['filename'],
    )
    scan_analysis: ScanAnalysisResponse = analyze_scan(scan_analysis_req)

    report_req = ClinicalReportRequest(
        patient=patient_risk_req,
        prediction=prediction,
        scanAnalysis=scan_analysis,
    )
    clinical_report: ClinicalReportResponse = generate_clinical_report(report_req)

    process_id = f'proc_{uuid4().hex[:10]}'
    now = datetime.now(UTC)

    record = {
        'process_id': process_id,
        'patient_id': patient_id,
        'upload_id': upload_id,
        'status': ProcessStatus.completed,
        'created_at': now,
        'patient': patient_req,
        'upload': upload_info,
        'prediction': prediction,
        'scan_analysis': scan_analysis,
        'clinical_report': clinical_report,
    }

    PROCESS_STORE[process_id] = record
    PROCESS_STORE[patient_id] = record
    PROCESS_STORE[upload_id] = record

    return ProcessResponse(
        processId=process_id,
        patientId=patient_id,
        uploadId=upload_id,
        status=ProcessStatus.completed,
        message='Workflow processing completed successfully',
        createdAt=now,
    )


def _find_process_record(item_id: str) -> dict:
    if item_id in PROCESS_STORE:
        return PROCESS_STORE[item_id]

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Resource or process ID '{item_id}' not found.",
    )


def get_process_status(item_id: str) -> StatusResponse:
    record = _find_process_record(item_id)
    return StatusResponse(
        id=item_id,
        status=record['status'],
        progress=100 if record['status'] == ProcessStatus.completed else 50,
        message='Processing completed successfully',
    )


def get_process_results(item_id: str) -> ResultsResponse:
    record = _find_process_record(item_id)
    prediction: PredictionResponse = record['prediction']
    scan_analysis: ScanAnalysisResponse = record['scan_analysis']

    risk_factors_list = [rf.model_dump(by_alias=True) for rf in prediction.contributing_risk_factors]
    signal_breakdown = [
        {'label': rf.label, 'value': rf.score} for rf in prediction.contributing_risk_factors
    ][:5]

    return ResultsResponse(
        processId=record['process_id'],
        patientId=record['patient_id'],
        uploadId=record['upload_id'],
        strokeProbability=prediction.stroke_probability,
        confidence=prediction.confidence_score,
        confidenceScore=prediction.confidence_score,
        strokeType=prediction.predicted_stroke_type.value,
        predictedStrokeType=prediction.predicted_stroke_type.value,
        riskLevel=prediction.risk_level.value,
        recommendations=prediction.recommended_next_clinical_considerations,
        clinicalConsiderations=prediction.recommended_next_clinical_considerations,
        riskFactors=risk_factors_list,
        patientSummary=prediction.patient_summary,
        reportSummary=prediction.patient_summary,
        imagingSummary=scan_analysis.imaging_summary,
        lesionLocation=scan_analysis.lesion_location,
        signalBreakdown=signal_breakdown,
        prediction={
            'strokeProbability': prediction.stroke_probability,
            'confidenceScore': prediction.confidence_score,
            'riskLevel': prediction.risk_level.value,
            'predictedStrokeType': prediction.predicted_stroke_type.value,
            'patientSummary': prediction.patient_summary,
        },
        generatedAt=prediction.generated_at,
    )



def get_process_report(item_id: str) -> ClinicalReportResponse:
    record = _find_process_record(item_id)
    return record['clinical_report']


def generate_report_download(item_id: str) -> tuple[str, str, str]:
    report = get_process_report(item_id)

    content_lines = [
        f'=== {report.report_title.upper()} ===',
        f'Report ID: {report.report_id}',
        f'Generated At: {report.generated_at.isoformat()}',
        '',
        '--- PATIENT SUMMARY ---',
        report.patient_summary,
        '',
        '--- AI FINDINGS ---',
    ]
    for finding in report.ai_findings:
        content_lines.append(f'- {finding}')

    content_lines.extend(['', '--- DETECTED RISK FACTORS ---'])
    for factor in report.detected_risk_factors:
        content_lines.append(f'- {factor.label} (Score {factor.score}): {factor.detail}')

    content_lines.extend(['', '--- RECOMMENDED NEXT CLINICAL CONSIDERATIONS ---'])
    for step in report.suggested_next_clinical_considerations:
        content_lines.append(f'- {step}')

    content_lines.extend(['', '--- DISCLAIMER ---', report.disclaimer, ''])

    content = '\n'.join(content_lines)
    filename = f'neuroassist_clinical_report_{report.report_id}.txt'
    media_type = 'text/plain; charset=utf-8'

    return content, media_type, filename
