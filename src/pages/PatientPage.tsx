import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { ROUTES } from '../utils/routes'

const patientFieldGrid = 'grid gap-5 md:grid-cols-2'

export function PatientPage() {
  const navigate = useNavigate()
  const { patient, updatePatientField } = useWorkflow()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(() =>
    patient.symptoms.split(',').map((item) => item.trim()).filter(Boolean),
  )

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

      <form className="mt-8 space-y-6" onSubmit={submitForm}>
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
                          'rounded-full border px-3 py-2 text-sm font-medium transition',
                          selected
                            ? 'border-medical-200 bg-medical-50 text-medical-700 shadow-sm'
                            : 'border-steel-200 bg-white text-steel-600 hover:bg-steel-50',
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

                <div className="rounded-2xl bg-steel-50 px-4 py-3 text-sm text-steel-600">
                  The mock model uses these fields to generate a personalized analysis summary later in the flow.
                </div>
              </CardContent>
            </Card>

            <Card className="bg-medical-50/70">
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
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.home)}>
            Back
          </Button>
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
      className={[
        'flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
        checked ? 'border-medical-200 bg-white text-steel-900 shadow-sm' : 'border-steel-200 bg-steel-50 text-steel-600 hover:bg-white',
      ].join(' ')}
    >
      <span>{label}</span>
      <span className={checked ? 'text-medical-600' : 'text-steel-300'}>{checked ? 'On' : 'Off'}</span>
    </button>
  )
}
