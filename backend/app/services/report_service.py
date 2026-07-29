from datetime import UTC, datetime
from uuid import uuid4

from ..schemas.common import RiskFactor
from ..schemas.report import ClinicalReportRequest, ClinicalReportResponse

REPORT_DISCLAIMER = (
    'NeuroAssist is a clinical decision support tool only. The output is mock data for a hackathon build '
    'and must not replace physician judgment, direct patient assessment, or formal diagnostic review.'
)


def generate_clinical_report(payload: ClinicalReportRequest) -> ClinicalReportResponse:
    risk_factors = payload.prediction.contributing_risk_factors
    patient_summary = payload.prediction.patient_summary
    ai_findings = [
        f"Stroke probability: {payload.prediction.stroke_probability}%",
        f"Confidence score: {payload.prediction.confidence_score}%",
        f"Predicted stroke type: {payload.prediction.predicted_stroke_type.value}",
        f"Risk level: {payload.prediction.risk_level.value}",
        f"Lesion location: {payload.scan_analysis.lesion_location}",
    ]

    report_sections = {
        'patient_summary': patient_summary,
        'ai_findings': '; '.join(ai_findings),
        'imaging_analysis': payload.scan_analysis.imaging_summary,
        'clinical_considerations': ' '.join(payload.prediction.recommended_next_clinical_considerations),
    }

    suggested_next_clinical_considerations = [
        *payload.prediction.recommended_next_clinical_considerations,
        'Correlate the mock AI result with the bedside neurologic examination and institutional stroke pathway.',
    ]

    return ClinicalReportResponse(
        reportId=f'NA-{uuid4().hex[:12].upper()}',
        generatedAt=datetime.now(UTC),
        reportTitle=payload.report_title,
        patientSummary=patient_summary,
        aiFindings=ai_findings,
        detectedRiskFactors=risk_factors,
        suggestedNextClinicalConsiderations=suggested_next_clinical_considerations,
        confidenceScore=payload.prediction.confidence_score,
        disclaimer=REPORT_DISCLAIMER,
        reportSections=report_sections,
    )
