"""Backward-compatible dataset helpers."""

from pathlib import Path
import sys

PACKAGE_ROOT = Path(__file__).resolve().parent
BACKEND_ROOT = PACKAGE_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
	sys.path.insert(0, str(BACKEND_ROOT))

from image_ai.utils.dataset import StrokeDataset, create_splits, load_dataset
