/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import {
  buildMockAnalysis,
  createInitialWorkflowState,
  type AnalysisResult,
  type PatientFormState,
  type ScanState,
  type WorkflowState,
} from '../lib/workflow'

type WorkflowAction =
  | { type: 'update_patient'; field: keyof PatientFormState; value: string | boolean }
  | { type: 'update_scan'; field: keyof ScanState; value: string | number }
  | { type: 'set_analysis'; value: AnalysisResult | null }
  | { type: 'reset' }

type WorkflowContextValue = WorkflowState & {
  updatePatientField: <K extends keyof PatientFormState>(field: K, value: PatientFormState[K]) => void
  updateScanField: <K extends keyof ScanState>(field: K, value: ScanState[K]) => void
  setAnalysis: (analysis: AnalysisResult | null) => void
  finalizeAnalysis: () => AnalysisResult
  resetWorkflow: () => void
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'update_patient':
      return {
        ...state,
        patient: {
          ...state.patient,
          [action.field]: action.value,
        },
      }
    case 'update_scan':
      return {
        ...state,
        scan: {
          ...state.scan,
          [action.field]: action.value,
        },
      }
    case 'set_analysis':
      return {
        ...state,
        analysis: action.value,
      }
    case 'reset':
      return createInitialWorkflowState()
    default:
      return state
  }
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, undefined, createInitialWorkflowState)

  const value: WorkflowContextValue = {
    ...state,
    updatePatientField: (field, value) => dispatch({ type: 'update_patient', field, value }),
    updateScanField: (field, value) => dispatch({ type: 'update_scan', field, value }),
    setAnalysis: (analysis) => dispatch({ type: 'set_analysis', value: analysis }),
    finalizeAnalysis: () => {
      const analysis = buildMockAnalysis(state.patient, state.scan)
      dispatch({ type: 'set_analysis', value: analysis })
      return analysis
    },
    resetWorkflow: () => dispatch({ type: 'reset' }),
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)

  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }

  return context
}
