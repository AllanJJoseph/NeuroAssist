export type Gender = 'Female' | 'Male' | 'Other'
export type SmokingHistory = 'Never' | 'Former' | 'Current'
export type ScanType = 'CT' | 'MRI'
export type StrokeType = 'Ischemic' | 'Hemorrhagic'
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical'

export type PatientFormState = {
  name: string
  age: string
  gender: Gender
  systolic: string
  diastolic: string
  glucose: string
  bmi: string
  smokingHistory: SmokingHistory
  hypertension: boolean
  diabetes: boolean
  heartDisease: boolean
  previousStroke: boolean
  symptoms: string
}

export type ScanState = {
  modality: ScanType
  fileName: string
  previewUrl: string
  uploadProgress: number
}

export type RiskFactor = {
  label: string
  detail: string
  score: number
}

export type AnalysisResult = {
  strokeProbability: number
  confidence: number
  strokeType: StrokeType
  riskLevel: RiskLevel
  riskFactors: RiskFactor[]
  clinicalConsiderations: string[]
  imagingSummary: string
  lesionLocation: string
  reportSummary: string
  signalBreakdown: Array<{
    label: string
    value: number
  }>
  generatedAt: string
}

export type WorkflowState = {
  patient: PatientFormState
  scan: ScanState
  analysis: AnalysisResult | null
}

export const symptomOptions = [
  'Facial droop',
  'Arm weakness',
  'Speech difficulty',
  'Vision loss',
  'Severe headache',
  'Dizziness',
  'Numbness',
  'Confusion',
] as const

export const workflowSteps = [
  { label: 'Landing', path: '/' },
  { label: 'Patient', path: '/patient' },
  { label: 'Scan', path: '/scan' },
  { label: 'Processing', path: '/processing' },
  { label: 'Results', path: '/results' },
  { label: 'Report', path: '/report' },
] as const

export function createEmptyPatientForm(): PatientFormState {
  return {
    name: 'Jordan Lee',
    age: '67',
    gender: 'Female',
    systolic: '168',
    diastolic: '94',
    glucose: '186',
    bmi: '31.4',
    smokingHistory: 'Former',
    hypertension: true,
    diabetes: true,
    heartDisease: false,
    previousStroke: false,
    symptoms: 'Arm weakness, speech difficulty, facial droop',
  }
}

export function createEmptyScanState(): ScanState {
  return {
    modality: 'CT',
    fileName: '',
    previewUrl: '',
    uploadProgress: 0,
  }
}

