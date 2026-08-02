"""Shared plotting helpers for the NeuroAssist training pipeline."""

from __future__ import annotations

from pathlib import Path
from typing import Sequence

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from utils.paths import PLOTS_DIR


sns.set_theme(style="whitegrid")


def _save_figure(figure: plt.Figure, output_path: Path | str) -> None:
    """Persist a figure to disk and close it afterwards."""

    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    figure.tight_layout()
    figure.savefig(path, dpi=300, bbox_inches="tight")
    plt.close(figure)


def plot_missing_values(missing_counts: pd.Series, output_path: Path | str) -> None:
    """Plot columns with missing values."""

    figure, axis = plt.subplots(figsize=(10, 6))
    counts = missing_counts[missing_counts > 0].sort_values(ascending=False)

    if counts.empty:
        axis.text(0.5, 0.5, "No missing values detected", ha="center", va="center", fontsize=14)
        axis.axis("off")
    else:
        sns.barplot(x=counts.values, y=counts.index, ax=axis, color="#2563eb")
        axis.set_title("Missing Values by Column")
        axis.set_xlabel("Count")
        axis.set_ylabel("Column")

    _save_figure(figure, output_path)


def plot_class_distribution(dataframe: pd.DataFrame, target_column: str, output_path: Path | str) -> None:
    """Plot the target class distribution."""

    figure, axis = plt.subplots(figsize=(8, 6))
    counts = dataframe[target_column].value_counts().sort_index()
    sns.barplot(x=counts.index.astype(str), y=counts.values, ax=axis, palette="Blues_r")
    axis.set_title("Target Class Distribution")
    axis.set_xlabel(target_column)
    axis.set_ylabel("Count")
    _save_figure(figure, output_path)


def plot_correlation_heatmap(numeric_dataframe: pd.DataFrame, output_path: Path | str) -> None:
    """Plot a correlation heatmap for numeric features."""

    figure, axis = plt.subplots(figsize=(12, 10))

    if numeric_dataframe.shape[1] < 2:
        axis.text(0.5, 0.5, "Not enough numeric columns for correlation", ha="center", va="center")
        axis.axis("off")
    else:
        correlation = numeric_dataframe.corr(numeric_only=True)
        sns.heatmap(correlation, annot=False, cmap="coolwarm", center=0, ax=axis)
        axis.set_title("Numeric Feature Correlation")

    _save_figure(figure, output_path)


def plot_numerical_distributions(
    dataframe: pd.DataFrame,
    output_dir: Path | str,
    columns: Sequence[str],
) -> list[Path]:
    """Plot histogram distributions for numeric columns."""

    output_directory = Path(output_dir)
    output_directory.mkdir(parents=True, exist_ok=True)
    saved_paths: list[Path] = []

    for column in columns:
        figure, axis = plt.subplots(figsize=(8, 5))
        sns.histplot(dataframe[column].dropna(), kde=True, ax=axis, color="#0f766e")
        axis.set_title(f"Distribution of {column}")
        axis.set_xlabel(column)
        axis.set_ylabel("Count")
        output_path = output_directory / f"numeric_distribution_{column}.png"
        _save_figure(figure, output_path)
        saved_paths.append(output_path)

    return saved_paths


def plot_categorical_distributions(
    dataframe: pd.DataFrame,
    output_dir: Path | str,
    columns: Sequence[str],
    top_n: int = 15,
) -> list[Path]:
    """Plot count distributions for categorical columns."""

    output_directory = Path(output_dir)
    output_directory.mkdir(parents=True, exist_ok=True)
    saved_paths: list[Path] = []

    for column in columns:
        value_counts = dataframe[column].fillna("Missing").value_counts().head(top_n)
        figure, axis = plt.subplots(figsize=(10, 6))
        sns.barplot(x=value_counts.values, y=value_counts.index.astype(str), ax=axis, palette="viridis")
        axis.set_title(f"Distribution of {column}")
        axis.set_xlabel("Count")
        axis.set_ylabel(column)
        output_path = output_directory / f"categorical_distribution_{column}.png"
        _save_figure(figure, output_path)
        saved_paths.append(output_path)

    return saved_paths


def plot_roc_curves(curves: Sequence[dict[str, np.ndarray | float | str]], output_path: Path | str) -> None:
    """Plot ROC curves for multiple models on a single chart."""

    figure, axis = plt.subplots(figsize=(8, 7))

    for curve in curves:
        axis.plot(
            curve["fpr"],
            curve["tpr"],
            linewidth=2,
            label=f"{curve['name']} (AUC={curve['auc']:.3f})",
        )

    axis.plot([0, 1], [0, 1], linestyle="--", color="grey", label="Random Baseline")
    axis.set_title("ROC Curves")
    axis.set_xlabel("False Positive Rate")
    axis.set_ylabel("True Positive Rate")
    axis.legend(loc="lower right")
    _save_figure(figure, output_path)


def plot_confusion_matrix(
    confusion_matrix: np.ndarray,
    labels: Sequence[str | int],
    output_path: Path | str,
    title: str,
) -> None:
    """Plot a confusion matrix heatmap."""

    figure, axis = plt.subplots(figsize=(6, 5))
    sns.heatmap(
        confusion_matrix,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=labels,
        yticklabels=labels,
        ax=axis,
    )
    axis.set_title(title)
    axis.set_xlabel("Predicted")
    axis.set_ylabel("Actual")
    _save_figure(figure, output_path)


def plot_feature_importance(
    feature_names: Sequence[str],
    importances: Sequence[float],
    output_path: Path | str,
    title: str,
    top_n: int = 20,
) -> None:
    """Plot the most important features for tree-based models."""

    importance_frame = (
        pd.DataFrame({"feature": feature_names, "importance": importances})
        .sort_values("importance", ascending=False)
        .head(top_n)
        .sort_values("importance", ascending=True)
    )

    figure, axis = plt.subplots(figsize=(10, 6))
    sns.barplot(data=importance_frame, x="importance", y="feature", ax=axis, palette="magma")
    axis.set_title(title)
    axis.set_xlabel("Importance")
    axis.set_ylabel("Feature")
    _save_figure(figure, output_path)


def default_plot_path(filename: str) -> Path:
    """Return a path inside the shared plots directory."""

    return PLOTS_DIR / filename