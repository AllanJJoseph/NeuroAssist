import os
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from PIL import Image

BASE_DIR = Path(r"c:\Users\allan\Desktop\NeuroAssist")
PRESENTATION_DIR = BASE_DIR / "presentation_assets"
PDF_PATH = PRESENTATION_DIR / "metrics_summary.pdf"

print("Generating PDF report at:", PDF_PATH)

with PdfPages(PDF_PATH) as pdf:
    # Page 1: Cover & Executive Summary
    fig = plt.figure(figsize=(8.5, 11), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    plt.axis('off')
    
    header_text = (
        "NeuroAssist — AI Evaluation & Performance Report\n"
        "===========================================================\n"
        "Official Hackathon Model Evaluation & Clinical Metrics\n"
        "Date: August 2026  |  System Status: Deployed & Validated\n\n"
    )
    plt.text(0.08, 0.92, header_text, fontsize=12, fontweight='bold', family='sans-serif', color='#0f172a')
    
    exec_summary = (
        "EXECUTIVE SUMMARY & SYSTEM HIGHLIGHTS\n"
        "-----------------------------------------------------------------------------------\n"
        "NeuroAssist deploys a dual-AI decision support architecture combining deep computer vision\n"
        "with clinical tabular risk modeling for rapid stroke triage & inter-hospital handoff:\n\n"
        "1. Image AI Vision Classifier (EfficientNet-B0 Transfer Learning):\n"
        "   • Evaluated on 1,330 validation Brain CT scans across 3 diagnostic classes.\n"
        "   • Overall Validation Accuracy: 95.04% (Weighted F1-Score: 0.95, Precision: 0.95).\n"
        "   • High-precision Bleeding/Hemorrhage recall: 97.26% (Critical for emergency intervention).\n"
        "   • Integrated PyTorch Grad-CAM visual explainability for spatial lesion localization.\n\n"
        "2. Clinical Tabular Risk Model (Logistic Regression Baseline):\n"
        "   • Evaluated on 5,110 patient clinical electronic health records (EHR).\n"
        "   • Area Under ROC Curve (ROC-AUC): 0.8419 with High Sensitivity (Recall: 80.00%).\n"
        "   • Provides immediate stroke probability & signal breakdown prior to imaging.\n\n"
        "3. Inter-Hospital Emergency Workflow Integration:\n"
        "   • Real-time Stroke Clock monitoring onset & door-to-treatment windows.\n"
        "   • Synchronized referral pipeline between Aster Hospital & Apollo Hospital portal.\n"
        "   • Automated physician PDF report generation with side-by-side Grad-CAM visualizations."
    )
    plt.text(0.08, 0.52, exec_summary, fontsize=9.5, family='monospace', verticalalignment='top',
             bbox=dict(boxstyle="round,pad=0.8", facecolor='#f8fafc', edgecolor='#0f172a', linewidth=1.2))
             
    table_text = (
        "SUMMARY PERFORMANCE METRICS TABLE\n"
        "-----------------------------------------------------------------------------------\n"
        "Metric                 Image AI (EfficientNet-B0)    Tabular AI (Logistic Reg.)\n"
        "-----------------------------------------------------------------------------------\n"
        "Accuracy               95.04%                         74.95%\n"
        "Sensitivity / Recall   95.04% (Bleeding: 97.26%)      80.00%\n"
        "Precision (Weighted)   95.12%                         13.99%\n"
        "F1 Score (Weighted)    95.06%                         23.81%\n"
        "ROC-AUC                0.9800 (Macro Avg)             0.8419\n"
        "Evaluation Dataset     1,330 Validation CT Scans      5,110 Patient Records\n"
        "-----------------------------------------------------------------------------------"
    )
    plt.text(0.08, 0.22, table_text, fontsize=9.5, family='monospace', verticalalignment='top',
             bbox=dict(boxstyle="round,pad=0.8", facecolor='#f1f5f9', edgecolor='#64748b', linewidth=1.0))
             
    pdf.savefig(fig)
    plt.close()
    
    # Page 2: Image AI Deep Dive & Confusion Matrix
    fig = plt.figure(figsize=(8.5, 11), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    plt.axis('off')
    
    plt.text(0.08, 0.94, "IMAGE AI (EFFICIENTNET-B0) PERFORMANCE & CONFUSION MATRIX", fontsize=12, fontweight='bold', color='#0f172a')
    
    img_cm = Image.open(PRESENTATION_DIR / "confusion_matrix.png")
    ax_cm = fig.add_axes([0.1, 0.45, 0.8, 0.42])
    ax_cm.imshow(img_cm)
    ax_cm.axis('off')
    
    cm_text = (
        "CONFUSION MATRIX ANALYSIS (N = 1,330 Validation CT Scans):\n"
        "• Bleeding (Hemorrhage): 213 correctly identified, 4 misclassified as Ischemia, 2 as Normal (Recall: 97.26%).\n"
        "• Ischemia (Infarct):    206 correctly identified, 10 misclassified as Bleeding, 10 as Normal (Recall: 91.15%).\n"
        "• Normal (Non-stroke):   844 correctly identified, 20 misclassified as Bleeding, 21 as Ischemia (Specificity: 95.37%)."
    )
    plt.text(0.08, 0.38, cm_text, fontsize=9, family='monospace', verticalalignment='top',
             bbox=dict(boxstyle="round,pad=0.6", facecolor='#f8fafc', edgecolor='#0f172a', linewidth=1.0))
             
    img_curve = Image.open(PRESENTATION_DIR / "combined_accuracy_loss.png")
    ax_curve = fig.add_axes([0.1, 0.05, 0.8, 0.28])
    ax_curve.imshow(img_curve)
    ax_curve.axis('off')
    
    pdf.savefig(fig)
    plt.close()
    
    # Page 3: ROC & Precision-Recall Curves
    fig = plt.figure(figsize=(8.5, 11), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    plt.axis('off')
    
    plt.text(0.08, 0.94, "ROC & PRECISION-RECALL CURVES", fontsize=12, fontweight='bold', color='#0f172a')
    
    img_roc = Image.open(PRESENTATION_DIR / "roc_curve.png")
    ax_roc = fig.add_axes([0.1, 0.50, 0.8, 0.38])
    ax_roc.imshow(img_roc)
    ax_roc.axis('off')
    
    img_pr = Image.open(PRESENTATION_DIR / "precision_recall_curve.png")
    ax_pr = fig.add_axes([0.1, 0.08, 0.8, 0.38])
    ax_pr.imshow(img_pr)
    ax_pr.axis('off')
    
    pdf.savefig(fig)
    plt.close()

    # Page 4: Explainable AI & Case Studies
    fig = plt.figure(figsize=(8.5, 11), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    plt.axis('off')
    
    plt.text(0.08, 0.94, "EXPLAINABLE AI (GRAD-CAM) CASE STUDIES", fontsize=12, fontweight='bold', color='#0f172a')
    
    img_c1 = Image.open(PRESENTATION_DIR / "case_study_1.png")
    ax_c1 = fig.add_axes([0.05, 0.50, 0.9, 0.40])
    ax_c1.imshow(img_c1)
    ax_c1.axis('off')
    
    img_c2 = Image.open(PRESENTATION_DIR / "case_study_2.png")
    ax_c2 = fig.add_axes([0.05, 0.08, 0.9, 0.40])
    ax_c2.imshow(img_c2)
    ax_c2.axis('off')
    
    pdf.savefig(fig)
    plt.close()

print("Successfully generated metrics_summary.pdf")
