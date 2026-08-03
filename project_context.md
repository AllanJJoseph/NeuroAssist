# NeuroAssist Project Context

This file is the working handoff log for the NeuroAssist NeuroAssist project. It is meant to help the next teammate or agent understand what has already been built, how the app is structured, and what should happen next.

## Current Status

- Project scaffolded as a React + TypeScript + Vite application.
- Tailwind CSS is configured and the app uses a clean medical-style UI theme.
- React Router is wired for a multi-step workflow.
- Mock workflow state is centralized in a shared context.
- The main end-to-end frontend flow is implemented and working.
- `npm run build` and `npm run lint` both pass.
- The dev server can be started with `npm run dev`.
- The backend now includes a retrained stroke prediction pipeline under `backend/training/`.
- The saved production model is expected at `backend/models/stroke_model.pkl`.
- FastAPI prediction now consumes the trained pipeline directly instead of mock logic.
- Login page is the default entry point (`/`). Landing page is at `/home`.
- Create Account page is available at `/register`.
- Login and Create Account are standalone pages rendered outside AppShell (no Navbar, no Stepper).
- Authentication state is managed via `AuthContext` backed by `sessionStorage`.
- All app routes (`/home`, `/patient`, `/scan`, `/processing`, `/results`, `/report`, `/about`, `/contact`) are protected by `ProtectedRoute` — unauthenticated access redirects to `/`.
- Navbar includes a Logout button that clears session and redirects to the Login page.
- Visiting `/` or `/register` while already authenticated redirects to `/home`.
- Login page uses a split-screen two-panel layout: left panel shows a full-height hero with an auto-playing fade slideshow (5 images, 2.5s interval, infinite loop) and hero text; right panel contains the login card (unchanged). Left panel is hidden on mobile.
- Left panel hero text: "NeuroAssist" (large bold primary heading) above a slightly smaller "Clinical Decision Support Platform" and subtitle. All text has a transparent background with subtle text-shadow for readability.
- Slideshow image captions are plain white text with no pill/box background.
- Slideshow images are served from `public/images/` (slide1.jpg – slide5.jpg).

## What Has Been Built

### 1. App Foundation

- Replaced the default Vite starter content with the NeuroAssist app shell.
- Added `BrowserRouter` and a shared workflow provider in `src/main.tsx`.
- Reworked `src/App.tsx` into a route-driven workflow container.

### 2. Workflow Pages

Implemented the full demo flow:

- Login page (No backend auth)
- Landing page
- Patient information form
- Brain scan upload page
- AI processing screen
- Results dashboard
- Clinical report page

### 3. Shared State and Mock Analysis

Added a central workflow model in `src/lib/workflow.ts` and `src/context/workflow-context.tsx` that stores:

- Patient demographic and clinical fields
- Scan metadata and upload state
- Mock analysis output

The mock analysis generates:

- Stroke probability
- Confidence score
- Predicted stroke type
- Risk level
- Risk factors
- Suggested clinical considerations
- Imaging summary and lesion location
- Report summary text

### 4. Reusable UI Layer

Created a small shadcn-style component layer in `src/components/ui/` including:

- Button
- Card
- Input
- Label
- Select
- Textarea
- Badge
- Progress
- Separator

### 5. Layout and Visual Components

Added reusable layout and visual components in `src/components/layout/` and `src/components/visuals/`:

- App shell with workflow stepper
- Page header component
- Risk meter
- Brain scan preview
- Contribution bars

### 6. Styling and Theming

- Replaced the default starter CSS with a medical-themed global style in `src/index.css`.
- Added Tailwind configuration in `tailwind.config.js`.
- Added PostCSS configuration in `postcss.config.js`.
- Used a restrained clinical palette with white backgrounds, blue accents, gray surfaces, rounded cards, and soft shadows.
- Added IBM Plex Sans for a more purposeful healthcare-friendly feel.

## Important Files

- [src/main.tsx](src/main.tsx)
- [src/App.tsx](src/App.tsx)
- [src/lib/workflow.ts](src/lib/workflow.ts)
- [src/context/workflow-context.tsx](src/context/workflow-context.tsx)
- [src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx)
- [src/components/layout/PageHeader.tsx](src/components/layout/PageHeader.tsx)
- [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)
- [src/pages/LandingPage.tsx](src/pages/LandingPage.tsx)
- [src/pages/PatientInfoPage.tsx](src/pages/PatientInfoPage.tsx)
- [src/pages/ScanUploadPage.tsx](src/pages/ScanUploadPage.tsx)
- [src/pages/ProcessingPage.tsx](src/pages/ProcessingPage.tsx)
- [src/pages/ResultsPage.tsx](src/pages/ResultsPage.tsx)
- [src/pages/ClinicalReportPage.tsx](src/pages/ClinicalReportPage.tsx)

