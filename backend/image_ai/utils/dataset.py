"""Dataset loading and splitting helpers."""

from __future__ import annotations

from pathlib import Path

from PIL import Image
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset

from image_ai.config import CLASSES


class StrokeDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image = Image.open(self.image_paths[idx]).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, self.labels[idx]


def load_dataset(dataset_root):
    image_paths = []
    labels = []

    for label, class_name in enumerate(CLASSES):
        folder = Path(dataset_root) / class_name / "PNG"

        for image in folder.glob("*"):
            if image.suffix.lower() in [".png", ".jpg", ".jpeg"]:
                image_paths.append(image)
                labels.append(label)

    return image_paths, labels


def create_splits(dataset_root, test_size=0.2):
    image_paths, labels = load_dataset(dataset_root)

    train_images, val_images, train_labels, val_labels = train_test_split(
        image_paths,
        labels,
        test_size=test_size,
        stratify=labels,
        random_state=42,
    )

    return train_images, val_images, train_labels, val_labels
