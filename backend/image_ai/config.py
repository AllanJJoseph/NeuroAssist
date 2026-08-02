from pathlib import Path
import torch

# Project paths
BASE_DIR = Path(__file__).resolve().parent

DATASET_DIR = BASE_DIR / "datasets" / "Brain_Stroke_CT_Dataset"

CHECKPOINT_DIR = BASE_DIR / "checkpoints"
OUTPUT_DIR = BASE_DIR / "outputs"

CHECKPOINT_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Image settings
IMAGE_SIZE = 224

# Training settings
BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 1e-4

# Classes
CLASSES = [
    "Bleeding",
    "Ischemia",
    "Normal"
]

NUM_CLASSES = len(CLASSES)

# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")