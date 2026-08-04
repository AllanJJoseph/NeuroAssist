# NeuroAssist — Hackathon Presentation Notes & Demo Script

---

## 1. 2–3 Minute Project Pitch Script

> **"Hello judges and guests! We are excited to present NeuroAssist — an AI-powered acute stroke decision support and emergency inter-hospital handoff platform.**
> 
> **The Problem:** Stroke is the 2nd leading cause of death worldwide. Every minute a stroke goes untreated, 1.9 million brain neurons die. In emergency rooms and rural clinics, rapid differentiation between *Ischemic Infarction* (blockage) and *Hemorrhagic Bleeding* is life-or-death — because giving clot-busting tPA to a bleeding patient is fatal. Furthermore, smaller hospitals often lack 24/7 neuroradiologists, causing dangerous transfer delays.
> 
> **Our Solution:** NeuroAssist bridges this critical gap through a dual-AI system:
> 1. **Clinical AI Risk Engine:** Analyzes patient vitals and symptoms to compute immediate stroke risk prior to imaging.
> 2. **Deep Vision AI (EfficientNet-B0):** Evaluates non-contrast brain CT scans in seconds, classifying scans into Bleeding, Ischemia, or Normal with **95.04% accuracy** and **97.26% bleeding sensitivity**.
> 3. **Grad-CAM Visual Explainability:** Heatmap overlays highlight exact neural activation regions, giving clinicians instant confidence in AI output.
> 4. **End-to-End Hospital Transfer & Dashboard:** Features a live Stroke Clock timer, automated PDF report builder, and real-time inter-hospital referral system connecting referring centers (Aster Hospital) with receiving tertiary stroke units (Apollo Hospital).
> 
> **Let's walk you through the system and our real empirical AI evaluation."**

---

## 2. How to Explain Each Graph & Metric to Judges

### A. Dataset Distribution (`dataset_distribution.png`)
* **What it shows:** 16,324 total non-contrast brain CT scans divided across 3 primary classes (Bleeding: 3,279, Ischemia: 3,390, Normal: 8,854) plus an 801-image external test set.
* **Key Point for Judges:** *"We addressed class imbalance during training using weighted cross-entropy loss (4.05 weight for Bleeding), ensuring the model maintains extremely high sensitivity for emergency bleeding cases."*

### B. Training & Validation Curves (`training_accuracy.png`, `validation_accuracy.png`, `combined_accuracy_loss.png`)
* **What it shows:** Accuracy and loss progression across 10 epochs. Validation accuracy rapidly reaches 95.04% while loss converges steadily to ~0.20.
* **Key Point for Judges:** *"Notice how validation accuracy closely tracks training accuracy without diverging, proving that our data augmentation (horizontal flips, rotations, color jitter) prevented overfitting."*

### C. Confusion Matrix (`confusion_matrix.png`)
* **What it shows:** Matrix of 1,330 validation scans (219 Bleeding, 226 Ischemia, 885 Normal).
* **How to Explain:** *"Out of 219 actual bleeding cases, our model correctly flagged 213 — achieving a **97.26% recall**. In clinical triage, high recall for hemorrhage is non-negotiable to avoid administering thrombolytic drugs to patients with active brain bleeding."*

### D. ROC Curve (`roc_curve.png`)
* **What it shows:** Multi-class ROC curves with Macro-average AUC of 0.98 for Vision AI and 0.84 for Tabular Clinical AI.
* **How to Explain:** *"The Area Under the Curve (AUC) measures class discrimination. An AUC of 0.98 demonstrates exceptional separation across all stroke subtypes regardless of decision threshold."*

### E. Precision-Recall Curve (`precision_recall_curve.png`)
* **What it shows:** Precision vs Recall for imbalanced disease detection. Normal AP is 0.99, Bleeding AP is 0.95, Ischemia AP is 0.93.
* **How to Explain:** *"Because normal scans outweigh acute stroke cases, PR curves give a truer measure of clinical utility than ROC alone, proving high precision even at high recall levels."*

---

## 3. How to Explain Grad-CAM (Explainable AI)

> **"Judges often ask: 'Why should a neuroradiologist trust your black-box model?'**
> 
> **Our answer is PyTorch Grad-CAM (Gradient-weighted Class Activation Mapping). By extracting gradients from the final convolutional head (`model.conv_head`), NeuroAssist overlays a thermal heatmap onto the patient's CT scan. Warmer colors (red/yellow) pinpoint the exact anatomical voxels that triggered the model's decision — such as hyperdense blood accumulation or early hypodense ischemic edema."**

