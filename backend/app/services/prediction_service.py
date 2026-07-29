from datetime import UTC, datetime

from app.schemas.common import RiskLevel, StrokeType
from app.schemas.prediction import PatientRiskRequest, PredictionResponse
from app.utils.mock_logic import (
    build_patient_summary,
    build_recommended_next_steps,
    clamp,
    derive_risk_factors,
    determine_risk_level,
    determine_stroke_type,
)

MODEL_VERSION = 'mock-predictor-v1'


def generate_prediction(patient: PatientRiskRequest) -> PredictionResponse:
    risk_factors = derive_risk_factors(patient)
    raw_score = sum(factor.score for factor in risk_factors)
    probability = clamp(12 + raw_score, 5, 97)
    confidence = clamp(68 + probability * 0.12 + min(12, len(patient.symptoms) * 1.5), 60, 97)
    risk_level = determine_risk_level(probability)
    stroke_type = determine_stroke_type(patient, probability, risk_factors)
    next_steps = build_recommended_next_steps(stroke_type, risk_level)

    return PredictionResponse(
        strokeProbability=round(probability, 1),
        confidenceScore=round(confidence, 1),
        riskLevel=risk_level,
        predictedStrokeType=stroke_type,
        contributingRiskFactors=risk_factors,
        recommendedNextClinicalConsiderations=next_steps,
        patientSummary=build_patient_summary(patient),
        modelVersion=MODEL_VERSION,
        generatedAt=datetime.now(UTC),
    )
