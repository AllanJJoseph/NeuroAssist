# Create Account & Login Flow Report

## Objective
Implement Login as the default entry point, add an "Invalid credentials" error state on the Login page, and build a fully functional Create Account page — all within the existing monochrome design system.

## Features Completed

### 1. Login as Default Page
- `http://localhost:5173/` now opens the Login page.
- Landing page moved to `/home`.
- All unknown routes redirect to `/` (Login).

### 2. Login Flow – Invalid Credentials
- The Sign In button is always enabled.
- On submission, if email or password fail validation, an inline error banner is displayed:  
  **"Invalid credentials. Please check your email and password."**
- The banner clears automatically when the user edits the fields.
- On valid credentials, user is navigated to the Landing page (`/home`).

### 3. Create Account Page (`/register`)
- Accessible from the Login page via the **"Create Account"** secondary button.
- Fields:
  - Full Name (required, cannot be blank)
  - Email (valid format required)
  - Password (minimum 4 characters)
  - Confirm Password (must match Password)
- Show/Hide toggle on both password fields.
- Inline validation error messages per field.
- On successful validation, navigates back to the Login page.
- "Back to Sign In" button available at all times.

## Files Created
- `src/pages/CreateAccountPage.tsx`
- `Create_Account_Report.md` (this file)

## Files Modified
- `src/pages/LoginPage.tsx` — Added invalid credentials state, Create Account button, removed disabled state from Sign In.
- `src/utils/routes.ts` — Changed `login` to `/`, `home` to `/home`, added `register: '/register'`.
- `src/App.tsx` — Added `/register` route, updated fallback redirect to login.

## Build Status
✅ `npm run build` — **Passed** (0 errors)

## Lint Status
✅ `npm run lint` — **Passed** (0 warnings, 0 errors)

## Remaining TODOs
- Connect Login and Create Account to a real backend authentication system.
- Implement persistent sessions (JWT / session cookies) when backend is available.
- Add database integration for user storage.
