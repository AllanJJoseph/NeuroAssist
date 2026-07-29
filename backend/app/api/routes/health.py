from fastapi import APIRouter

from ....core.config import get_settings
from ....schemas.health import HealthCheckResponse

router = APIRouter(tags=['health'])


@router.get('/', response_model=HealthCheckResponse)
def health_check() -> HealthCheckResponse:
    settings = get_settings()
    return HealthCheckResponse(version=settings.version)
