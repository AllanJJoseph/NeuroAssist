import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { LandingPage } from './pages/LandingPage'
import { PatientPage } from './pages/PatientPage'
import { ProcessingPage } from './pages/ProcessingPage'
import { ResultsPage } from './pages/ResultsPage'
import { ScanUploadPage } from './pages/ScanUploadPage'
import { ReportPage } from './pages/ReportPage'
import { ROUTES } from './utils/routes'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path={ROUTES.home} element={<LandingPage />} />
        <Route path={ROUTES.patient} element={<PatientPage />} />
        <Route path={ROUTES.scan} element={<ScanUploadPage />} />
        <Route path={ROUTES.processing} element={<ProcessingPage />} />
        <Route path={ROUTES.results} element={<ResultsPage />} />
        <Route path={ROUTES.report} element={<ReportPage />} />
        <Route path={ROUTES.about} element={<AboutPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
