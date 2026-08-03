"""Inference helpers for the Image AI classifier."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import torch
from PIL import Image

from image_ai.config import CHECKPOINT_DIR, CLASSES
from image_ai.models.classifier import load_model
from image_ai.utils.transforms import get_inference_transform


@lru_cache(maxsize=4)
def get_model(
    checkpoint_path: str | Path = CHECKPOINT_DIR / "best_model.pth",
    device: torch.device | None = None,
) -> torch.nn.Module:
    """Load the model once and cache it."""

    runtime_device = device or torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    return load_model(
        checkpoint_path=checkpoint_path,
        device=runtime_device,
    )


def predict(
    image_path: str | Path,
    checkpoint_path: str | Path = CHECKPOINT_DIR / "best_model.pth",
    device: torch.device | None = None,
    class_names: list[str] = CLASSES,
) -> dict[str, Any]:
    """Predict the class for a single image and return a structured result."""

    runtime_device = device or torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    model = get_model(
        checkpoint_path=checkpoint_path,
        device=runtime_device,
    )

    transform = get_inference_transform()

    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(runtime_device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        class_index = int(torch.argmax(probabilities).item())
        confidence = float(probabilities[class_index].item())

    return {
        "prediction": class_names[class_index],
        "confidence": confidence,
        "class_index": class_index,
    }
