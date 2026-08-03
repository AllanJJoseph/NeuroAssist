"""Thin Grad-CAM runner for the Image AI classifier."""

from __future__ import annotations

import argparse

import timm
import torch

from image_ai.config import CHECKPOINT_DIR, CLASSES, DEVICE, NUM_CLASSES, RESULTS_DIR, TEST_IMAGES_DIR
from image_ai.visualization.gradcam import generate_gradcam


def main(image_path: str | None = None, output_path: str | None = None) -> str:
    if image_path is None:
        parser = argparse.ArgumentParser(description="Generate a Grad-CAM visualization.")
        parser.add_argument("image_path", nargs="?", default=str(TEST_IMAGES_DIR / "bleeding.png"))
        parser.add_argument("--output", default=str(RESULTS_DIR / "gradcam.png"))
        args = parser.parse_args()
        image_path = args.image_path
        output_path = args.output

    model = timm.create_model(
        "efficientnet_b0",
        pretrained=False,
        num_classes=NUM_CLASSES,
    )

    model.load_state_dict(
        torch.load(
            CHECKPOINT_DIR / "best_model.pth",
            map_location=DEVICE,
        )
    )

    model.to(DEVICE)
    model.eval()
    saved_path = generate_gradcam(model, image_path, output_path or RESULTS_DIR / "gradcam.png", device=DEVICE)
    print(f"Saved -> {saved_path}")
    return saved_path


if __name__ == "__main__":
    main()
