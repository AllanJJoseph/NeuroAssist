"""Backward-compatible Grad-CAM entry point."""

from pathlib import Path
import sys

PACKAGE_ROOT = Path(__file__).resolve().parent
BACKEND_ROOT = PACKAGE_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from image_ai.scripts.generate_gradcam import main


if __name__ == "__main__":
    main()