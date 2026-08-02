"""Shared filesystem paths for the NeuroAssist training pipeline."""

from __future__ import annotations

from pathlib import Path


TRAINING_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = TRAINING_ROOT.parent
DATASETS_DIR = TRAINING_ROOT / "datasets"
OUTPUTS_DIR = TRAINING_ROOT / "outputs"
PLOTS_DIR = OUTPUTS_DIR / "plots"
REPORTS_DIR = OUTPUTS_DIR / "reports"
MODELS_DIR = BACKEND_ROOT / "models"
DATASET_PATH = DATASETS_DIR / "healthcare-dataset-stroke-data.csv"
MODEL_PATH = MODELS_DIR / "stroke_model.pkl"


def ensure_directories() -> None:
    """Create the training output directories when they do not exist."""

    for directory in (DATASETS_DIR, MODELS_DIR, OUTPUTS_DIR, PLOTS_DIR, REPORTS_DIR):
        directory.mkdir(parents=True, exist_ok=True)