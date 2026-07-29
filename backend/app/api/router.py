from fastapi import APIRouter

from .routes.health import router as health_router
from .routes.prediction import router as prediction_router
from .routes.report import router as report_router
from .routes.scan import router as scan_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(prediction_router)
api_router.include_router(scan_router)
api_router.include_router(report_router)
