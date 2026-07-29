import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { WorkflowProvider } from './context/workflow-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WorkflowProvider>
        <App />
      </WorkflowProvider>
    </BrowserRouter>
  </StrictMode>,
)
