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
