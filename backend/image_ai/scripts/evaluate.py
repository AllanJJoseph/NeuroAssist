"""Thin evaluation runner for the Image AI classifier."""

from __future__ import annotations

import torch
import timm
from sklearn.metrics import classification_report, confusion_matrix
from torch.utils.data import DataLoader
from torchvision import transforms

from image_ai.config import BATCH_SIZE, CHECKPOINT_DIR, CLASSES, DATASET_DIR, DEVICE, IMAGE_SIZE, NUM_CLASSES
from image_ai.utils.dataset import StrokeDataset, create_splits


def main() -> dict:
    _, val_imgs, _, val_labels = create_splits(DATASET_DIR)

    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    val_dataset = StrokeDataset(
        val_imgs,
        val_labels,
        val_transform,
    )
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    model = timm.create_model(
        "efficientnet_b0",
        pretrained=False,
        num_classes=NUM_CLASSES,
    )

    model.load_state_dict(
        torch.load(
            CHECKPOINT_DIR / "best_model.pth",
            map_location=DEVICE,
        )
    )

    model.to(DEVICE)
    model.eval()

    predictions = []
    ground_truth = []

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(DEVICE)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            predictions.extend(preds.cpu().numpy())
            ground_truth.extend(labels.numpy())

    print("\nClassification Report\n")
    print(
        classification_report(
            ground_truth,
            predictions,
            target_names=CLASSES,
        )
    )
    print("\nConfusion Matrix\n")
    print(
        confusion_matrix(
            ground_truth,
            predictions,
        )
    )

    return {
        "predictions": predictions,
        "ground_truth": ground_truth,
        "num_classes": NUM_CLASSES,
    }


if __name__ == "__main__":
    main()
