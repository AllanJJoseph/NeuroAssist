"""Backward-compatible transform helpers."""

from pathlib import Path
import sys

PACKAGE_ROOT = Path(__file__).resolve().parent
BACKEND_ROOT = PACKAGE_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
	sys.path.insert(0, str(BACKEND_ROOT))

from image_ai.utils.transforms import (
	get_inference_transform,
	get_train_transform,
	get_validation_transform,
)

