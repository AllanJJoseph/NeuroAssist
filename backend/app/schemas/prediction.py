from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import Gender, RiskFactor, RiskLevel, SmokingHistory, StrokeType


class PatientRiskRequest(BaseModel):
    """Patient data payload used by the mock prediction endpoint."""

    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    age: int = Field(ge=0, le=120)
    gender: Gender
    hypertension: bool
    heart_disease: bool = Field(alias='heartDisease')
    glucose_level: float = Field(alias='glucoseLevel', ge=0)
    bmi: float = Field(gt=0)
    smoking_history: SmokingHistory = Field(alias='smokingHistory')
    previous_stroke: bool = Field(alias='previousStroke')
    symptoms: list[str] = Field(default_factory=list)
    systolic_bp: int | None = Field(default=None, alias='systolicBloodPressure', ge=0)
    diastolic_bp: int | None = Field(default=None, alias='diastolicBloodPressure', ge=0)
    notes: str | None = None

    @field_validator('symptoms', mode='before')
    @classmethod
    def _normalize_symptoms(cls, value: object) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            return [item.strip() for item in value.split(',') if item.strip()]
        return []


class PredictionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    stroke_probability: float = Field(alias='strokeProbability')
    confidence_score: float = Field(alias='confidenceScore')
    risk_level: RiskLevel = Field(alias='riskLevel')
    predicted_stroke_type: StrokeType = Field(alias='predictedStrokeType')
    contributing_risk_factors: list[RiskFactor] = Field(alias='contributingRiskFactors')
    recommended_next_clinical_considerations: list[str] = Field(alias='recommendedNextClinicalConsiderations')
    patient_summary: str = Field(alias='patientSummary')
    model_version: str = Field(alias='modelVersion')
    generated_at: datetime = Field(alias='generatedAt')
