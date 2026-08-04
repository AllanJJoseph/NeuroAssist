# NeuroAssist — Clinical AI Decision Support & Inter-Hospital Transfer Platform

> **Emergency AI Platform for Rapid Stroke Triage, CT Image Classification, Grad-CAM Explainability, and Inter-Hospital Referral Management.**

---

## 📋 Executive Overview & Problem Statement

### The Healthcare Challenge
Acute stroke is a time-critical emergency where **"Time is Brain"** — 1.9 million neurons die every minute treatment is delayed. 

In emergency departments and rural clinics, two critical bottlenecks cost patient lives:
1. **Diagnostic Triage Delay:** Distinguishing between **Ischemic Infarction** (thrombus blockage) and **Hemorrhagic Bleeding** (intracerebral hematoma) requires immediate Non-Contrast Head CT analysis. Administering thrombolytics (tPA) to a bleeding patient is fatal.
2. **Transfer Handoff Breakdown:** Primary stroke centers lacking 24/7 neuroradiology expertise suffer hours of delay transferring critical patients to tertiary receiving hospitals (e.g. Apollo Hospital).

### The NeuroAssist Solution
NeuroAssist provides a comprehensive, dual-AI clinical decision support ecosystem:
- **Dual-AI Intelligence:** Combines a **Clinical AI Risk Model** (EHR tabular analysis) with a deep **Vision AI Classifier (EfficientNet-B0)** to achieve **95.04% validation accuracy** and **97.26% bleeding sensitivity**.
- **PyTorch Grad-CAM Explainability:** Generates spatial activation heatmaps on head CT scans, providing transparent visual rationale for physician review.
- **Real-Time Stroke Clock:** Active onset-to-treatment timer monitoring the 4.5-hour golden window.
- **Inter-Hospital Referral Network:** Seamless, synchronized handoff between sending facilities (Aster Hospital) and receiving tertiary stroke units (Apollo Hospital Receiving Portal).

---

## 📐 System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 NeuroAssist Frontend                   │
                  │             (React 18 + TypeScript + Vite)             │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌──────────────────────────┐               ┌──────────────────────────┐
          │     Patient Registry     │               │    Live Stroke Clock     │
          │    (EHR & Intake Form)   │               │   (Onset-to-Treatment)   │
          └────────────┬─────────────┘               └─────────────┬────────────┘
                                             │
                       └─────────────────────┬─────────────────────┘
                                             ▼
                               ┌──────────────────────────┐
                               │     REST API Request     │
                               │    (FastAPI / Python)    │
                               └─────────────┬────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌──────────────────────────┐               ┌──────────────────────────┐
          │   Tabular Clinical AI    │               │     Vision AI Engine     │
          │  (Logistic Regression)   │               │   (EfficientNet-B0)    │
          │   Risk Probability %     │               │   Image Classification   │
          └──────────────────────────┘               └─────────────┬────────────┘
                                                                   │
                                                                   ▼
                                                     ┌──────────────────────────┐
                                                     │    PyTorch Grad-CAM      │
                                                     │   Spatial Explainability │
                                                     └─────────────┬────────────┘
                                                                   │
                       ┌───────────────────────────────────────────┘
                       ▼
          ┌──────────────────────────┐
          │ Clinical Report & PDF    │
          │  (jsPDF + Side-by-Side)  │
          └────────────┬─────────────┘
                       │
                       ▼
          ┌────────────────────────────────────────────────────────┐
          │          Apollo Hospital Receiving Portal              │
          │     (Real-Time Referral Dashboard & Acceptance)        │
          └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Domain | Technology / Framework | Description |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18, TypeScript, Vite** | Fast, responsive single-page clinical application |
| **Styling** | **TailwindCSS, Lucide Icons** | Custom design system (`bg-steel-50`, `shadow-card`, high-contrast UI) |
| **Backend API** | **FastAPI, Python 3.11+, Uvicorn** | High-performance asynchronous REST backend |
| **Deep Learning** | **PyTorch 2.x, timm, torchvision** | Vision AI inference and transfer learning |
| **Explainability** | **pytorch-grad-cam, OpenCV, NumPy** | Spatial gradient activation map generation |
| **Tabular AI** | **scikit-learn, XGBoost, pandas** | Risk stratification modeling |
| **PDF Generation** | **jsPDF, HTML5 Canvas** | Automated physician handoff PDF builder |
| **Deployment** | **Vercel (Frontend), GCP Cloud Run (Backend)** | Scalable serverless cloud infrastructure |

---

## 📊 Real AI Model Evaluation & Metrics

### 1. Vision AI Classifier (EfficientNet-B0)
- **Architecture:** EfficientNet-B0 pretrained on ImageNet, fine-tuned on non-contrast CT scans.
- **Input Dimensions:** $224 \times 224 \times 3$ RGB normalized tensor.
- **Hyperparameters:** Adam optimizer ($\text{lr} = 1\times 10^{-4}$), batch size 16, 10 epochs, weighted cross-entropy loss (`[4.05, 3.92, 1.0]`).
- **Validation Dataset:** 1,330 Non-Contrast Head CT Scans across 3 classes.

