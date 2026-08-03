from pathlib import Path
import os

import torch

# Project paths
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = Path(os.getenv("NEUROASSIST_IMAGE_DATASET_DIR", str(BASE_DIR / "datasets" / "Brain_Stroke_CT_Dataset")))
CHECKPOINT_DIR = Path(os.getenv("NEUROASSIST_IMAGE_CHECKPOINT_DIR", str(BASE_DIR / "checkpoints")))
OUTPUT_DIR = Path(os.getenv("NEUROASSIST_IMAGE_OUTPUT_DIR", str(BASE_DIR / "outputs")))
TEST_IMAGES_DIR = Path(os.getenv("NEUROASSIST_IMAGE_TEST_IMAGES_DIR", str(BASE_DIR / "test_images")))
RESULTS_DIR = Path(os.getenv("NEUROASSIST_IMAGE_RESULTS_DIR", str(BASE_DIR / "results")))

for writable_dir in (CHECKPOINT_DIR, OUTPUT_DIR, RESULTS_DIR):
    writable_dir.mkdir(parents=True, exist_ok=True)

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
    "Normal",
]

NUM_CLASSES = len(CLASSES)

# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")