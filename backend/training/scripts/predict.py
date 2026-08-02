"""Inference helpers for the saved NeuroAssist stroke model."""

from __future__ import annotations

from pathlib import Path
import sys
from typing import Any

import joblib
import numpy as np
import pandas as pd


TRAINING_ROOT = Path(__file__).resolve().parents[1]
if str(TRAINING_ROOT) not in sys.path:
    sys.path.insert(0, str(TRAINING_ROOT))

from utils.paths import MODEL_PATH


def load_stroke_model(model_path: Path | str | None = None) -> Any:
    """Load the persisted model pipeline from disk."""

    path = Path(model_path) if model_path is not None else MODEL_PATH
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")

    return joblib.load(path)


def predict_stroke_risk(
    input_dataframe: pd.DataFrame,
    model: Any | None = None,
    model_path: Path | str | None = None,
) -> tuple[np.ndarray, np.ndarray | None]:
    """Predict stroke labels and probabilities from raw patient data."""

    fitted_model = model if model is not None else load_stroke_model(model_path)
    predictions = fitted_model.predict(input_dataframe)

    probabilities: np.ndarray | None = None
    if hasattr(fitted_model, "predict_proba"):
        probabilities = fitted_model.predict_proba(input_dataframe)[:, 1]

    return predictions, probabilities