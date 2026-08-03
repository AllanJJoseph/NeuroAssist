"""Thin training runner for the Image AI classifier."""

from __future__ import annotations

from torch.utils.data import DataLoader

from image_ai.config import BATCH_SIZE, DATASET_DIR, DEVICE, EPOCHS
from image_ai.models.classifier import create_model
from image_ai.services.trainer import train
from image_ai.utils.dataset import StrokeDataset, create_splits
from image_ai.utils.transforms import get_train_transform, get_validation_transform


def main() -> dict[str, float | str]:
    train_imgs, val_imgs, train_labels, val_labels = create_splits(DATASET_DIR)

    train_dataset = StrokeDataset(train_imgs, train_labels, get_train_transform())
    val_dataset = StrokeDataset(val_imgs, val_labels, get_validation_transform())

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    model = create_model(pretrained=True, device=DEVICE)
    return train(model, train_loader, val_loader, epochs=EPOCHS, device=DEVICE)


if __name__ == "__main__":
    main()
