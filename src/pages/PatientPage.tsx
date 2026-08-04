import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCheck, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Textarea } from '../components/ui/textarea'
import { symptomOptions } from '../lib/workflow'
import { useWorkflow } from '../context/workflow-context'
import { useStrokeOnset } from '../context/stroke-onset-context'
import { StrokeClock } from '../components/StrokeClock'
import { getRegistry, registryPatientToFormState, type RegistryPatient } from '../lib/registry'
import { ROUTES } from '../utils/routes'

const patientFieldGrid = 'grid gap-5 md:grid-cols-2'

export function PatientPage() {
  const navigate = useNavigate()
  const { patient, updatePatientField } = useWorkflow()
  const { strokeOnsetTime, setStrokeOnsetTime } = useStrokeOnset()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(() =>
    patient.symptoms.split(',').map((item) => item.trim()).filter(Boolean),
  )

  const [importOpen, setImportOpen] = useState(false)
  const [registrySearch, setRegistrySearch] = useState('')
  const registryPatients = useMemo(() => getRegistry(), [])
  const filteredRegistry = useMemo(
    () => registryPatients.filter((p) => p.name.toLowerCase().includes(registrySearch.toLowerCase())),
    [registryPatients, registrySearch],
  )

  const handleImportPatient = (rp: RegistryPatient) => {
    const formState = registryPatientToFormState(rp)
    const keys = Object.keys(formState) as (keyof typeof formState)[]
    keys.forEach((k) => updatePatientField(k, formState[k] as never))
    setSelectedSymptoms(rp.symptoms.split(',').map((item) => item.trim()).filter(Boolean))
    setStrokeOnsetTime(rp.strokeOnsetTime || '')
    setImportOpen(false)
  }

  const symptomText = useMemo(() => selectedSymptoms.join(', '), [selectedSymptoms])

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((current) => {
      const next = current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]
      updatePatientField('symptoms', next.join(', '))
      return next
    })
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(ROUTES.scan)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <Badge variant="secondary">Step 1 of 6</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-steel-900 sm:text-4xl">Patient information</h1>
            <p className="mt-2 text-sm leading-6 text-steel-600 sm:text-base">
              Capture the structured clinical context needed to support the mock stroke assessment. The form is optimized for speed and clarity at the bedside.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURE 3: Import Patient Section */}
      <Card className="mt-6 border-dashed border-steel-400 bg-steel-50/50">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setImportOpen(!importOpen)}>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-steel-700" />
              <CardTitle className="text-base font-semibold text-steel-900">Import Patient from Registry</CardTitle>
              {registryPatients.length > 0 && (
                <Badge variant="secondary">{registryPatients.length} saved</Badge>
              )}
            </div>
            <Button type="button" variant="ghost" size="sm">
              {importOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {importOpen && (
          <CardContent className="pt-0 space-y-4">
            <Input
              placeholder="Search patient by name..."
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
              className="bg-white"
            />
            {filteredRegistry.length === 0 ? (
              <div className="text-xs text-steel-500 py-2">
                No patients found in registry. Go to Patient Registry to register new patients.
              </div>
            ) : (
              <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredRegistry.map((rp) => (
                  <button
                    key={rp.id}
                    type="button"
                    onClick={() => handleImportPatient(rp)}
                    className="flex items-center justify-between rounded-xl border border-steel-200 bg-white p-3 text-left transition hover:border-steel-900 hover:bg-steel-50"
                  >
                    <div>
                      <div className="font-semibold text-sm text-steel-900">{rp.name}</div>
                      <div className="text-xs text-steel-500">
                        {rp.age}y · {rp.gender} · {rp.bloodGroup} · BP {rp.systolic}/{rp.diastolic}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-steel-900 shrink-0">
                      <UserCheck className="h-3.5 w-3.5" />
                      Load Patient
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <form className="mt-6 space-y-6" onSubmit={submitForm}>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Clinical intake</CardTitle>
              <CardDescription>Enter the minimum data needed for a meaningful stroke risk summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={patientFieldGrid}>
                <Field label="Patient name">
                  <Input value={patient.name} onChange={(event) => updatePatientField('name', event.target.value)} placeholder="Enter patient name" />
                </Field>
                <Field label="Age">
                  <Input type="number" min="0" value={patient.age} onChange={(event) => updatePatientField('age', event.target.value)} placeholder="Age in years" />
                </Field>
              </div>

              <div className={patientFieldGrid}>
                <Field label="Gender">
                  <Select value={patient.gender} onChange={(event) => updatePatientField('gender', event.target.value as typeof patient.gender)}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </Select>
                </Field>
                <Field label="Smoking history">
                  <Select
                    value={patient.smokingHistory}
                    onChange={(event) => updatePatientField('smokingHistory', event.target.value as typeof patient.smokingHistory)}
                  >
                    <option>Never</option>
                    <option>Former</option>
                    <option>Current</option>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Blood pressure - systolic">
                  <Input type="number" value={patient.systolic} onChange={(event) => updatePatientField('systolic', event.target.value)} placeholder="mmHg" />
                </Field>
                <Field label="Blood pressure - diastolic">
                  <Input type="number" value={patient.diastolic} onChange={(event) => updatePatientField('diastolic', event.target.value)} placeholder="mmHg" />
                </Field>
                <Field label="Glucose">
                  <Input type="number" value={patient.glucose} onChange={(event) => updatePatientField('glucose', event.target.value)} placeholder="mg/dL" />
                </Field>
              </div>

              <div className={patientFieldGrid}>
                <Field label="BMI">
                  <Input type="number" step="0.1" value={patient.bmi} onChange={(event) => updatePatientField('bmi', event.target.value)} placeholder="Body mass index" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle label="Hypertension" checked={patient.hypertension} onChange={(checked) => updatePatientField('hypertension', checked)} />
                  <Toggle label="Diabetes" checked={patient.diabetes} onChange={(checked) => updatePatientField('diabetes', checked)} />
                  <Toggle label="Heart disease" checked={patient.heartDisease} onChange={(checked) => updatePatientField('heartDisease', checked)} />
                  <Toggle label="Previous stroke" checked={patient.previousStroke} onChange={(checked) => updatePatientField('previousStroke', checked)} />
                </div>
              </div>

              {/* FEATURE 2: Stroke Onset Time Field */}
              <Separator />
              <Field label="Stroke Onset Time (Date & Time)">
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={strokeOnsetTime ? strokeOnsetTime.slice(0, 16) : ''}
                    onChange={(e) => setStrokeOnsetTime(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  />
                </div>
                <p className="text-xs text-steel-500">Leave blank if onset time is unknown. Used to calculate dynamic stroke elapsed time.</p>
              </Field>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Symptom selection</CardTitle>
                <CardDescription>Choose the presenting features most relevant to stroke triage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((symptom) => {
                    const selected = selectedSymptoms.includes(symptom)

                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={[
                            'rounded-full border border-steel-900 px-3 py-2 text-sm font-medium transition',
                            selected ? 'bg-steel-900 text-white shadow-sm' : 'bg-white text-steel-900 hover:bg-steel-100',
                        ].join(' ')}
                      >
                        {symptom}
                      </button>
                    )
                  })}
                </div>

                <Separator />

                <Field label="Symptoms narrative">
                  <Textarea
                    value={symptomText}
                    onChange={(event) => {
                      const next = event.target.value
                      updatePatientField('symptoms', next)
                      setSelectedSymptoms(next.split(',').map((item) => item.trim()).filter(Boolean))
                    }}
                    placeholder="Describe the neurological presentation"
                  />
                </Field>

                <div className="rounded-2xl border border-steel-900 bg-white px-4 py-3 text-sm text-steel-900">
                  The mock model uses these fields to generate a personalized analysis summary later in the flow.
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="space-y-4 p-6">
                <div>
                  <Badge>Intake snapshot</Badge>
                </div>
                <div className="space-y-2 text-sm text-steel-700">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-steel-500">Name</span>
                    <span className="font-medium">{patient.name || 'Not entered'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-steel-500">Age</span>
                    <span className="font-medium">{patient.age || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-steel-500">Symptoms</span>
                    <span className="font-medium text-right">{patient.symptoms || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FEATURE 4: Live Stroke Clock Widget */}
            <StrokeClock onsetTime={strokeOnsetTime} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-2xl border border-steel-900 bg-white px-4 py-3 text-left text-sm font-medium text-steel-900 transition hover:bg-steel-100"
    >
      <span>{label}</span>
      <span className="text-steel-500">{checked ? 'On' : 'Off'}</span>
    </button>
  )
}
