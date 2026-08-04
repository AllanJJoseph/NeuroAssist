// ── Hospital Configuration ────────────────────────────────────────────────────
// All hospital names, doctor names, and related constants live here.
// Never hardcode "Apollo Hospital" anywhere else in the codebase.

export const HOSPITALS = [
  { id: 'aster', name: 'Aster Hospital' },
  { id: 'apollo', name: 'Apollo Hospital' },
] as const

export type HospitalId = (typeof HOSPITALS)[number]['id']

export const APOLLO_DOCTORS = [
  'Dr. Sarah Thomas',
  'Dr. Rajesh Menon',
  'Dr. Anjali Nair',
] as const

export const SENDING_HOSPITAL = HOSPITALS[0].name   // 'Aster Hospital'
export const DEFAULT_RECEIVING_HOSPITAL = HOSPITALS[1].name  // 'Apollo Hospital'

// Apollo auth
export const APOLLO_CREDENTIALS = {
  username: 'apollo',
  password: '1234',
} as const

// sessionStorage key for active hospital identity
export const DEMO_HOSPITAL_KEY = 'demo_hospital'

export function getActiveDemoHospital(): string | null {
  return sessionStorage.getItem(DEMO_HOSPITAL_KEY)
}

export function setActiveDemoHospital(hospital: string): void {
  sessionStorage.setItem(DEMO_HOSPITAL_KEY, hospital)
}

export function clearDemoHospital(): void {
  sessionStorage.removeItem(DEMO_HOSPITAL_KEY)
}
