import torch
import timm

from torchvision import transforms
from torch.utils.data import DataLoader
from torch import nn

from dataset import StrokeDataset, create_splits
from config import *

# ----------------------------
# Transforms
# ----------------------------
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
])

# ----------------------------
# Dataset
# ----------------------------
train_imgs, val_imgs, train_labels, val_labels = create_splits(DATASET_DIR)

train_dataset = StrokeDataset(train_imgs, train_labels, train_transform)
val_dataset = StrokeDataset(val_imgs, val_labels, val_transform)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False
)

print(f"Training Images: {len(train_dataset)}")
print(f"Validation Images: {len(val_dataset)}")

# ----------------------------
# Model
# ----------------------------
model = timm.create_model(
    "efficientnet_b0",
    pretrained=True,
    num_classes=NUM_CLASSES
)

model = model.to(DEVICE)

# ----------------------------
# Loss / Optimizer
# ----------------------------
criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)

best_accuracy = 0

# ----------------------------
# Training Loop
# ----------------------------
for epoch in range(EPOCHS):

    model.train()

    running_loss = 0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = outputs.max(1)

        total += labels.size(0)

        correct += predicted.eq(labels).sum().item()

    train_accuracy = 100 * correct / total

    # ------------------------
    # Validation
    # ------------------------

    model.eval()

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)

            _, predicted = outputs.max(1)

            val_total += labels.size(0)

            val_correct += predicted.eq(labels).sum().item()

    val_accuracy = 100 * val_correct / val_total

    print(
        f"Epoch {epoch+1}/{EPOCHS}"
        f" | Loss: {running_loss:.4f}"
        f" | Train: {train_accuracy:.2f}%"
        f" | Validation: {val_accuracy:.2f}%"
    )

    # Save best model

    if val_accuracy > best_accuracy:

        best_accuracy = val_accuracy

        torch.save(
            model.state_dict(),
            CHECKPOINT_DIR / "best_model.pth"
        )

print("\nTraining Complete")
print(f"Best Validation Accuracy: {best_accuracy:.2f}%")