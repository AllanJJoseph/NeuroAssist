from fastapi import APIRouter, File, UploadFile, status

from app.schemas.image_prediction import ImagePredictionResponse
from app.services.image_prediction_service import predict_uploaded_image

router = APIRouter(tags=['image-prediction'])


@router.post(
    '/predict-image',
    response_model=ImagePredictionResponse,
    status_code=status.HTTP_200_OK,
)
async def predict_image_endpoint(file: UploadFile = File(...)) -> ImagePredictionResponse:
    result = await predict_uploaded_image(file)
    return ImagePredictionResponse(**result)
