import { useState, useMemo, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Pencil, Trash2, UserCheck, X, Save, Users,
} from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Textarea } from '../components/ui/textarea'
import {
  getRegistry,
  addRegistryPatient,
  updateRegistryPatient,
  deleteRegistryPatient,
  registryPatientToFormState,
  type RegistryPatient,
} from '../lib/registry'
import type { Gender, SmokingHistory } from '../lib/workflow'
import { symptomOptions } from '../lib/workflow'
import { useWorkflow } from '../context/workflow-context'
import { useStrokeOnset } from '../context/stroke-onset-context'
import { ROUTES } from '../utils/routes'

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']

function emptyForm(): Omit<RegistryPatient, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '', age: '', gender: 'Female', phoneNumber: '', bloodGroup: 'O+',
    height: '', weight: '', bmi: '', systolic: '', diastolic: '', glucose: '',
    smokingHistory: 'Never', hypertension: false, diabetes: false,
    heartDisease: false, previousStroke: false, symptoms: '', strokeOnsetTime: '',
  }
}

type FormState = Omit<RegistryPatient, 'id' | 'createdAt' | 'updatedAt'>

export function PatientRegistryPage() {
  const navigate = useNavigate()
  const { updatePatientField } = useWorkflow()
  const { setStrokeOnsetTime } = useStrokeOnset()

  const [patients, setPatients] = useState<RegistryPatient[]>(() => getRegistry())
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])

  const filtered = useMemo(
    () => patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [patients, query],
  )

  const refresh = () => setPatients(getRegistry())

  const openAdd = () => {
    setEditingId(null)
    const f = emptyForm()
    setForm(f)
    setSelectedSymptoms([])
    setShowForm(true)
  }

  const openEdit = (patient: RegistryPatient) => {
    setEditingId(patient.id)
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = patient
    setForm(rest)
    setSelectedSymptoms(patient.symptoms.split(',').map((s) => s.trim()).filter(Boolean))
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((curr) => {
      const next = curr.includes(symptom)
        ? curr.filter((s) => s !== symptom)
        : [...curr, symptom]
      setField('symptoms', next.join(', '))
      return next
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateRegistryPatient(editingId, form)
    } else {
      addRegistryPatient(form)
    }
    refresh()
    closeForm()
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this patient from the registry?')) return
    deleteRegistryPatient(id)
    refresh()
  }

  const handleLoadForPrediction = (patient: RegistryPatient) => {
    // Map only PatientFormState fields — no registry-only fields cross the boundary
    const formState = registryPatientToFormState(patient)
    const keys = Object.keys(formState) as (keyof typeof formState)[]
    keys.forEach((key) => updatePatientField(key, formState[key] as never))
    // Set stroke onset time separately (not in PatientFormState)
    setStrokeOnsetTime(patient.strokeOnsetTime ?? '')
    navigate(ROUTES.patient)
  }

  const riskBadgeColor = (p: RegistryPatient) => {
    const flags = [p.hypertension, p.diabetes, p.heartDisease, p.previousStroke].filter(Boolean).length
    if (p.strokeOnsetTime) return 'bg-red-100 text-red-800 border-red-300'
    if (flags >= 3) return 'bg-orange-100 text-orange-800 border-orange-300'
    if (flags >= 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Electronic Health Records</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-steel-900 sm:text-4xl">
              Patient Registry
            </h1>
            <p className="mt-2 text-sm leading-6 text-steel-600">
              Manage and search patient records. Import any patient directly into the stroke prediction workflow.
            </p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <div className="mt-8 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
        <Input
          className="pl-10"
          placeholder="Search patients by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Inline Add/Edit Form */}
      {showForm && (
        <Card className="mt-6 border-2 border-steel-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{editingId ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
                <CardDescription>Fill in the patient details and save to the registry.</CardDescription>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl p-2 text-steel-500 hover:bg-steel-100 hover:text-steel-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <F label="Full Name">
                  <Input required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Patient full name" />
                </F>
                <F label="Age">
                  <Input type="number" min="0" max="120" required value={form.age} onChange={(e) => setField('age', e.target.value)} placeholder="Years" />
                </F>
                <F label="Gender">
                  <Select value={form.gender} onChange={(e) => setField('gender', e.target.value as Gender)}>
                    <option>Female</option><option>Male</option><option>Other</option>
                  </Select>
                </F>
                <F label="Phone Number">
                  <Input value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} placeholder="+91 98765 43210" />
                </F>
                <F label="Blood Group">
                  <Select value={form.bloodGroup} onChange={(e) => setField('bloodGroup', e.target.value)}>
                    {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                  </Select>
                </F>
                <F label="Smoking History">
                  <Select value={form.smokingHistory} onChange={(e) => setField('smokingHistory', e.target.value as SmokingHistory)}>
                    <option>Never</option><option>Former</option><option>Current</option>
                  </Select>
                </F>
              </div>

              <Separator />

              {/* Vitals */}
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <F label="Height (cm)">
                  <Input type="number" value={form.height} onChange={(e) => setField('height', e.target.value)} placeholder="cm" />
                </F>
                <F label="Weight (kg)">
                  <Input type="number" value={form.weight} onChange={(e) => setField('weight', e.target.value)} placeholder="kg" />
                </F>
                <F label="BMI">
                  <Input type="number" step="0.1" value={form.bmi} onChange={(e) => setField('bmi', e.target.value)} placeholder="kg/m²" />
                </F>
                <F label="Glucose (mg/dL)">
                  <Input type="number" value={form.glucose} onChange={(e) => setField('glucose', e.target.value)} placeholder="mg/dL" />
                </F>
                <F label="BP Systolic (mmHg)">
                  <Input type="number" value={form.systolic} onChange={(e) => setField('systolic', e.target.value)} placeholder="mmHg" />
                </F>
                <F label="BP Diastolic (mmHg)">
                  <Input type="number" value={form.diastolic} onChange={(e) => setField('diastolic', e.target.value)} placeholder="mmHg" />
                </F>
              </div>

              <Separator />

              {/* Comorbidities */}
              <div>
                <div className="mb-3 text-sm font-medium text-steel-700">Comorbidities</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      ['hypertension', 'Hypertension'],
                      ['diabetes', 'Diabetes'],
                      ['heartDisease', 'Heart Disease'],
                      ['previousStroke', 'Previous Stroke'],
                    ] as const
                  ).map(([key, label]) => (
                    <Toggle
                      key={key}
                      label={label}
                      checked={form[key] as boolean}
                      onChange={(v) => setField(key, v)}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Symptoms */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-steel-700">Symptoms</div>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={[
                        'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                        selectedSymptoms.includes(s)
                          ? 'border-steel-900 bg-steel-900 text-white'
                          : 'border-steel-300 bg-white text-steel-700 hover:bg-steel-50',
                      ].join(' ')}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={form.symptoms}
                  onChange={(e) => {
                    setField('symptoms', e.target.value)
                    setSelectedSymptoms(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                  }}
                  placeholder="Additional symptom notes..."
                  rows={2}
                />
              </div>

              <Separator />

              {/* Stroke Onset Time */}
              <F label="Stroke Onset Time (optional — leave blank if unknown)">
                <Input
                  type="datetime-local"
                  value={form.strokeOnsetTime ? form.strokeOnsetTime.slice(0, 16) : ''}
                  onChange={(e) =>
                    setField('strokeOnsetTime', e.target.value ? new Date(e.target.value).toISOString() : '')
                  }
                />
              </F>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Save Changes' : 'Add Patient'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Patient List */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-steel-300 py-16 text-center">
            <Users className="mb-4 h-12 w-12 text-steel-300" />
            <div className="text-lg font-semibold text-steel-500">
              {query ? 'No patients match your search' : 'No patients registered yet'}
            </div>
            <p className="mt-2 text-sm text-steel-400">
              {query ? 'Try a different name.' : 'Click "Add Patient" to register the first patient.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((patient) => (
              <div
                key={patient.id}
                className="rounded-2xl border border-steel-200 bg-white px-5 py-4 shadow-sm transition hover:border-steel-900 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-steel-200 bg-steel-50 text-sm font-bold text-steel-700">
                      {patient.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-steel-900">{patient.name}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${riskBadgeColor(patient)}`}>
                          {patient.strokeOnsetTime ? '⚠ Onset Recorded' :
                            [patient.hypertension, patient.diabetes, patient.heartDisease, patient.previousStroke].filter(Boolean).length >= 2
                              ? 'High Risk' : 'Registered'}
                        </span>
                      </div>
                      <div className="mt-0.5 text-sm text-steel-500">
                        {patient.age}y · {patient.gender} · {patient.bloodGroup} · {patient.smokingHistory} smoker
                      </div>
                      <div className="mt-0.5 text-xs text-steel-400">
                        BP {patient.systolic}/{patient.diastolic} · Glucose {patient.glucose} · BMI {patient.bmi}
                        {patient.phoneNumber ? ` · ${patient.phoneNumber}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoadForPrediction(patient)}
                      title="Load into prediction workflow"
                    >
                      <UserCheck className="h-4 w-4" />
                      Start Prediction
                    </Button>
                    <button
                      type="button"
                      onClick={() => openEdit(patient)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-steel-200 bg-white text-steel-600 transition hover:border-steel-900 hover:text-steel-900"
                      title="Edit patient"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(patient.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-steel-200 bg-white text-red-500 transition hover:border-red-500 hover:bg-red-50"
                      title="Delete patient"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {patient.symptoms && (
                  <div className="mt-3 rounded-xl bg-steel-50 px-3 py-2 text-xs text-steel-600">
                    <span className="font-medium text-steel-700">Symptoms: </span>
                    {patient.symptoms}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm font-medium text-steel-900 transition hover:bg-steel-50"
    >
      <span>{label}</span>
      <span className={checked ? 'text-steel-900 font-semibold' : 'text-steel-400'}>{checked ? 'On' : 'Off'}</span>
    </button>
  )
}
