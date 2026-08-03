"""Grad-CAM helpers for the Image AI classifier."""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

from image_ai.config import DEVICE, IMAGE_SIZE
from image_ai.utils.transforms import get_inference_transform


def generate_gradcam(
    model,
    image_path: str | Path,
    output_path: str | Path,
    device: torch.device | None = None,
) -> str:
    """Generate and save a Grad-CAM visualization for a single image."""

    runtime_device = device or DEVICE
    model = model.to(runtime_device)
    model.eval()

    image = Image.open(image_path).convert("RGB")
    transform = get_inference_transform()
    input_tensor = transform(image).unsqueeze(0).to(runtime_device)

    target_layers = [model.conv_head]
    cam = GradCAM(model=model, target_layers=target_layers)

    with torch.enable_grad():
        grayscale_cam = cam(input_tensor=input_tensor)[0]

    rgb_image = np.array(image.resize((IMAGE_SIZE, IMAGE_SIZE))).astype(np.float32) / 255.0
    visualization = show_cam_on_image(rgb_image, grayscale_cam, use_rgb=True)

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output), cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))

    return str(output)