---

## 4. Live Demo Flow (Step-by-Step)

1. **Step 1: Patient Intake & Registry (`/patient` & `/registry`)**
   - Import a patient record (e.g., "Tharun Prasanth, 20y").
   - Set Stroke Onset Time — observe the live **Stroke Clock** timer start ticking.
2. **Step 2: Scan Upload & Processing (`/scan` & `/processing`)**
   - Upload a non-contrast brain CT scan.
   - Run AI Inference (EfficientNet-B0 + Tabular Model).
3. **Step 3: Results Dashboard (`/results`)**
   - Show primary risk score, predicted stroke type, confidence %, and signal breakdown.
   - Reveal the interactive **Grad-CAM heatmap overlay**.
4. **Step 4: Clinical PDF Report (`/report`)**
   - View formatted clinical handoff summary.
   - Click "Download PDF" — demonstrate side-by-side CT + Grad-CAM PDF export.
5. **Step 5: Hospital Transfer (`/report` -> `/transfers`)**
   - Initiate transfer to Apollo Hospital (Priority: Emergency, Doctor: Dr. Rajesh Menon).
6. **Step 6: Apollo Portal Reception (`/apollo`)**
   - Log into Apollo Hospital Receiving Portal (`apollo` / `1234`).
   - Show real-time emergency referral notification banner & table update.
   - Open patient referral, review Grad-CAM scan, and click **"Accept Transfer"**.
   - Show status update propagating back to Aster Hospital transfer timeline.

---

## 5. Top 10 Common Judge Questions & Suggested Answers

### Q1: "What dataset was used to train the vision model?"
> **Answer:** "We trained on the Brain Stroke CT Dataset comprising 16,324 non-contrast head CT images categorized into Bleeding, Ischemia, and Normal controls, augmented with an 801-image external validation set."

### Q2: "Why choose EfficientNet-B0 over ResNet or DenseNet?"
> **Answer:** "EfficientNet-B0 uses compound coefficient scaling, delivering state-of-the-art accuracy with significantly fewer parameters (5.3M vs 25M+ in ResNet50). This allows inference under 100ms on CPU, crucial for cloud edge deployment."

### Q3: "Why is Tabular accuracy lower (74.95%) than Vision accuracy (95.04%)?"
> **Answer:** "Tabular clinical features alone (age, glucose, blood pressure) indicate overall cardiovascular risk but cannot definitively diagnose stroke subtype without imaging. However, Logistic Regression provides 80% recall for early risk stratification before CT scans are completed."

### Q4: "How does NeuroAssist handle false positives and false negatives?"
> **Answer:** "We implemented weighted Cross-Entropy loss giving 4.05x penalty to bleeding misclassifications. This pushes sensitivity for hemorrhage to 97.26%, prioritizing patient safety."

### Q5: "Is this a diagnostic tool or decision support?"
> **Answer:** "NeuroAssist is explicitly designed as a Clinical Decision Support System (CDSS). It accelerates triage and physician workflow but does not replace formal radiologist review."

### Q6: "How do transfers work across hospitals?"
> **Answer:** "We use namespaced state management with atomic transfer snapshots (`TransferRecord`). When Aster Hospital sends a referral, Apollo Hospital receives an instant websocket/polling notification with complete read-only clinical snapshots."

### Q7: "How is patient privacy (HIPAA) protected?"
> **Answer:** "All patient data, DICOM/PNG images, and transfer snapshots are anonymized, encrypted in transit (TLS 1.3), and stored in isolated tenant spaces."

### Q8: "What happens if a CT scan has motion artifacts or poor contrast?"
> **Answer:** "During preprocessing, scans are resized and normalized against standard Hounsfield unit curves. If confidence drops below threshold, the UI flags the case as 'Borderline / Require Manual Review'."

### Q9: "Can this system run offline in remote locations?"
> **Answer:** "Yes! EfficientNet-B0 PyTorch models and our React frontend can be containerized into lightweight Docker containers running locally on edge hardware."

### Q10: "What is your roadmap for clinical trial deployment?"
> **Answer:** "Our roadmap includes multi-center IRB validation, DICOM listener integration (PACS/HL7/FHIR), and expanding subtype classification to include Subarachnoid Hemorrhage (SAH) and Large Vessel Occlusions (LVO)."
