"""Reusable dataset loading helpers for the training pipeline."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from utils.paths import DATASET_PATH


def load_dataset(dataset_path: Path | str | None = None) -> pd.DataFrame:
    """Load the stroke dataset and validate that it contains records."""

    path = Path(dataset_path) if dataset_path is not None else DATASET_PATH

    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    if path.stat().st_size == 0:
        raise ValueError(f"Dataset is empty: {path}")

    dataframe = pd.read_csv(path)
    if dataframe.empty:
        raise ValueError(f"Dataset has no rows: {path}")

    return dataframe