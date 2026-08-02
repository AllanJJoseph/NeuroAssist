from dataset import load_dataset
from config import DATASET_DIR, CLASSES

images, labels = load_dataset(DATASET_DIR)

for i, cls in enumerate(CLASSES):
    print(f"{cls}: {labels.count(i)}")