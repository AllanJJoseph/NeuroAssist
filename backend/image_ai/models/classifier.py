"""EfficientNet classifier helpers."""

from __future__ import annotations

from pathlib import Path

import timm
import torch
from torch import nn

from image_ai.config import DEVICE, NUM_CLASSES


def create_model(
    pretrained: bool = True,
    num_classes: int = NUM_CLASSES,
    device: torch.device | None = None,
) -> nn.Module:
    """Create the EfficientNet-B0 classifier used by the project."""

    model = timm.create_model(
        "efficientnet_b0",
        pretrained=pretrained,
        num_classes=num_classes,
    )
    return model.to(device or DEVICE)


def load_model(
    checkpoint_path: str | Path,
    device: torch.device | None = None,
    num_classes: int = NUM_CLASSES,
) -> nn.Module:
    """Create the classifier and load a checkpoint into it."""

    checkpoint = Path(checkpoint_path)
    if not checkpoint.exists():
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint}")

    model = create_model(pretrained=False, num_classes=num_classes, device=device)
    state_dict = torch.load(checkpoint, map_location=device or DEVICE)
    model.load_state_dict(state_dict)
    model.eval()
    return model
