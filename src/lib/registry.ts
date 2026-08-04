import type { PatientFormState, AnalysisResult, Gender, SmokingHistory } from './workflow'

// ── Registry Patient ──────────────────────────────────────────────────────────
// Full EHR record stored in localStorage. Superset of PatientFormState.
// Never passed directly to the AI pipeline — use registryPatientToFormState().

export type RegistryPatient = {
  id: string
  name: string
  age: string
  gender: Gender
  phoneNumber: string
  bloodGroup: string
  height: string
  weight: string
  bmi: string
  systolic: string
  diastolic: string
  glucose: string
  smokingHistory: SmokingHistory
  hypertension: boolean
  diabetes: boolean
  heartDisease: boolean
  previousStroke: boolean
  symptoms: string
  strokeOnsetTime: string // ISO timestamp string, or '' if unknown
  createdAt: string
  updatedAt: string
}

// ── Transfer Record ───────────────────────────────────────────────────────────
// Snapshot created at transfer time. References registry patient by ID.
// Apollo reads only from this — never from the registry directly.

export type TransferStatus = 'Pending' | 'Received' | 'Viewed' | 'Accepted'
export type TransferPriority = 'Emergency' | 'Urgent' | 'Routine'

export type ScanSnapshot = {
  modality: string
  fileName: string
  previewUrl: string
  gradcamPath: string
}

export type TransferRecord = {
  id: string
  patientId: string                  // references RegistryPatient.id
  patientSnapshot: RegistryPatient   // read-only copy for Apollo
  analysisSnapshot: AnalysisResult
  scanSnapshot: ScanSnapshot
  strokeOnsetTime: string
  elapsedAtTransfer: string          // HH:MM:SS snapshot at moment of transfer
  sendingHospital: string
  receivingHospital: string
  receivingDoctor: string
  priority: TransferPriority
  transferNotes: string
  transferredAt: string              // ISO timestamp
  reportGeneratedAt: string
  status: TransferStatus
  receivedAt?: string
  viewedAt?: string
  acceptedBy?: string
  acceptedAt?: string
}

// ── localStorage keys (namespaced) ───────────────────────────────────────────

const REGISTRY_KEY = 'neuroassist_registry'
const TRANSFERS_KEY = 'neuroassist_transfers'

// ── Registry helpers ──────────────────────────────────────────────────────────

export function getRegistry(): RegistryPatient[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    return raw ? (JSON.parse(raw) as RegistryPatient[]) : []
  } catch {
    return []
  }
}

export function saveRegistry(patients: RegistryPatient[]): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(patients))
}

export function addRegistryPatient(patient: Omit<RegistryPatient, 'id' | 'createdAt' | 'updatedAt'>): RegistryPatient {
  const now = new Date().toISOString()
  const newPatient: RegistryPatient = {
    ...patient,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  const current = getRegistry()
  saveRegistry([...current, newPatient])
  return newPatient
}

export function updateRegistryPatient(id: string, patch: Partial<Omit<RegistryPatient, 'id' | 'createdAt'>>): void {
  const current = getRegistry()
  const updated = current.map((p) =>
    p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
  )
  saveRegistry(updated)
}

export function deleteRegistryPatient(id: string): void {
  saveRegistry(getRegistry().filter((p) => p.id !== id))
}

// ── Transfer helpers ──────────────────────────────────────────────────────────

export function getTransfers(): TransferRecord[] {
  try {
    const raw = localStorage.getItem(TRANSFERS_KEY)
    return raw ? (JSON.parse(raw) as TransferRecord[]) : []
  } catch {
    return []
  }
}

export function saveTransfer(transfer: TransferRecord): void {
  const current = getTransfers()
  const exists = current.findIndex((t) => t.id === transfer.id)
  if (exists >= 0) {
    current[exists] = transfer
    localStorage.setItem(TRANSFERS_KEY, JSON.stringify(current))
  } else {
    localStorage.setItem(TRANSFERS_KEY, JSON.stringify([...current, transfer]))
  }
}

export function updateTransfer(id: string, patch: Partial<TransferRecord>): void {
  const current = getTransfers()
  const updated = current.map((t) => (t.id === id ? { ...t, ...patch } : t))
  localStorage.setItem(TRANSFERS_KEY, JSON.stringify(updated))
}

export function getTransferById(id: string): TransferRecord | undefined {
  return getTransfers().find((t) => t.id === id)
}

// ── Import mapping ────────────────────────────────────────────────────────────
// Maps RegistryPatient → PatientFormState fields ONLY.
// Registry-only fields (phone, bloodGroup, height, weight) are intentionally excluded.
// This is the only place where registry data crosses into the prediction pipeline.

export function registryPatientToFormState(p: RegistryPatient): PatientFormState {
  return {
    name: p.name,
    age: p.age,
    gender: p.gender,
    systolic: p.systolic,
    diastolic: p.diastolic,
    glucose: p.glucose,
    bmi: p.bmi,
    smokingHistory: p.smokingHistory,
    hypertension: p.hypertension,
    diabetes: p.diabetes,
    heartDisease: p.heartDisease,
    previousStroke: p.previousStroke,
    symptoms: p.symptoms,
  }
}

// ── Elapsed time helper ───────────────────────────────────────────────────────

export function computeElapsed(onsetTime: string): string {
  if (!onsetTime) return ''
  const diff = Math.max(0, Date.now() - new Date(onsetTime).getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
