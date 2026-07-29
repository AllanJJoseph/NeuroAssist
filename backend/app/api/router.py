from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.prediction import router as prediction_router
from app.api.routes.report import router as report_router
from app.api.routes.scan import router as scan_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(prediction_router)
api_router.include_router(scan_router)
api_router.include_router(report_router)
