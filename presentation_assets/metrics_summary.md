# NeuroAssist — AI Model Evaluation & Performance Summary

## Executive Summary
NeuroAssist features a multi-modal, dual-AI architecture for acute stroke decision support and emergency inter-hospital handoffs. The system combines a deep convolutional neural network for non-contrast brain CT scan evaluation with a clinical tabular risk model trained on patient health records.

---

## 1. Image AI Vision Classifier (EfficientNet-B0)

### Architecture & Hyperparameters
- **Backbone Architecture:** Transfer learning with `EfficientNet-B0` (`timm` library implementation)
- **Pretraining:** ImageNet pre-trained weights fine-tuned on non-contrast brain CT scans
- **Input Resolution:** $224 \times 224 \times 3$ RGB (Normalized with ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`)
- **Loss Function:** Weighted Cross-Entropy Loss (Weights: `[Bleeding: 4.05, Ischemia: 3.92, Normal: 1.0]`)
- **Optimizer:** Adam Optimizer ($\text{learning rate} = 1 \times 10^{-4}$)
- **Learning Rate Scheduler:** `ReduceLROnPlateau` (factor = $0.5$, patience = $2$, mode = `max`)
- **Batch Size:** $16$
- **Epochs:** $10$
- **Target Classes (3):** `Bleeding` (Intracerebral Hemorrhage), `Ischemia` (Ischemic Infarction), `Normal` (Non-stroke)

### Empirical Validation Metrics (N = 1,330 Images)

| Metric | Overall Value |
| :--- | :--- |
| **Validation Accuracy** | **95.04%** |
| **Weighted Precision** | **95.12%** |
| **Weighted Recall / Sensitivity** | **95.04%** |
| **Weighted F1-Score** | **95.06%** |
| **Macro Average ROC-AUC** | **0.9800** |

### Per-Class Evaluation Breakdown

| Class | Precision | Recall (Sensitivity) | F1-Score | Support (Validation Images) |
| :--- | :--- | :--- | :--- | :--- |
| **Bleeding (Hemorrhage)** | `0.88` (88.37%) | `0.97` (97.26%) | `0.92` (92.41%) | 219 |
| **Ischemia (Infarct)** | `0.89` (89.18%) | `0.91` (91.15%) | `0.90` (90.15%) | 226 |
| **Normal (Non-stroke)** | `0.99` (98.60%) | `0.95` (95.37%) | `0.97` (96.95%) | 885 |
| **Total / Weighted Avg** | `0.95` (95.12%) | `0.95` (95.04%) | `0.95` (95.06%) | 1,330 |

### Validation Confusion Matrix

```
                      PREDICTED CLASS
                 Bleeding   Ischemia   Normal
ACTUAL   Bleeding   213        4         2    (Recall: 97.26%)
CLASS   Ischemia    10       206        10    (Recall: 91.15%)
         Normal     20        21       844    (Specificity: 95.37%)
```

---

## 2. Clinical Tabular AI Risk Model

### Dataset & Preprocessing
- **Dataset:** 5,110 patient electronic health records (EHR) containing clinical features (Age, Gender, Hypertension, Heart Disease, Glucose Level, BMI, Smoking Status).
- **Class Imbalance:** Handled using balanced class weighting during training.

### Empirical Model Performance Comparison

| Model | Accuracy | Precision | Recall (Sensitivity) | F1-Score | ROC-AUC | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **74.95%** | `13.99%` | **80.00%** | `0.2381` | **0.8419** | **Deployed (Baseline)** |
| **XGBoost Classifier** | `94.62%` | `30.77%` | `8.00%` | `0.1270` | `0.7984` | Tested |
| **Random Forest** | `94.13%` | `8.33%` | `2.00%` | `0.0323` | `0.7915` | Tested |

*Rationale:* Logistic Regression was selected for clinical deployment because it achieves the highest sensitivity (80.00% recall) and superior ROC-AUC (0.8419), ensuring acute stroke cases are not missed during triage.

---

## 3. Dataset Summary

| Dataset Partition | Bleeding | Ischemia | Normal | External Test | Total Scans |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Full Dataset** | 3,279 | 3,390 | 8,854 | 801 | **16,324** |
| **Training Split (80%)** | 2,623 | 2,712 | 7,083 | — | 12,418 |
| **Validation Split (20%)** | 656 | 678 | 1,771 | — | 3,105 |
| **Evaluated Sub-split** | 219 | 226 | 885 | — | 1,330 |

---

## 4. Explainable AI (Grad-CAM)
- **Layer Targeted:** `model.conv_head` (Final convolutional layer before global pool).
- **Visualization:** PyTorch Grad-CAM outputs high-resolution heatmaps overlaid on $224 \times 224$ CT images.
- **Clinical Utility:** Allows emergency physicians to visually verify neural focus areas against radiologic lesions (e.g., hyperdense blood collection in ICH or hypodense ischemic territory).
