from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import Gender, SmokingHistory


class PatientCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    name: str = Field(default='Anonymous Patient', min_length=1)
    age: int = Field(ge=0, le=120)
    gender: Gender
    systolic_bp: int | None = Field(
        default=120,
        validation_alias=AliasChoices('systolic_bp', 'systolicBloodPressure', 'systolic'),
        ge=0,
    )
    diastolic_bp: int | None = Field(
        default=80,
        validation_alias=AliasChoices('diastolic_bp', 'diastolicBloodPressure', 'diastolic'),
        ge=0,
    )
    glucose_level: float = Field(
        validation_alias=AliasChoices('glucose_level', 'glucoseLevel', 'glucose'),
        ge=0,
    )
    bmi: float = Field(gt=0)
    smoking_history: SmokingHistory = Field(
        default=SmokingHistory.never,
        validation_alias=AliasChoices('smoking_history', 'smokingHistory'),
    )
    hypertension: bool = False
    diabetes: bool = False
    heart_disease: bool = Field(
        default=False,
        validation_alias=AliasChoices('heart_disease', 'heartDisease'),
    )
    previous_stroke: bool = Field(
        default=False,
        validation_alias=AliasChoices('previous_stroke', 'previousStroke'),
    )
    symptoms: list[str] = Field(default_factory=list)

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


class PatientResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    patient_id: str = Field(alias='patientId')
    message: str = 'Patient record created successfully'
    created_at: datetime = Field(alias='createdAt')
