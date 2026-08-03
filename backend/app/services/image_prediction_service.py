from __future__ import annotations

import tempfile
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from image_ai.config import CHECKPOINT_DIR, DEVICE
from image_ai.models.classifier import load_model
from image_ai.services.predictor import predict as predict_image
from image_ai.visualization.gradcam import generate_gradcam


HEATMAPS_DIR = Path(__file__).resolve().parents[2] / 'uploads' / 'heatmaps'
HEATMAPS_DIR.mkdir(parents=True, exist_ok=True)


def predict_saved_image(image_path: str | Path) -> dict[str, str | float]:
    image_path = Path(image_path)

    heatmap_filename = f'{uuid4().hex[:10]}.png'
    heatmap_path = HEATMAPS_DIR / heatmap_filename

    prediction = predict_image(image_path)
    model = load_model(CHECKPOINT_DIR / 'best_model.pth', device=DEVICE)
    generate_gradcam(model, image_path, heatmap_path, device=DEVICE)

    return {
        'prediction': prediction['prediction'],
        'confidence': prediction['confidence'],
        'heatmapPath': f'/static/heatmaps/{heatmap_filename}',
    }


async def predict_uploaded_image(file: UploadFile) -> dict[str, str | float]:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Image filename is required.')

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Uploaded image is empty.')

    suffix = Path(file.filename).suffix or '.png'
    temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, prefix='neuroassist_image_')
    temp_input_path = Path(temp_input.name)
    temp_input.close()

    try:
        temp_input_path.write_bytes(image_bytes)
        return predict_saved_image(temp_input_path)
    finally:
        temp_input_path.unlink(missing_ok=True)
