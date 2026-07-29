from __future__ import annotations

from collections.abc import Iterable

from app.schemas.common import Gender, RiskFactor, RiskLevel, ScanModality, SmokingHistory, StrokeType
from app.schemas.prediction import PatientRiskRequest
from app.schemas.scan import ScanAnalysisRequest


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def normalize_symptoms(symptoms: Iterable[str]) -> list[str]:
    normalized = [str(item).strip() for item in symptoms if str(item).strip()]
    return normalized


def build_patient_summary(patient: PatientRiskRequest) -> str:
    sex = patient.gender.value.lower()
    symptom_text = ', '.join(patient.symptoms) if patient.symptoms else 'no acute neurologic symptoms were supplied'
    return (
        f'{patient.age}-year-old {sex} patient with hypertension={patient.hypertension}, '
        f'heart disease={patient.heart_disease}, smoking history={patient.smoking_history.value.lower()}, '
        f'previous stroke={patient.previous_stroke}, glucose {patient.glucose_level} mg/dL, '
        f'BMI {patient.bmi}. Presenting symptoms: {symptom_text}.'
    )


def derive_risk_factors(patient: PatientRiskRequest) -> list[RiskFactor]:
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

    bp_score = 0
    if patient.systolic_bp is not None:
        if patient.systolic_bp >= 180:
            bp_score = 16
        elif patient.systolic_bp >= 160:
            bp_score = 12
        elif patient.systolic_bp >= 140:
            bp_score = 8
        else:
            bp_score = 4
    elif patient.hypertension:
        bp_score = 8

    factors.append(
        RiskFactor(
            label='Blood pressure',
            detail='Elevated systolic pressure is strongly contributory.' if bp_score >= 12 else 'Blood pressure is a mild-to-moderate contributor.',
            score=bp_score,
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
        SmokingHistory.current: 10,
        SmokingHistory.former: 6,
        SmokingHistory.never: 1,
    }[patient.smoking_history]
    factors.append(
        RiskFactor(
            label='Smoking history',
            detail='Active tobacco exposure is present.' if patient.smoking_history is SmokingHistory.current else 'Prior tobacco exposure contributes some risk.' if patient.smoking_history is SmokingHistory.former else 'No smoking history reported.',
            score=smoking_score,
        ),
    )

    comorbidity_count = sum([patient.hypertension, patient.heart_disease, patient.previous_stroke])
    comorbidity_score = comorbidity_count * 6
    factors.append(
        RiskFactor(
            label='Comorbidities',
            detail='Multiple vascular comorbidities are present.' if comorbidity_score >= 12 else 'Limited chronic vascular comorbidity burden.',
            score=comorbidity_score,
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


def determine_risk_level(probability: float) -> RiskLevel:
    if probability >= 80:
        return RiskLevel.critical
    if probability >= 60:
        return RiskLevel.high
    if probability >= 35:
        return RiskLevel.moderate
    return RiskLevel.low


def determine_stroke_type(patient: PatientRiskRequest, probability: float, factors: list[RiskFactor]) -> StrokeType:
    hemorrhagic_signals = {'headache', 'hypertension', 'blood pressure', 'vomiting', 'nausea'}
    symptom_text = ' '.join(patient.symptoms).lower()
    hemorrhage_score = sum(1 for signal in hemorrhagic_signals if signal in symptom_text)

    if patient.systolic_bp is not None and patient.systolic_bp >= 170:
        hemorrhage_score += 2
    if any(factor.label == 'Blood pressure' and factor.score >= 12 for factor in factors):
        hemorrhage_score += 1

    if hemorrhage_score >= 3 and probability >= 40:
        return StrokeType.hemorrhagic
    return StrokeType.ischemic


def build_recommended_next_steps(stroke_type: StrokeType, risk_level: RiskLevel) -> list[str]:
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


def build_scan_summary(request: ScanAnalysisRequest) -> tuple[StrokeType, float, str, str, str]:
    if request.modality is ScanModality.ct:
        stroke_type = StrokeType.ischemic
        confidence = 84.0
        lesion_location = 'Left MCA territory hypodensity with mild surrounding edema'
        imaging_summary = 'CT pattern is consistent with an evolving ischemic event and focal parenchymal asymmetry.'
        heatmap_path = '/uploads/heatmaps/mock_ct_heatmap.png'
    else:
        stroke_type = StrokeType.ischemic
        confidence = 88.0
        lesion_location = 'Right MCA territory diffusion restriction'
        imaging_summary = 'MRI pattern suggests an acute ischemic process with focal diffusion abnormality.'
        heatmap_path = '/uploads/heatmaps/mock_mri_heatmap.png'

    if request.notes:
        lowered_notes = request.notes.lower()
        if 'hemorrhage' in lowered_notes or 'bleed' in lowered_notes or 'bleeding' in lowered_notes:
            stroke_type = StrokeType.hemorrhagic
            confidence = 91.0
            lesion_location = 'Left basal ganglia with surrounding edema'
            imaging_summary = 'Imaging note pattern raises concern for an acute hemorrhagic process.'
            heatmap_path = '/uploads/heatmaps/mock_hemorrhage_heatmap.png'

    return stroke_type, confidence, lesion_location, imaging_summary, heatmap_path
