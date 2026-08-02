"""Reusable evaluation helpers for the NeuroAssist training pipeline."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

TRAINING_ROOT = Path(__file__).resolve().parents[1]
if str(TRAINING_ROOT) not in sys.path:
    sys.path.insert(0, str(TRAINING_ROOT))

from utils.visualization import plot_confusion_matrix


@dataclass(slots=True)
class EvaluationResult:
    """Container for model evaluation artifacts and metrics."""

    model_name: str
    metrics: dict[str, float]
    confusion_matrix: np.ndarray
    classification_report: dict[str, Any]
    roc_curve: dict[str, np.ndarray | float | str]


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_proba: np.ndarray) -> dict[str, float]:
    """Compute the standard binary classification metrics."""

    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, zero_division=0),
        "recall": recall_score(y_true, y_pred, zero_division=0),
        "f1_score": f1_score(y_true, y_pred, zero_division=0),
        "roc_auc": roc_auc_score(y_true, y_proba),
    }


def _prediction_probabilities(model: Any, features: pd.DataFrame) -> np.ndarray:
    """Return positive-class probabilities for a fitted model."""

    if not hasattr(model, "predict_proba"):
        raise AttributeError(f"Model {type(model).__name__} does not expose predict_proba().")

    probabilities = model.predict_proba(features)
    if probabilities.ndim != 2 or probabilities.shape[1] < 2:
        raise ValueError("Model predict_proba output does not contain a positive class column.")

    return probabilities[:, 1]


def format_classification_report(report_dict: dict[str, Any]) -> str:
    """Convert a classification report dictionary into a readable string."""

    report_frame = pd.DataFrame(report_dict).transpose()
    return report_frame.to_string(float_format=lambda value: f"{value:.4f}")


def save_classification_report(report_dict: dict[str, Any], output_path: Path | str) -> None:
    """Persist the classification report as a text file."""

    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(format_classification_report(report_dict), encoding="utf-8")


def evaluate_model(
    model_name: str,
    model: Any,
    features: pd.DataFrame,
    target: pd.Series,
    plots_dir: Path | str,
    reports_dir: Path | str,
) -> EvaluationResult:
    """Evaluate a fitted model and save the core evaluation artifacts."""

    predictions = model.predict(features)
    probabilities = _prediction_probabilities(model, features)

    metrics = compute_metrics(target.to_numpy(), predictions, probabilities)
    matrix = confusion_matrix(target, predictions)
    report = classification_report(target, predictions, output_dict=True, zero_division=0)

    plots_directory = Path(plots_dir)
    reports_directory = Path(reports_dir)
    slug = model_name.lower().replace(" ", "_")

    plot_confusion_matrix(
        matrix,
        labels=[0, 1],
        output_path=plots_directory / f"confusion_matrix_{slug}.png",
        title=f"Confusion Matrix - {model_name}",
    )
    save_classification_report(report, reports_directory / f"classification_report_{slug}.txt")

    fpr, tpr, _ = roc_curve(target, probabilities)
    roc_payload = {
        "name": model_name,
        "fpr": fpr,
        "tpr": tpr,
        "auc": metrics["roc_auc"],
    }

    return EvaluationResult(
        model_name=model_name,
        metrics=metrics,
        confusion_matrix=matrix,
        classification_report=report,
        roc_curve=roc_payload,
    )


def build_comparison_dataframe(results: list[EvaluationResult]) -> pd.DataFrame:
    """Create a comparison table from a list of evaluation results."""

    rows = [{"model": result.model_name, **result.metrics} for result in results]
    return pd.DataFrame(rows).sort_values(by=["roc_auc", "f1_score"], ascending=False).reset_index(drop=True)