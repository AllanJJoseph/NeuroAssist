"""Reusable preprocessing helpers for the NeuroAssist training pipeline."""

from __future__ import annotations

from pathlib import Path
import sys
from typing import Iterable

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


TRAINING_ROOT = Path(__file__).resolve().parents[1]
if str(TRAINING_ROOT) not in sys.path:
    sys.path.insert(0, str(TRAINING_ROOT))


TARGET_COLUMN = "stroke"
ID_COLUMN = "id"
CATEGORICAL_TYPES = ("object", "category", "bool")
FEATURE_COLUMNS = [
    "gender",
    "age",
    "hypertension",
    "heart_disease",
    "avg_glucose_level",
    "bmi",
    "smoking_status",
]


def remove_identifier_column(dataframe: pd.DataFrame, identifier_column: str = ID_COLUMN) -> pd.DataFrame:
    """Drop the identifier column when it exists."""

    if identifier_column not in dataframe.columns:
        return dataframe.copy()

    return dataframe.drop(columns=[identifier_column]).copy()


def split_features_target(
    dataframe: pd.DataFrame,
    target_column: str = TARGET_COLUMN,
    identifier_column: str = ID_COLUMN,
) -> tuple[pd.DataFrame, pd.Series]:
    """Split a raw dataframe into feature and target objects."""

    if target_column not in dataframe.columns:
        raise KeyError(f"Target column not found: {target_column}")

    cleaned_dataframe = remove_identifier_column(dataframe, identifier_column=identifier_column)
    target = cleaned_dataframe[target_column].copy()
    missing_columns = [column for column in FEATURE_COLUMNS if column not in cleaned_dataframe.columns]
    if missing_columns:
        raise KeyError(f"Missing required feature columns: {missing_columns}")

    features = cleaned_dataframe[FEATURE_COLUMNS].copy()
    return features, target


def identify_feature_columns(features: pd.DataFrame) -> tuple[list[str], list[str]]:
    """Automatically determine categorical and numerical feature columns."""

    categorical_columns = features.select_dtypes(include=CATEGORICAL_TYPES).columns.tolist()
    numerical_columns = features.select_dtypes(include=[np.number]).columns.tolist()
    return categorical_columns, numerical_columns


def _create_one_hot_encoder() -> OneHotEncoder:
    """Create an encoder that ignores unseen categories during inference."""

    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def build_preprocessor(features: pd.DataFrame) -> ColumnTransformer:
    """Build a ColumnTransformer with imputation and one-hot encoding."""

    categorical_columns, numerical_columns = identify_feature_columns(features)

    transformers: list[tuple[str, Pipeline, Iterable[str]]] = []

    if numerical_columns:
        numerical_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
            ]
        )
        transformers.append(("numerical", numerical_pipeline, numerical_columns))

    if categorical_columns:
        categorical_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", _create_one_hot_encoder()),
            ]
        )
        transformers.append(("categorical", categorical_pipeline, categorical_columns))

    if not transformers:
        raise ValueError("No feature columns available for preprocessing")

    return ColumnTransformer(transformers=transformers, remainder="drop", verbose_feature_names_out=True)