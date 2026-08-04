import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/auth-context'
import { WorkflowProvider } from './context/workflow-context'
import { StrokeOnsetProvider } from './context/stroke-onset-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StrokeOnsetProvider>
          <WorkflowProvider>
            <App />
          </WorkflowProvider>
        </StrokeOnsetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
