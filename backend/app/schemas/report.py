from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import RiskFactor
from app.schemas.prediction import PatientRiskRequest, PredictionResponse
from app.schemas.scan import ScanAnalysisResponse


class ClinicalReportRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    patient: PatientRiskRequest
    prediction: PredictionResponse
    scan_analysis: ScanAnalysisResponse = Field(alias='scanAnalysis')
    report_title: str = Field(default='NeuroAssist Clinical Support Report', alias='reportTitle')


class ClinicalReportResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    report_id: str = Field(alias='reportId')
    generated_at: datetime = Field(alias='generatedAt')
    report_title: str = Field(alias='reportTitle')
    patient_summary: str = Field(alias='patientSummary')
    ai_findings: list[str] = Field(alias='aiFindings')
    detected_risk_factors: list[RiskFactor] = Field(alias='detectedRiskFactors')
    suggested_next_clinical_considerations: list[str] = Field(alias='suggestedNextClinicalConsiderations')
    confidence_score: float = Field(alias='confidenceScore')
    disclaimer: str
    report_sections: dict[str, str] = Field(alias='reportSections')

    @classmethod
    def create_report_id(cls) -> str:
        return f'NA-{uuid4().hex[:12].upper()}'