export function createInitialWorkflowState(): WorkflowState {
  return {
    patient: createEmptyPatientForm(),
    scan: createEmptyScanState(),
    analysis: null,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function symptomScore(symptoms: string) {
  const lowered = symptoms.toLowerCase()
  let total = 0

  if (lowered.includes('speech')) total += 8
  if (lowered.includes('weakness')) total += 9
  if (lowered.includes('facial')) total += 6
  if (lowered.includes('vision')) total += 5
  if (lowered.includes('headache')) total += 6
  if (lowered.includes('dizziness')) total += 4
  if (lowered.includes('numb')) total += 5
  if (lowered.includes('confusion')) total += 5

  return total
}

export function buildMockAnalysis(patient: PatientFormState, scan: ScanState): AnalysisResult {
  const age = Number(patient.age) || 0
  const systolic = Number(patient.systolic) || 0
  const glucose = Number(patient.glucose) || 0
  const bmi = Number(patient.bmi) || 0

  const riskFactors: RiskFactor[] = [
    {
      label: 'Age',
      detail: age >= 65 ? 'Older than 65 years' : 'Age below the strongest-risk range',
      score: age >= 75 ? 15 : age >= 65 ? 11 : age >= 50 ? 6 : 3,
    },
    {
      label: 'Blood pressure',
      detail: systolic >= 160 ? 'Markedly elevated systolic pressure' : 'Mild-to-moderate elevation',
      score: systolic >= 180 ? 16 : systolic >= 160 ? 12 : systolic >= 140 ? 8 : 4,
    },
    {
      label: 'Glucose',
      detail: glucose >= 180 ? 'Hyperglycemia at presentation' : 'Glucose not strongly contributory',
      score: glucose >= 220 ? 12 : glucose >= 180 ? 10 : glucose >= 140 ? 6 : 2,
    },
    {
      label: 'BMI',
      detail: bmi >= 30 ? 'Obesity contributes to vascular risk' : 'BMI within a lower-risk band',
      score: bmi >= 35 ? 8 : bmi >= 30 ? 6 : bmi >= 25 ? 3 : 1,
    },
    {
      label: 'Smoking history',
      detail:
        patient.smokingHistory === 'Current'
          ? 'Active tobacco exposure'
          : patient.smokingHistory === 'Former'
            ? 'Past tobacco exposure'
            : 'No smoking history',
      score: patient.smokingHistory === 'Current' ? 10 : patient.smokingHistory === 'Former' ? 6 : 1,
    },
    {
      label: 'Comorbidities',
      detail:
        [
          patient.hypertension && 'Hypertension',
          patient.diabetes && 'Diabetes',
          patient.heartDisease && 'Cardiac disease',
          patient.previousStroke && 'Prior stroke',
        ]
          .filter(Boolean)
          .join(', ') || 'No major chronic vascular comorbidities',
      score: [patient.hypertension, patient.diabetes, patient.heartDisease, patient.previousStroke].filter(Boolean).length * 6,
    },
    {
      label: 'Neurologic symptoms',
      detail: patient.symptoms || 'No symptoms provided',
      score: symptomScore(patient.symptoms),
    },
  ]

  const totalScore = riskFactors.reduce((sum, factor) => sum + factor.score, 12)
  const modalityBoost = scan.modality === 'MRI' ? 4 : 2
  const probability = clamp(Math.round(totalScore + modalityBoost), 7, 97)
  const confidence = clamp(Math.round(72 + Math.min(14, totalScore / 6) + (scan.fileName ? 3 : 0)), 63, 96)
  const riskLevel: RiskLevel = probability >= 80 ? 'Critical' : probability >= 60 ? 'High' : probability >= 35 ? 'Moderate' : 'Low'

  const hemorrhageSignals = ['headache', 'hypertension', 'blood pressure', 'nausea', 'vomiting']
  const hemorrhageScore = hemorrhageSignals.reduce(
    (sum, signal) => sum + (patient.symptoms.toLowerCase().includes(signal) ? 1 : 0),
    0,
  ) + (systolic >= 170 ? 2 : 0)
  const strokeType: StrokeType = hemorrhageScore >= 3 ? 'Hemorrhagic' : 'Ischemic'

  const lesionLocation =
    strokeType === 'Hemorrhagic'
      ? 'Left basal ganglia with surrounding edema'
      : scan.modality === 'MRI'
        ? 'Right MCA territory diffusion restriction'
        : 'Left MCA territory hypodensity'

  const imagingSummary =
    scan.modality === 'MRI'
      ? 'MRI pattern suggests an acute ischemic process with restricted diffusion and focal perfusion mismatch.'
      : 'CT pattern suggests an evolving vascular event with focal parenchymal asymmetry and a suspected lesion margin.'

  const clinicalConsiderations = [
    strokeType === 'Ischemic'
      ? 'Verify last-known-well time and evaluate thrombolysis eligibility.'
      : 'Escalate for hemorrhage pathway and neurosurgical review.',
    'Repeat neurologic exam and document NIHSS trend in the chart.',
    'Review antithrombotic history, anticoagulation status, and bleeding risk.',
    probability >= 70 ? 'Activate stroke team and prepare for urgent imaging review.' : 'Continue close observation with rapid escalation criteria.',
  ]

  return {
    strokeProbability: probability,
    confidence,
    strokeType,
    riskLevel,
    riskFactors,
    clinicalConsiderations,
    imagingSummary,
    lesionLocation,
    reportSummary: `${patient.name || 'The patient'} presents with a ${riskLevel.toLowerCase()} risk pattern. The model favors ${strokeType.toLowerCase()} stroke with ${confidence}% confidence, based on the current structured data and imaging proxy.`,
    signalBreakdown: riskFactors
      .map((factor) => ({ label: factor.label, value: factor.score }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5),
    generatedAt: new Date().toLocaleString(),
  }
}
