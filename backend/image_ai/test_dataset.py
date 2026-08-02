from dataset import load_dataset
from config import DATASET_DIR

images, labels = load_dataset(DATASET_DIR)

print(f"Images: {len(images)}")
print(f"Labels: {len(labels)}")
print(images[:5])