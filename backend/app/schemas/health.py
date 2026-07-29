from pydantic import BaseModel, ConfigDict, Field


class HealthCheckResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str = Field(default='NeuroAssist API is running.')
    status: str = Field(default='ok')
    version: str