## Backend Training Pipeline

The production training workflow now lives under `backend/training/` and is designed around the seven frontend-available patient features only:

- `gender`
- `age`
- `hypertension`
- `heart_disease`
- `avg_glucose_level`
- `bmi`
- `smoking_status`

### Training Structure

- `backend/training/datasets/healthcare-dataset-stroke-data.csv` holds the source dataset.
- `backend/training/scripts/train.py` trains Logistic Regression, Random Forest, and XGBoost.
- `backend/training/scripts/preprocess.py` builds the shared preprocessing pipeline.
- `backend/training/scripts/evaluate.py` computes evaluation metrics and writes comparison artifacts.
- `backend/training/scripts/eda.py` produces exploratory data analysis outputs.
- `backend/training/scripts/predict.py` provides model loading and inference helpers.
- `backend/training/utils/paths.py` centralizes training and output paths.
- `backend/training/utils/data_loader.py` validates and loads the dataset.
- `backend/training/utils/visualization.py` handles EDA and evaluation plots.

### Training Outputs

- Model artifacts are saved to `backend/models/stroke_model.pkl`.
- Plots are written to `backend/training/outputs/plots/`.
- Reports are written to `backend/training/outputs/reports/`.

### Training Run Command

From the project root:

```bash
python backend/training/scripts/train.py
```

### Prediction Integration

- `backend/app/services/prediction_service.py` now loads the trained pipeline from `backend/models/stroke_model.pkl` once at import time.
- The prediction request is mapped manually to a seven-column pandas DataFrame in the exact order expected by the retrained model.
- The FastAPI response structure remains unchanged.

## How to Run

```bash
npm install
npm run dev
```

For validation:

```bash
npm run lint
npm run build
```

## Backend Context

This section tracks the FastAPI backend and training integration that now coexist in the same repository.

## Current Status

- Backend scaffolded under `backend/` as a modular FastAPI project.
- Pydantic request and response models are implemented for every endpoint.
- Upload handling saves files into `backend/uploads/` with validation and size checks.
- Automatic Swagger docs are available at `/docs` once the backend is running.
- The backend package compiles successfully with `python -m compileall backend/app`.

## Implemented Endpoints

- `GET /` returns a JSON health message and API version.
- `POST /predict` accepts structured patient data and returns model-driven stroke risk results using `stroke_model.pkl`.
- `POST /patient` validates patient information, creates an in-memory patient record, and returns a unique `patientId`.
- `POST /upload` accepts CT/MRI scan uploads, validates file type, saves to `uploads/`, and returns `uploadId`.
- `POST /process` receives `patientId` and `uploadId`, runs the trained ML prediction model and scan analysis, and generates complete results & report.
- `GET /status/{id}` returns the processing status (`queued`, `processing`, `completed`, `failed`) and progress for a task ID.
- `GET /results/{id}` returns complete stroke prediction, risk level, confidence, recommendations, and risk factors.
- `GET /report/{id}` returns the structured clinical report object.
- `GET /download/{id}` streams a downloadable `.txt` report file attachment.
- `POST /upload-scan` accepts multipart scan uploads (legacy endpoint).
- `POST /analyze-scan` returns mock imaging analysis (legacy endpoint).
- `POST /generate-report` returns a structured clinical report (legacy endpoint).

## Backend File Layout

- `backend/app/main.py` creates the FastAPI app, CORS setup, and error handlers.
- `backend/app/core/config.py` contains environment-driven settings and upload path configuration.
- `backend/app/api/` contains the router and endpoint modules.
- `backend/app/schemas/` contains the Pydantic models and enums.
- `backend/app/services/` contains the prediction, scan analysis, and report service logic.
- `backend/app/utils/` contains shared helpers.
- `backend/models/` stores the trained `stroke_model.pkl` artifact.
- `backend/training/` contains the retraining workflow, dataset, plots, reports, and reusable helpers.
- `backend/uploads/` is the persisted upload target.

## Backend Run Instructions

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Training Run Instructions

```bash
python backend/training/scripts/train.py
```

## Notes For The Next Backend Teammate

- The prediction service now depends on `backend/models/stroke_model.pkl` being present.
- The retrained model only expects the seven frontend-available patient features listed above.
- The training pipeline saves comparison reports and plots under `backend/training/outputs/`.
- If the frontend starts calling the backend, the CORS defaults already allow `localhost:5173`.

## Suggested Next Steps

1. Add automated tests for the new model-backed prediction path.
2. Add a small frontend API client that points to the backend endpoints.
3. Populate the training dataset with the real CSV contents before retraining.
