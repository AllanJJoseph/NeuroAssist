from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Gender(str, Enum):
    female = 'Female'
    male = 'Male'
    other = 'Other'


class SmokingHistory(str, Enum):
    never = 'Never'
    former = 'Former'
    current = 'Current'


class ScanModality(str, Enum):
    ct = 'CT'
    mri = 'MRI'


class StrokeType(str, Enum):
    ischemic = 'Ischemic'
    hemorrhagic = 'Hemorrhagic'


class RiskLevel(str, Enum):
    low = 'Low'
    moderate = 'Moderate'
    high = 'High'
    critical = 'Critical'


class RiskFactor(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    label: str = Field(min_length=1)
    detail: str = Field(min_length=1)
    score: int = Field(ge=0)
