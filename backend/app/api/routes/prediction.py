from fastapi import APIRouter, status

from app.schemas.prediction import PatientRiskRequest, PredictionResponse
from app.services.prediction_service import generate_prediction

router = APIRouter(prefix='', tags=['prediction'])


@router.post('/predict', response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict(patient: PatientRiskRequest) -> PredictionResponse:
    return generate_prediction(patient)
