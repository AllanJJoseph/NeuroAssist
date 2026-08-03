# NeuroAssist Image AI

Reusable image-classification pipeline for the NeuroAssist backend.

## Structure

- `config.py` stores paths and training constants.
- `models/` contains EfficientNet model helpers.
- `utils/` contains dataset loading, transforms, and metrics helpers.
- `services/` contains training, evaluation, and inference logic.
- `visualization/` contains Grad-CAM generation helpers.
- `scripts/` contains thin command-line entry points.

## Run

From `backend/image_ai`:

```bash
python train.py
python evaluate.py
python predict.py test_images/bleeding.png
python gradcam.py
```

The best checkpoint is saved to `checkpoints/best_model.pth`.
