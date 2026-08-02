from datetime import UTC, datetime
from pathlib import Path

import joblib
import pandas as pd

from app.schemas.common import RiskFactor, RiskLevel, StrokeType
from app.schemas.prediction import PatientRiskRequest, PredictionResponse


MODEL_PATH = Path(__file__).resolve().parents[2] / 'models' / 'stroke_model.pkl'
MODEL = joblib.load(MODEL_PATH)
MODEL_VERSION = MODEL_PATH.name


def _build_input_frame(patient: PatientRiskRequest) -> pd.DataFrame:
    """Convert the request payload into a single-row dataframe for the pipeline."""

    smoking_history_mapping = {
        'Never': 'never smoked',
        'Former': 'formerly smoked',
        'Current': 'smokes',
    }

    return pd.DataFrame(
        [
            {
                'gender': patient.gender.value,
                'age': patient.age,
                'hypertension': int(patient.hypertension),
                'heart_disease': int(patient.heart_disease),
                'avg_glucose_level': patient.glucose_level,
                'bmi': patient.bmi,
                'smoking_status': smoking_history_mapping[patient.smoking_history.value],
            },
        ],
        columns=[
            'gender',
            'age',
            'hypertension',
            'heart_disease',
            'avg_glucose_level',
            'bmi',
            'smoking_status',
        ],
    )


def _predict_probability(input_frame: pd.DataFrame) -> float:
    """Return the positive-class probability from the trained pipeline."""

    if hasattr(MODEL, 'predict_proba'):
        probability_matrix = MODEL.predict_proba(input_frame)
        return float(probability_matrix[0, 1])

    prediction = MODEL.predict(input_frame)
    return float(prediction[0])


def _predict_label(input_frame: pd.DataFrame) -> int:
    """Return the model's binary prediction."""

    prediction = MODEL.predict(input_frame)
    return int(prediction[0])


def _determine_risk_level(probability: float) -> RiskLevel:
    """Map the predicted stroke probability to a clinical risk band."""

    if probability >= 80:
        return RiskLevel.critical
    if probability >= 60:
        return RiskLevel.high
    if probability >= 35:
        return RiskLevel.moderate
    return RiskLevel.low


def _determine_stroke_type(predicted_label: int, probability: float) -> StrokeType:
    """Translate the binary classifier output into the existing response enum."""

    if predicted_label == 1 or probability >= 50:
        return StrokeType.ischemic
    return StrokeType.hemorrhagic


def _build_contributing_risk_factors(patient: PatientRiskRequest) -> list[RiskFactor]:
    """Create explanatory risk factors from the patient context."""

    factors: list[RiskFactor] = []

    age_score = 0
    if patient.age >= 80:
        age_score = 16
    elif patient.age >= 70:
        age_score = 12
    elif patient.age >= 60:
        age_score = 9
    elif patient.age >= 50:
        age_score = 5

    factors.append(
        RiskFactor(
            label='Age',
            detail='Advanced age increases baseline vascular risk.' if age_score else 'Age is not a major driver in this case.',
            score=age_score,
        ),
    )

    comorbidity_score = 0
    if patient.hypertension:
        comorbidity_score += 6
    if patient.heart_disease:
        comorbidity_score += 6
    if patient.previous_stroke:
        comorbidity_score += 8

    factors.append(
        RiskFactor(
            label='Comorbidities',
            detail='Multiple vascular comorbidities are present.' if comorbidity_score >= 12 else 'Limited chronic vascular comorbidity burden.',
            score=comorbidity_score,
        ),
    )

    glucose_score = 0
    if patient.glucose_level >= 220:
        glucose_score = 12
    elif patient.glucose_level >= 180:
        glucose_score = 10
    elif patient.glucose_level >= 140:
        glucose_score = 6
    else:
        glucose_score = 2

    factors.append(
        RiskFactor(
            label='Glucose',
            detail='Hyperglycemia is present at presentation.' if glucose_score >= 10 else 'Glucose is not strongly contributory.',
            score=glucose_score,
        ),
    )

    bmi_score = 0
    if patient.bmi >= 35:
        bmi_score = 8
    elif patient.bmi >= 30:
        bmi_score = 6
    elif patient.bmi >= 25:
        bmi_score = 3
    else:
        bmi_score = 1

    factors.append(
        RiskFactor(
            label='BMI',
            detail='Obesity contributes to vascular burden.' if bmi_score >= 6 else 'BMI is only a modest contributor.',
            score=bmi_score,
        ),
    )

    smoking_score = {
        'Current': 10,
        'Former': 6,
        'Never': 1,
    }.get(patient.smoking_history.value, 1)
    factors.append(
        RiskFactor(
            label='Smoking history',
            detail='Active tobacco exposure is present.' if patient.smoking_history.value == 'Current' else 'Prior tobacco exposure contributes some risk.' if patient.smoking_history.value == 'Former' else 'No smoking history reported.',
            score=smoking_score,
        ),
    )

    symptom_score = 0
    lowered_symptoms = ' '.join(patient.symptoms).lower()
    symptom_keywords = {
        'speech': 8,
        'weakness': 9,
        'facial': 6,
        'vision': 5,
        'headache': 6,
        'dizziness': 4,
        'numb': 5,
        'confusion': 5,
    }
    for keyword, score in symptom_keywords.items():
        if keyword in lowered_symptoms:
            symptom_score += score

    factors.append(
        RiskFactor(
            label='Neurologic symptoms',
            detail='Symptoms are strongly compatible with an acute stroke syndrome.' if symptom_score >= 15 else 'Symptoms are suggestive but not specific.',
            score=symptom_score,
        ),
    )

    return sorted(factors, key=lambda factor: factor.score, reverse=True)


