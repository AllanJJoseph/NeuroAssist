from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.patient import router as patient_router
from app.api.routes.prediction import router as prediction_router
from app.api.routes.report import router as report_router
from app.api.routes.scan import router as scan_router
from app.api.routes.workflow import router as workflow_router
from app.api.routes.image_prediction import router as image_prediction_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(patient_router)
api_router.include_router(prediction_router)
api_router.include_router(scan_router)
api_router.include_router(report_router)
api_router.include_router(workflow_router)
api_router.include_router(image_prediction_router)

