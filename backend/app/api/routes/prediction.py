from fastapi import APIRouter, status

from ....schemas.prediction import PatientRiskRequest, PredictionResponse
from ....services.prediction_service import generate_prediction

router = APIRouter(prefix='', tags=['prediction'])


@router.post('/predict', response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict(patient: PatientRiskRequest) -> PredictionResponse:
    return generate_prediction(patient)
