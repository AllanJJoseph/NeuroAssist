"""Training loop for the NeuroAssist Image AI classifier."""

from __future__ import annotations

from pathlib import Path

import torch
from torch import nn

from image_ai.config import CHECKPOINT_DIR, DEVICE, EPOCHS, LEARNING_RATE


def train(
    model: nn.Module,
    train_loader,
    val_loader,
    epochs: int = EPOCHS,
    device: torch.device | None = None,
    checkpoint_path: str | Path = CHECKPOINT_DIR / "best_model.pth",
) -> dict[str, float | str]:
    """Train the classifier and persist the best checkpoint."""

    runtime_device = device or DEVICE
    checkpoint = Path(checkpoint_path)
    checkpoint.parent.mkdir(parents=True, exist_ok=True)

    class_weights = torch.tensor([4.05, 3.92, 1.0], dtype=torch.float32, device=runtime_device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="max",
        factor=0.5,
        patience=2,
    )

    best_accuracy = 0.0

    for epoch in range(epochs):
        model.train()

        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images = images.to(runtime_device)
            labels = labels.to(runtime_device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

        train_accuracy = 100 * correct / total if total else 0.0

        model.eval()
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(runtime_device)
                labels = labels.to(runtime_device)

                outputs = model(images)
                _, predicted = outputs.max(1)

                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()

        val_accuracy = 100 * val_correct / val_total if val_total else 0.0

        print(
            f"Epoch {epoch + 1}/{epochs}"
            f" | Loss: {running_loss:.4f}"
            f" | Train: {train_accuracy:.2f}%"
            f" | Validation: {val_accuracy:.2f}%"
        )
        scheduler.step(val_accuracy)

        if val_accuracy > best_accuracy:
            best_accuracy = val_accuracy
            torch.save(model.state_dict(), checkpoint)

    print("\nTraining Complete")
    print(f"Best Validation Accuracy: {best_accuracy:.2f}%")

    return {
        "best_accuracy": best_accuracy,
        "checkpoint_path": str(checkpoint),
    }