#### Empirical Performance Results
- **Overall Validation Accuracy:** **95.04%**
- **Weighted Precision:** **95.12%**
- **Weighted Recall / Sensitivity:** **95.04%**
- **Weighted F1 Score:** **95.06%**
- **Macro Average ROC-AUC:** **0.9800**

#### Per-Class Performance Breakdown

| Class | Precision | Recall (Sensitivity) | F1-Score | Validation Support |
| :--- | :--- | :--- | :--- | :--- |
| **Bleeding (Hemorrhage)** | `0.88` (88.37%) | `0.97` (97.26%) | `0.92` (92.41%) | 219 |
| **Ischemia (Infarct)** | `0.89` (89.18%) | `0.91` (91.15%) | `0.90` (90.15%) | 226 |
| **Normal (Non-stroke)** | `0.99` (98.60%) | `0.95` (95.37%) | `0.97` (96.95%) | 885 |

#### Validation Confusion Matrix

```
                      PREDICTED CLASS
                 Bleeding   Ischemia   Normal
ACTUAL   Bleeding   213        4         2    (Recall: 97.26%)
CLASS   Ischemia    10       206        10    (Recall: 91.15%)
         Normal     20        21       844    (Specificity: 95.37%)
```

---

### 2. Clinical Tabular Risk Model Comparison
Evaluated on 5,110 patient electronic health records:

| Model | Accuracy | Sensitivity (Recall) | Precision | F1-Score | ROC-AUC | Deployment Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **74.95%** | **80.00%** | `13.99%` | `0.2381` | **0.8419** | **Deployed Baseline** |
| **XGBoost Classifier** | `94.62%` | `8.00%` | `30.77%` | `0.1270` | `0.7984` | Evaluated |
| **Random Forest** | `94.13%` | `2.00%` | `8.33%` | `0.0323` | `0.7915` | Evaluated |

---

## 🔍 Explainable AI (Grad-CAM)

NeuroAssist extracts visual feature activations from `model.conv_head` using **Grad-CAM**.

![Case Study 1](./case_study_1.png)
*Figure 1: Ischemic Infarction Case Study showing CT scan, Grad-CAM activation heatmap, and AI clinical report.*

![Case Study 2](./case_study_2.png)
*Figure 2: Hemorrhagic Bleeding Case Study with 99.1% confidence score and dense hematoma localization.*

---

## 🏥 Hospital Referral Workflow

1. **Patient Intake & Registry:** Patient vitals and onset timestamp recorded at referring facility (Aster Hospital).
2. **Stroke Clock Initiation:** Live timer tracks door-to-needle window.
3. **AI Scan Upload & Triage:** Non-contrast head CT uploaded to Vision AI engine; Grad-CAM generated under 2 seconds.
4. **Automated PDF Handoff:** Structured clinical report generated with embedded side-by-side scans.
5. **Inter-Hospital Referral:** Transfer record dispatched to receiving tertiary care center (Apollo Hospital).
6. **Apollo Receiving Portal:** Receiving emergency team gets real-time notification, inspects Grad-CAM heatmap, and accepts transfer with timestamp audit trail.

---

## 📸 Key Application Screenshots & Asset References

- **Dataset Distribution:** [`dataset_distribution.png`](./dataset_distribution.png)
- **Training Curves:** [`combined_accuracy_loss.png`](./combined_accuracy_loss.png)
- **Confusion Matrix:** [`confusion_matrix.png`](./confusion_matrix.png)
- **ROC Curves:** [`roc_curve.png`](./roc_curve.png)
- **Precision-Recall Curves:** [`precision_recall_curve.png`](./precision_recall_curve.png)
- **Case Study 1 (Ischemia):** [`case_study_1.png`](./case_study_1.png)
- **Case Study 2 (Bleeding):** [`case_study_2.png`](./case_study_2.png)
- **Case Study 3 (Normal):** [`case_study_3.png`](./case_study_3.png)
- **Grad-CAM Asset Samples:** [`gradcam_examples/`](./gradcam_examples/)
- **PDF Report Summary:** [`metrics_summary.pdf`](./metrics_summary.pdf)

---

## 🚀 Setup & Local Installation

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & Virtualenv

### 1. Frontend Setup
```bash
# From project root
npm install
npm run dev
```
Open `http://localhost:5173` in browser.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
python app/main.py
```
Backend API will run at `http://localhost:8080`.

---

## 🌐 Production Deployment

- **Frontend:** Deployed on **Vercel** with automatic CI/CD builds.
- **Backend API:** Containerized with Docker and deployed on **Google Cloud Run** serverless infrastructure.
- **Apollo Receiving Portal:** Accessible via `/apollo` (Demo credentials: `apollo` / `1234`).

---

## 🔮 Future Scope & Roadmap

1. **Multi-Center Clinical Trial Validation:** prospective evaluation across 5 tertiary hospitals.
2. **PACS / DICOM Integration:** Native HL7 / FHIR / DICOM node integration for automated CT scan intake directly from scanner hardware.
3. **Subtype Expansion:** Multi-task classification of Subarachnoid Hemorrhage (SAH), Epidural Hematoma (EDH), and Large Vessel Occlusion (LVO).
