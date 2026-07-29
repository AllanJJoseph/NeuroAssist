from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env files."""

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = Field(default='NeuroAssist API', validation_alias='NEUROASSIST_APP_NAME')
    version: str = Field(default='1.0.0', validation_alias='NEUROASSIST_VERSION')
    debug: bool = Field(default=False, validation_alias='NEUROASSIST_DEBUG')
    environment: str = Field(default='development', validation_alias='NEUROASSIST_ENVIRONMENT')
    upload_dir: Path = Field(default=Path('uploads'))
    max_upload_mb: int = Field(default=20, ge=1, validation_alias='NEUROASSIST_MAX_UPLOAD_MB')
    cors_origins: list[str] = Field(
        default_factory=lambda: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        validation_alias='NEUROASSIST_CORS_ORIGINS',
    )

    @field_validator('upload_dir', mode='before')
    @classmethod
    def _parse_upload_dir(cls, value: object) -> Path:
        if isinstance(value, Path):
            return value
        return Path(str(value))

    @field_validator('cors_origins', mode='before')
    @classmethod
    def _parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            return [item.strip() for item in value.split(',') if item.strip()]
        return ['http://localhost:5173', 'http://127.0.0.1:5173']

    @property
    def project_root(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def upload_path(self) -> Path:
        path = (self.project_root / self.upload_dir).resolve()
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
