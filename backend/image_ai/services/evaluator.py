"""Reusable evaluation helpers for the Image AI classifier."""

from __future__ import annotations

from typing import Any

import numpy as np
import torch
from sklearn.metrics import classification_report

from image_ai.config import CLASSES, DEVICE
from image_ai.utils.metrics import compute_confusion_matrix, compute_metrics


def evaluate(
    model,
    dataloader,
    device: torch.device | None = None,
    class_names: list[str] = CLASSES,
) -> dict[str, Any]:
    """Evaluate a trained model and return structured metrics."""

    runtime_device = device or DEVICE
    model.eval()

    predictions: list[int] = []
    ground_truth: list[int] = []

    with torch.no_grad():
        for images, labels in dataloader:
            images = images.to(runtime_device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            predictions.extend(preds.cpu().numpy().tolist())
            ground_truth.extend(labels.numpy().tolist())

    y_true = np.asarray(ground_truth)
    y_pred = np.asarray(predictions)
    metrics = compute_metrics(y_true, y_pred)

    return {
        **metrics,
        "confusion_matrix": compute_confusion_matrix(y_true, y_pred),
        "classification_report": classification_report(
            y_true,
            y_pred,
            target_names=class_names,
        ),
        "predictions": predictions,
        "ground_truth": ground_truth,
    }
