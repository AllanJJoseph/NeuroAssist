import os
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

BASE_DIR = Path(r"c:\Users\allan\Desktop\NeuroAssist")
PRESENTATION_DIR = BASE_DIR / "presentation_assets"
OUTPUT_PATH = PRESENTATION_DIR / "system_architecture.png"

print("Generating System Architecture diagram image at:", OUTPUT_PATH)

# Setup Figure
fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
fig.patch.set_facecolor('#f8fafc')
ax.set_facecolor('#f8fafc')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Title Header
ax.text(50, 96, "NeuroAssist — System Architecture & Data Flow Diagram",
        fontsize=20, fontweight='bold', ha='center', va='center', color='#0f172a')
ax.text(50, 93, "Dual-AI Clinical Decision Support & Inter-Hospital Emergency Transfer Network",
        fontsize=12, fontweight='bold', ha='center', va='center', color='#475569')

# Helper function to draw rounded box cards
def draw_card(x, y, w, h, title, bg_color='#ffffff', border_color='#0f172a', title_color='#0f172a', subtitle=None):
    rect = patches.FancyBboxPatch((x, y), w, h,
                                  boxstyle="round,pad=0.5,rounding_size=1.5",
                                  facecolor=bg_color, edgecolor=border_color, linewidth=1.8, zorder=2)
    ax.add_patch(rect)
    if title:
        ax.text(x + w/2, y + h - 2.5, title, fontsize=11, fontweight='bold', ha='center', va='center', color=title_color, zorder=3)
    if subtitle:
        ax.text(x + w/2, y + h - 5.5, subtitle, fontsize=8.5, fontweight='normal', ha='center', va='center', color='#475569', zorder=3)

# -------------------------------------------------------------
# LAYER 1: CLIENT LAYER (TOP)
# -------------------------------------------------------------
draw_card(4, 66, 92, 23, "1. FRONTEND APPLICATION LAYER (React 18 + TypeScript + Vite SPA)", bg_color='#ffffff', border_color='#1e293b')

# Client Sub-modules
draw_card(7, 69, 16, 14, "Patient Intake", bg_color='#eff6ff', border_color='#3b82f6', subtitle="EHR Registry & Importer\n(/patient, /registry)")
draw_card(25, 69, 16, 14, "Stroke Clock", bg_color='#fef3c7', border_color='#f59e0b', subtitle="Live Onset Timer\n(Golden 4.5h Window)")
draw_card(43, 69, 16, 14, "Scan Upload", bg_color='#f1f5f9', border_color='#475569', subtitle="CT Scan Processor\n(/scan, /processing)")
draw_card(61, 69, 16, 14, "Results & GradCAM", bg_color='#f0fdf4', border_color='#10b981', subtitle="Visual Risk Gauge\n(/results)")
draw_card(79, 69, 15, 14, "Apollo Portal", bg_color='#faf5ff', border_color='#a855f7', subtitle="Receiving Dashboard\n(/apollo)")

# -------------------------------------------------------------
# LAYER 2: BACKEND REST API (MIDDLE)
# -------------------------------------------------------------
draw_card(4, 41, 92, 19, "2. BACKEND API SERVICE (FastAPI + Python 3.11 + Uvicorn)", bg_color='#ffffff', border_color='#0f172a')

# API Endpoints
draw_card(8, 44, 26, 11, "POST /api/predict/clinical", bg_color='#f0f9ff', border_color='#0284c7', subtitle="Tabular Risk Assessment & Probability")
draw_card(37, 44, 26, 11, "POST /api/predict/image", bg_color='#fdf2f8', border_color='#db2777', subtitle="EfficientNet Inference & Grad-CAM")
draw_card(66, 44, 26, 11, "GET /static/heatmaps", bg_color='#f7fee7', border_color='#65a30d', subtitle="Static Grad-CAM Heatmap Fileserver")

# -------------------------------------------------------------
# LAYER 3: DUAL-AI ENGINE (BOTTOM LEFT & CENTER)
# -------------------------------------------------------------
draw_card(4, 15, 60, 21, "3. DUAL-AI PREDICTION ENGINE", bg_color='#ffffff', border_color='#0f172a')

draw_card(7, 18, 26, 13, "Clinical Tabular Model", bg_color='#f8fafc', border_color='#334155', subtitle="Logistic Regression (84.2% AUC)\nVitals & EHR Risk Factors")
draw_card(35, 18, 26, 13, "Vision AI & Grad-CAM", bg_color='#fef2f2', border_color='#ef4444', subtitle="EfficientNet-B0 (95.0% Acc)\nPyTorch Grad-CAM Heatmap")

# -------------------------------------------------------------
# LAYER 4: REFERRAL & STORAGE (BOTTOM RIGHT)
# -------------------------------------------------------------
draw_card(67, 15, 29, 21, "4. DATA & REFERRAL LAYER", bg_color='#ffffff', border_color='#0f172a')

draw_card(69, 18, 25, 13, "Inter-Hospital Handoff", bg_color='#f0fdf4', border_color='#16a34a', subtitle="Aster -> Apollo Referral\nAudit: Pending -> Accepted")

# -------------------------------------------------------------
# DEPLOYMENT BADGES (BOTTOM FOOTER)
# -------------------------------------------------------------
draw_card(4, 2, 44, 9, "Frontend Infrastructure", bg_color='#1e293b', border_color='#0f172a', title_color='#ffffff', subtitle="Vercel Edge CDN  •  React 18 SPA  •  Vite Build")
draw_card(52, 2, 44, 9, "Backend Infrastructure", bg_color='#1e293b', border_color='#0f172a', title_color='#ffffff', subtitle="GCP Cloud Run / Docker Container  •  FastAPI  •  PyTorch CPU")

# -------------------------------------------------------------
# ARROWS & CONNECTORS
# -------------------------------------------------------------
# Connector L1 -> L2
ax.annotate('', xy=(50, 60), xytext=(50, 66),
            arrowprops=dict(arrowstyle="->", color='#0284c7', lw=2.5, mutation_scale=15))
ax.text(52, 63, "HTTP REST / JSON Payload", fontsize=9, fontweight='bold', color='#0284c7', va='center')

# Connector L2 -> L3
ax.annotate('', xy=(21, 35), xytext=(21, 41),
            arrowprops=dict(arrowstyle="->", color='#0f172a', lw=2, mutation_scale=12))
ax.annotate('', xy=(48, 35), xytext=(48, 41),
            arrowprops=dict(arrowstyle="->", color='#0f172a', lw=2, mutation_scale=12))

# Connector L3 -> L4 (Transfer Flow)
ax.annotate('', xy=(67, 25), xytext=(61, 25),
            arrowprops=dict(arrowstyle="->", color='#16a34a', lw=2.5, mutation_scale=15))
ax.text(64, 27, "Transfer Record", fontsize=8.5, fontweight='bold', color='#16a34a', ha='center')

plt.tight_layout()
plt.savefig(OUTPUT_PATH, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved system_architecture.png successfully!")
