# NeuroAssist Project Context

This file is the working handoff log for the NeuroAssist hackathon frontend. It is meant to help the next teammate or agent understand what has already been built, how the app is structured, and what should happen next.

## Current Status

- Project scaffolded as a React + TypeScript + Vite application.
- Tailwind CSS is configured and the app uses a clean medical-style UI theme.
- React Router is wired for a multi-step workflow.
- Mock workflow state is centralized in a shared context.
- The main end-to-end frontend flow is implemented and working.
- `npm run build` and `npm run lint` both pass.
- The dev server can be started with `npm run dev`.

## What Has Been Built

### 1. App Foundation

- Replaced the default Vite starter content with the NeuroAssist app shell.
- Added `BrowserRouter` and a shared workflow provider in `src/main.tsx`.
- Reworked `src/App.tsx` into a route-driven workflow container.

### 2. Workflow Pages

Implemented the full demo flow:

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
- [src/pages/LandingPage.tsx](src/pages/LandingPage.tsx)
- [src/pages/PatientInfoPage.tsx](src/pages/PatientInfoPage.tsx)
- [src/pages/ScanUploadPage.tsx](src/pages/ScanUploadPage.tsx)
- [src/pages/ProcessingPage.tsx](src/pages/ProcessingPage.tsx)
- [src/pages/ResultsPage.tsx](src/pages/ResultsPage.tsx)
- [src/pages/ClinicalReportPage.tsx](src/pages/ClinicalReportPage.tsx)

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

## Notes For The Next Teammate

- The app is frontend-only right now and uses mock data.
- Authentication, database access, permissions, and hospital management are intentionally not implemented.
- The current architecture is ready for a FastAPI backend to be added later without major restructuring.
- The report download button is a placeholder and does not yet generate a PDF.
- The upload preview currently uses local browser file objects only.

## Suggested Next Steps

1. Add a mock or real API client layer for FastAPI integration.
2. Replace the simulated processing flow with API-backed request/response handling.
3. Implement real PDF export for the clinical report.
4. Add stronger form validation and a nicer patient summary review step if needed.
5. Swap the temporary mock analysis with backend-driven results once the API exists.

## Handoff Summary

The app is in a usable demo state. A new teammate can open the repo, run the app, and continue by wiring backend services, improving validation, or polishing the report/export flow.

---

# NeuroAssist Backend Context

This section tracks the FastAPI backend work that was added after the frontend handoff notes above.

## Current Status

- Backend scaffolded under `backend/` as a modular FastAPI project.
- Pydantic request and response models are implemented for every endpoint.
- Mock AI services are separated from the API layer so real ML models can replace them later without changing the contract.
- Upload handling saves files into `backend/uploads/` with validation and size checks.
- Automatic Swagger docs are available at `/docs` once the backend is running.
- The backend package compiles successfully with `python -m compileall backend/app`.

## Implemented Endpoints

- `GET /` returns a JSON health message and API version.
- `POST /predict` accepts structured patient data and returns mock stroke risk results.
- `POST /upload-scan` accepts multipart scan uploads, validates file type, saves the file, and returns the stored filename.
- `POST /analyze-scan` returns mock imaging analysis including stroke type, confidence, lesion location, and a placeholder heatmap path.
- `POST /generate-report` returns a structured clinical report with patient summary, AI findings, risk factors, suggested considerations, confidence, and disclaimer.

## Backend File Layout

- `backend/app/main.py` creates the FastAPI app, CORS setup, and error handlers.
- `backend/app/core/config.py` contains environment-driven settings and upload path configuration.
- `backend/app/api/` contains the router and endpoint modules.
- `backend/app/schemas/` contains the Pydantic models and enums.
- `backend/app/services/` contains the mock AI logic for prediction, scan analysis, and report generation.
- `backend/app/utils/` contains shared scoring, file validation, and upload helpers.
- `backend/uploads/` is the persisted upload target.

## Backend Run Instructions

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Notes For The Next Backend Teammate

- The API contract is intentionally stable and mock-driven so the service layer can later call real ML models or FastAPI dependencies without route changes.
- The upload endpoint currently supports common image formats and DICOM-like files; tighten or expand that list once the real imaging flow is defined.
- The report endpoint expects nested patient, prediction, and scan-analysis payloads so it can stay stateless.
- If the frontend starts calling the backend, the CORS defaults already allow `localhost:5173`.

## Suggested Next Steps

1. Replace the mock service functions with real model inference adapters.
2. Add persistent storage or object storage for uploaded scan files if needed.
3. Add automated tests for request validation and endpoint contracts.
4. Add a small frontend API client that points to these endpoints.
