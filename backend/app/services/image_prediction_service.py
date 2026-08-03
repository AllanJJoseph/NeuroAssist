from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from image_ai.config import CHECKPOINT_DIR, DEVICE
from image_ai.models.classifier import load_model
from image_ai.services.predictor import predict as predict_image
from image_ai.visualization.gradcam import generate_gradcam


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

    temp_heatmap = tempfile.NamedTemporaryFile(delete=False, suffix='.png', prefix='neuroassist_heatmap_')
    temp_heatmap_path = Path(temp_heatmap.name)
    temp_heatmap.close()

    try:
        temp_input_path.write_bytes(image_bytes)

        prediction = predict_image(temp_input_path)
        model = load_model(CHECKPOINT_DIR / 'best_model.pth', device=DEVICE)
        heatmap_path = generate_gradcam(model, temp_input_path, temp_heatmap_path, device=DEVICE)

        return {
            'prediction': prediction['prediction'],
            'confidence': prediction['confidence'],
            'heatmap_path': heatmap_path,
        }
    finally:
        temp_input_path.unlink(missing_ok=True)