def _build_recommended_next_steps(stroke_type: StrokeType, risk_level: RiskLevel) -> list[str]:
    """Generate the existing next-step guidance from the current response contract."""

    if stroke_type is StrokeType.hemorrhagic:
        steps = [
            'Escalate to hemorrhage pathway and urgent neurosurgical review.',
            'Repeat neurologic examination and monitor for deterioration.',
            'Review anticoagulation, platelet count, and bleeding risk immediately.',
        ]
    else:
        steps = [
            'Verify last-known-well time and evaluate thrombolysis eligibility.',
            'Assess thrombectomy candidacy if large-vessel occlusion is suspected.',
            'Repeat neurologic examination and document NIHSS trend.',
        ]

    if risk_level in {RiskLevel.high, RiskLevel.critical}:
        steps.append('Activate the stroke team and prioritize urgent imaging review.')
    else:
        steps.append('Continue close observation with clear escalation criteria.')

    return steps


def _build_patient_summary(patient: PatientRiskRequest, probability: float) -> str:
    """Summarize the patient context alongside the model prediction."""

    sex = patient.gender.value.lower()
    symptom_text = ', '.join(patient.symptoms) if patient.symptoms else 'no acute neurologic symptoms were supplied'
    return (
        f'{patient.age}-year-old {sex} patient with hypertension={patient.hypertension}, '
        f'heart disease={patient.heart_disease}, smoking history={patient.smoking_history.value.lower()}, '
        f'previous stroke={patient.previous_stroke}, glucose {patient.glucose_level} mg/dL, '
        f'BMI {patient.bmi}. Presenting symptoms: {symptom_text}. '
        f'Model stroke probability: {probability:.1f}%.'
    )


def generate_prediction(patient: PatientRiskRequest) -> PredictionResponse:
    """Generate a trained-model stroke prediction for the supplied patient."""

    input_frame = _build_input_frame(patient)
    probability = _predict_probability(input_frame) * 100.0
    predicted_label = _predict_label(input_frame)
    confidence = max(probability, 100.0 - probability)
    risk_level = _determine_risk_level(probability)
    stroke_type = _determine_stroke_type(predicted_label, probability)
    risk_factors = _build_contributing_risk_factors(patient)
    next_steps = _build_recommended_next_steps(stroke_type, risk_level)

    return PredictionResponse(
        strokeProbability=round(probability, 1),
        confidenceScore=round(confidence, 1),
        riskLevel=risk_level,
        predictedStrokeType=stroke_type,
        contributingRiskFactors=risk_factors,
        recommendedNextClinicalConsiderations=next_steps,
        patientSummary=_build_patient_summary(patient, probability),
        modelVersion=MODEL_VERSION,
        generatedAt=datetime.now(UTC),
    )
