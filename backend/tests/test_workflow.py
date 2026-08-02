import asyncio
from io import BytesIO

from fastapi import UploadFile

from app.core.config import get_settings
from app.schemas.common import Gender, ScanModality, SmokingHistory
from app.schemas.patient import PatientCreateRequest
from app.schemas.prediction import PatientRiskRequest
from app.schemas.workflow import ProcessRequest
from app.services.prediction_service import generate_prediction
from app.services.workflow_service import (
    create_patient,
    generate_report_download,
    get_process_report,
    get_process_results,
    get_process_status,
    process_workflow,
    store_upload,
)


async def run_tests():
    print("Testing backend workflow service and endpoint logic...")
    settings = get_settings()

    # 1. Priority 1: Patient API (POST /patient)
    patient_req = PatientCreateRequest(
        name="Jordan Lee",
        age=67,
        gender=Gender.female,
        systolic=168,
        diastolic=94,
        glucose=186.0,
        bmi=31.4,
        smokingHistory=SmokingHistory.former,
        hypertension=True,
        diabetes=True,
        heartDisease=False,
        previousStroke=False,
        symptoms=["Arm weakness", "speech difficulty", "facial droop"],
    )
    patient_res = create_patient(patient_req)
    patient_id = patient_res.patient_id
    assert patient_id.startswith("pat_"), f"Invalid patient_id: {patient_id}"
    print(f"[OK] Priority 1 (Patient API): Created patient_id = {patient_id}")

    # 2. Priority 2: Scan Upload (POST /upload)
    file_bytes = b"MOCK DICOM CT HEADER CONTENT FOR NEUROASSIST"
    upload_file = UploadFile(
        filename="brain_scan.dcm",
        file=BytesIO(file_bytes),
        headers={"content-type": "application/dicom"},
    )
    upload_res = await store_upload(upload_file, ScanModality.ct, settings)
    upload_id = upload_res.upload_id
    assert upload_id.startswith("up_"), f"Invalid upload_id: {upload_id}"
    print(f"[OK] Priority 2 (Scan Upload): Created upload_id = {upload_id}")

    # 3. Priority 3: Processing (POST /process)
    process_req = ProcessRequest(patientId=patient_id, uploadId=upload_id)
    process_res = process_workflow(process_req)
    process_id = process_res.process_id
    assert process_id.startswith("proc_"), f"Invalid process_id: {process_id}"
    assert process_res.status == "completed"
    print(f"[OK] Priority 3 (Processing): Processed process_id = {process_id}")

    # 4. Priority 4: Status (GET /status/{id})
    status_res = get_process_status(process_id)
    assert status_res.status == "completed"
    assert status_res.progress == 100
    print(f"[OK] Priority 4 (Status API): Status is {status_res.status}")

    # 5. Priority 5: Results (GET /results/{id})
    results_res = get_process_results(process_id)
    assert results_res.process_id == process_id
    assert results_res.stroke_probability == 86.0
    assert results_res.confidence_score > 0
    assert results_res.predicted_stroke_type in ["Ischemic", "Hemorrhagic"]
    assert len(results_res.clinical_considerations) > 0
    assert len(results_res.report_summary) > 0
    assert len(results_res.signal_breakdown) > 0
    assert results_res.stroke_type in ["Ischemic", "Hemorrhagic"]
    assert results_res.confidence > 0
    assert len(results_res.recommendations) > 0
    assert len(results_res.risk_factors) > 0
    print(
        f"[OK] Priority 5 (Results API - Top-Level & Legacy Fields): Probability={results_res.stroke_probability}%, Type={results_res.predicted_stroke_type}, Breakdown Count={len(results_res.signal_breakdown)}"
    )

    # 6. Priority 6: Clinical Report (GET /report/{id})
    report_res = get_process_report(process_id)
    assert report_res.report_id.startswith("NA-")
    assert len(report_res.ai_findings) > 0
    print(f"[OK] Priority 6 (Clinical Report API): Report ID={report_res.report_id}")

    # 7. Priority 7: Download (GET /download/{id})
    content, media_type, filename = generate_report_download(process_id)
    assert "NEUROASSIST CLINICAL SUPPORT REPORT" in content
    assert filename.startswith("neuroassist_clinical_report_")
    print(f"[OK] Priority 7 (Download API): Generated report file = {filename}")

    # 8. Standalone prediction (POST /predict)
    standalone_req = PatientRiskRequest(
        age=65,
        gender=Gender.male,
        hypertension=True,
        heartDisease=False,
        glucoseLevel=140.0,
        bmi=28.5,
        smokingHistory=SmokingHistory.never,
        previousStroke=False,
        symptoms=["Speech difficulty"],
    )
    standalone_pred = generate_prediction(standalone_req)
    assert standalone_pred.stroke_probability >= 0
    print(
        f"[OK] Standalone Predict Endpoint: Stroke Probability = {standalone_pred.stroke_probability}%"
    )

    print("\nALL 7 PRIORITIES VERIFIED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_tests())
