import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ClinicalReportPage } from './pages/ClinicalReportPage'
import { LandingPage } from './pages/LandingPage'
import { PatientInfoPage } from './pages/PatientInfoPage'
import { ProcessingPage } from './pages/ProcessingPage'
import { ResultsPage } from './pages/ResultsPage'
import { ScanUploadPage } from './pages/ScanUploadPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient" element={<PatientInfoPage />} />
        <Route path="/scan" element={<ScanUploadPage />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/report" element={<ClinicalReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
