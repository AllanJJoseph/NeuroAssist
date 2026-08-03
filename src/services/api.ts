import type { PatientFormState, ScanState, AnalysisResult } from '../lib/workflow'

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080";
export const API_BASE_URL = API_URL ? API_URL.replace(/\/api$/, '') : ''

export type BackendPatientPayload = {
  name: string
  age: number
  gender: string
  systolic: number
  diastolic: number
  glucose: number
  bmi: number
  smokingHistory: string
  hypertension: boolean
  diabetes: boolean
  heartDisease: boolean
  previousStroke: boolean
  symptoms: string[]
}

export type BackendPatientResponse = {
  patientId: string
  message: string
  createdAt: string
}

export type BackendUploadResponse = {
  uploadId: string
  filename: string
  modality: string
  message: string
}

export type BackendProcessResponse = {
  processId: string
  patientId: string
  uploadId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  message: string
  createdAt: string
}

export type BackendStatusResponse = {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  message: string
}

export type BackendImagePrediction = {
  prediction: string
  confidence: number
  heatmapPath: string
}

export type BackendResultsResponse = {
  processId: string
  patientId: string
  uploadId: string
  strokeProbability: number
  confidence: number
  confidenceScore: number
  strokeType: string
  predictedStrokeType: string
  riskLevel: string
  recommendations: string[]
  clinicalConsiderations: string[]
  riskFactors: Array<{ label: string; detail: string; score: number }>
  patientSummary: string
  reportSummary: string
  imagingSummary: string
  lesionLocation: string
  signalBreakdown: Array<{ label: string; value: number }>
  generatedAt: string
  imagePrediction?: BackendImagePrediction
}

export async function createPatientRecord(patient: PatientFormState): Promise<BackendPatientResponse> {
  const payload: BackendPatientPayload = {
    name: patient.name || 'Anonymous Patient',
    age: Number(patient.age) || 50,
    gender: patient.gender,
    systolic: Number(patient.systolic) || 120,
    diastolic: Number(patient.diastolic) || 80,
    glucose: Number(patient.glucose) || 100,
    bmi: Number(patient.bmi) || 25,
    smokingHistory: patient.smokingHistory,
    hypertension: patient.hypertension,
    diabetes: patient.diabetes,
    heartDisease: patient.heartDisease,
    previousStroke: patient.previousStroke,
    symptoms: patient.symptoms ? patient.symptoms.split(',').map((s) => s.trim()) : [],
  }

  const res = await fetch(`${API_URL}/patient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Failed to create patient record: ${res.statusText}`)
  }

  return res.json()
}

export async function uploadScanFile(scan: ScanState): Promise<BackendUploadResponse> {
  const formData = new FormData()
  if (scan.file) {
    formData.append('file', scan.file)
  } else {
    const dummyBlob = new Blob(['MOCK SCAN FILE DATA'], { type: 'application/octet-stream' })
    formData.append('file', dummyBlob, scan.fileName || 'brain_scan.dcm')
  }
  formData.append('modality', scan.modality)

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Failed to upload scan file: ${res.statusText}`)
  }

  return res.json()
}

export async function initiateWorkflowProcess(
  patientId: string,
  uploadId: string
): Promise<BackendProcessResponse> {
  const res = await fetch(`${API_URL}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, uploadId }),
  })

  if (!res.ok) {
    throw new Error(`Failed to initiate process workflow: ${res.statusText}`)
  }

  return res.json()
}

export async function fetchJobStatus(processId: string): Promise<BackendStatusResponse> {
  const res = await fetch(`${API_URL}/status/${processId}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch job status: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchResults(processId: string): Promise<BackendResultsResponse> {
  const res = await fetch(`${API_URL}/results/${processId}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch results: ${res.statusText}`)
  }
  return res.json()
}

export function getDownloadReportUrl(id: string): string {
  return `${API_URL}/download/${id}`
}

export function mapBackendResultsToAnalysis(results: BackendResultsResponse): AnalysisResult {
  return {
    strokeProbability: results.strokeProbability,
    confidence: results.confidenceScore || results.confidence,
    strokeType: (results.predictedStrokeType || results.strokeType) as 'Ischemic' | 'Hemorrhagic',
    riskLevel: results.riskLevel as 'Low' | 'Moderate' | 'High' | 'Critical',
    riskFactors: results.riskFactors.map((rf) => ({
      label: rf.label,
      detail: rf.detail,
      score: rf.score,
    })),
    clinicalConsiderations: results.clinicalConsiderations || results.recommendations,
    imagingSummary: results.imagingSummary,
    lesionLocation: results.lesionLocation,
    reportSummary: results.reportSummary || results.patientSummary,
    signalBreakdown: results.signalBreakdown || results.riskFactors.map((rf) => ({ label: rf.label, value: rf.score })),
    generatedAt: new Date(results.generatedAt).toLocaleString(),
    imagePrediction: results.imagePrediction ?? null,
  }
}
