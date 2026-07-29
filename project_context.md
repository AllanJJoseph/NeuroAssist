# NeuroAssist Project Context

This file is the working handoff log for the NeuroAssist hackathon frontend. It is meant to help the next teammate or agent understand what has already been built, how the app is structured, and what should happen next.

## Recent Updates

### Date of update: July 30, 2026

### Features implemented
- **Active navigation text color fix**: Fixed PillNav active text color by applying `!text-white` to guarantee the white color overrides any conflicting CSS hierarchy (like `a { color: inherit }`), and `!text-black` for inactive items.
- **Landing page spacing fix**: Removed the unwanted large vertical space above the "Designed for high-pressure clinical moments" card by changing the grid parent alignment from `lg:items-center` to `lg:items-start`, eliminating the empty space caused by vertical centering against the taller left column. Reverted the incorrect `CardTitle` margin fix.
- **Download Report button visibility fix**: explicitly defined default button variant as high contrast black background with white text, overriding previous light styling.
- Removed "Mock clinical workflow" button from the Navbar.
- Removed the global Footer component completely.
- Refactored WorkflowStepper to use a single moving black pill highlighting the active page.
- Created reusable fixed BackButton and NextButton components for workflow navigation.
- Added "CT Scan" and "MRI" options for upload with monochrome styling.
- Removed local preview text/spacing from the ScanUpload page.
- Fixed the "Download Report" button functionality and removed empty space.
- Ensured strictly monochrome theming (white background, black text/borders, removed gradient background).

