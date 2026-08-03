from pathlib import Path
import sys

PACKAGE_ROOT = Path(__file__).resolve().parent
BACKEND_ROOT = PACKAGE_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
	sys.path.insert(0, str(BACKEND_ROOT))

from image_ai.config import DATASET_DIR
from image_ai.utils.dataset import load_dataset

images, labels = load_dataset(DATASET_DIR)

print(f"Images: {len(images)}")
print(f"Labels: {len(labels)}")
print(images[:5])