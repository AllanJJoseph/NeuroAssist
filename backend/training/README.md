# NeuroAssist Training Pipeline

This directory contains the training and evaluation workflow for the NeuroAssist stroke prediction model.

## Structure

- `datasets/` - training data inputs
- `outputs/plots/` - generated plots and figures
- `outputs/reports/` - generated evaluation reports
- `scripts/` - pipeline entry points
- `utils/` - shared training utilities

## Run

Install the dependencies in `requirements.txt`, place `healthcare-dataset-stroke-data.csv` in `datasets/`, then run:

```bash
cd backend/training/scripts
python train.py
```

The best fitted pipeline is saved to `backend/models/stroke_model.pkl`.