### Files modified
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/WorkflowStepper.tsx`
- `src/components/layout/PillNav.tsx`
- `src/components/ui/button.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/ScanUploadPage.tsx`
- `src/pages/ReportPage.tsx`
- `src/index.css`
- `tailwind.config.js`
- `project_context.md`


### Files created
- `src/components/layout/BackButton.tsx`
- `src/components/layout/NextButton.tsx`

### Architecture changes
- Centralized `BackButton` and `NextButton` navigation inside `WorkflowStepper` instead of floating independently.

### Remaining TODOs
- Connect backend API (FastAPI) to frontend UI.

## Current Status
- Project scaffolded as a React + TypeScript + Vite application.
- Tailwind CSS is configured and the app now uses a black-and-white visual theme.
- React Router is wired for a multi-step workflow plus informational pages.
- Mock workflow state is centralized in a shared context.
- The main end-to-end frontend flow is implemented and working.
- The animated pill navigation, workflow stepper, back actions, and report download control are restored.
- `npm run build` passes.
- The dev server can be started with `npm run dev`.

## Current Architecture

- `src/main.tsx` mounts `BrowserRouter` and the workflow provider.
- `src/App.tsx` owns the route table and wraps every page in the shared app shell.
- `src/components/layout/` contains the global shell, navbar, footer, page container, section heading, and feature card wrappers.
- `src/components/ui/` contains the base design-system primitives used by the shared pages.
- `src/components/layout/` also includes `PillNav`, `WorkflowStepper`, `ThemeToggle`, and `PageHeader` for the restored navigation experience.
- `src/hooks/` currently contains `useTimeout` for the simulated processing redirect.
- `src/utils/routes.ts` centralizes route constants and the top-level navigation items.
- `src/types/navigation.ts` stores the shared navigation link type.

## Pages

- `LandingPage` keeps the original hero and workflow entry screen.
- `PatientPage` collects structured intake data.
- `ScanUploadPage` handles scan upload and preview.
- `ProcessingPage` simulates staged analysis and auto-redirects.
- `ResultsPage` presents the analysis dashboard.
- `ReportPage` renders the report view.
- `AboutPage` and `ContactPage` are professional placeholders.

## Routes

- `/` -> `LandingPage`
- `/patient` -> `PatientPage`
- `/scan` -> `ScanUploadPage`
- `/processing` -> `ProcessingPage`
- `/results` -> `ResultsPage`
- `/report` -> `ReportPage`
- `/about` -> `AboutPage`
- `/contact` -> `ContactPage`

## Components

- `Navbar` renders the app header and top navigation.
- `Footer` is used on the informational pages.
- `PageContainer` provides the shared page width and spacing wrapper.
- `SectionHeading` standardizes placeholder page headings.
- `FeatureCard` provides the shared card pattern for placeholder content.
- `PrimaryButton` and `SecondaryButton` wrap the base button primitive for consistent usage.

## What Has Been Built

### 1. App Foundation

- Replaced the default Vite starter content with the NeuroAssist app shell.
- Added `BrowserRouter` and a shared workflow provider in `src/main.tsx`.
- Reworked `src/App.tsx` into a route-driven workflow container with informational pages.

### 2. Workflow Pages

Implemented the full demo flow:

- Landing page
- Patient information form
- Brain scan upload page
- AI processing screen
- Results dashboard
- Clinical report page
- About page
- Contact page

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
- Navbar, pill navigation, and theme toggle
- Page header component
- Shared page wrappers and cards for reusable page scaffolding
- Risk meter
- Brain scan preview
- Contribution bars

### 6. Styling and Theming

- Replaced the default starter CSS with a monochrome global style in `src/index.css`.
- Added Tailwind configuration in `tailwind.config.js`.
- Added PostCSS configuration in `postcss.config.js`.
- Used a restrained black-and-white palette with neutral surfaces, rounded cards, and soft shadows.
- Added IBM Plex Sans for a more purposeful healthcare-friendly feel.

## Important Files

- [src/main.tsx](src/main.tsx)
- [src/App.tsx](src/App.tsx)
- [src/lib/workflow.ts](src/lib/workflow.ts)
- [src/context/workflow-context.tsx](src/context/workflow-context.tsx)
- [src/utils/routes.ts](src/utils/routes.ts)
- [src/types/navigation.ts](src/types/navigation.ts)
- [src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx)
- [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx)
- [src/components/layout/PillNav.tsx](src/components/layout/PillNav.tsx)
- [src/components/layout/WorkflowStepper.tsx](src/components/layout/WorkflowStepper.tsx)
- [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx)
- [src/components/layout/PageContainer.tsx](src/components/layout/PageContainer.tsx)
- [src/components/layout/SectionHeading.tsx](src/components/layout/SectionHeading.tsx)
- [src/components/layout/FeatureCard.tsx](src/components/layout/FeatureCard.tsx)
- [src/components/layout/PageHeader.tsx](src/components/layout/PageHeader.tsx)
- [src/pages/LandingPage.tsx](src/pages/LandingPage.tsx)
- [src/pages/PatientPage.tsx](src/pages/PatientPage.tsx)
- [src/pages/PatientInfoPage.tsx](src/pages/PatientInfoPage.tsx)
- [src/pages/ScanUploadPage.tsx](src/pages/ScanUploadPage.tsx)
- [src/pages/ProcessingPage.tsx](src/pages/ProcessingPage.tsx)
- [src/pages/ResultsPage.tsx](src/pages/ResultsPage.tsx)
- [src/pages/ReportPage.tsx](src/pages/ReportPage.tsx)
- [src/pages/ClinicalReportPage.tsx](src/pages/ClinicalReportPage.tsx)
- [src/pages/AboutPage.tsx](src/pages/AboutPage.tsx)
- [src/pages/ContactPage.tsx](src/pages/ContactPage.tsx)

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
- The report download button now exports a text report from the client; swap in real PDF generation if needed.
- The upload preview currently uses local browser file objects only.
- The new route constants in `src/utils/routes.ts` should be reused for any future navigation work.
- `useTimeout` is the preferred place for timed navigation behavior.

## Suggested Next Steps

1. Add a mock or real API client layer for FastAPI integration.
2. Replace the simulated processing flow with API-backed request/response handling.
3. Implement real PDF export for the clinical report.
4. Wire the placeholder About and Contact pages to real project or clinic data.
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
