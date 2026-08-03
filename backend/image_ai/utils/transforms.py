"""Torchvision transforms shared across Image AI workflows."""

from __future__ import annotations

from torchvision import transforms

from image_ai.config import IMAGE_SIZE


_NORMALIZE = transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225],
)


def get_train_transform():
    return transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(10),
            transforms.ColorJitter(
                brightness=0.15,
                contrast=0.15,
            ),
            transforms.ToTensor(),
            _NORMALIZE,
        ]
    )


def get_validation_transform():
    return transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            _NORMALIZE,
        ]
    )


def get_inference_transform():
    return get_validation_transform()
