import { useState } from 'react'
import { Send, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import { TransferStatusTimeline } from './TransferStatusTimeline'
import {
  HOSPITALS,
  APOLLO_DOCTORS,
  SENDING_HOSPITAL,
  DEFAULT_RECEIVING_HOSPITAL,
} from '../lib/hospitalConfig'
import {
  getTransfers,
  saveTransfer,
  computeElapsed,
  type TransferRecord,
  type TransferPriority,
} from '../lib/registry'
import type { PatientFormState, ScanState, AnalysisResult } from '../lib/workflow'

type HospitalTransferPanelProps = {
  patient: PatientFormState
  scan: ScanState
  analysis: AnalysisResult
  strokeOnsetTime: string
  // Registry patient ID if patient was imported from registry
  patientId?: string
  // Full registry patient snapshot (for Apollo to view)
  patientSnapshot?: import('../lib/registry').RegistryPatient | null
  reportGeneratedAt: string
}

export function HospitalTransferPanel({
  patient,
  scan,
  analysis,
  strokeOnsetTime,
  patientId,
  patientSnapshot,
  reportGeneratedAt,
}: HospitalTransferPanelProps) {
  const [receivingHospital, setReceivingHospital] = useState<string>(DEFAULT_RECEIVING_HOSPITAL)
  const [receivingDoctor, setReceivingDoctor] = useState<string>(APOLLO_DOCTORS[0])
  const [priority, setPriority] = useState<TransferPriority>('Emergency')
  const [notes, setNotes] = useState('')
  const [transferred, setTransferred] = useState<TransferRecord | null>(() => {
    if (!patientId) return null
    const existing = getTransfers().find((t) => t.patientId === patientId)
    return existing ?? null
  })

  const handleTransfer = () => {
    const now = new Date().toISOString()
    const elapsed = strokeOnsetTime ? computeElapsed(strokeOnsetTime) : ''

    // Build a minimal registry snapshot if no full snapshot provided
    const snapshot: import('../lib/registry').RegistryPatient = patientSnapshot ?? {
      id: patientId ?? crypto.randomUUID(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phoneNumber: '',
      bloodGroup: '',
      height: '',
      weight: '',
      bmi: patient.bmi,
      systolic: patient.systolic,
      diastolic: patient.diastolic,
      glucose: patient.glucose,
      smokingHistory: patient.smokingHistory,
      hypertension: patient.hypertension,
      diabetes: patient.diabetes,
      heartDisease: patient.heartDisease,
      previousStroke: patient.previousStroke,
      symptoms: patient.symptoms,
      strokeOnsetTime,
      createdAt: now,
      updatedAt: now,
    }

    const record: TransferRecord = {
      id: crypto.randomUUID(),
      patientId: snapshot.id,
      patientSnapshot: snapshot,
      analysisSnapshot: analysis,
      scanSnapshot: {
        modality: scan.modality,
        fileName: scan.fileName,
        previewUrl: scan.previewUrl,
        gradcamPath: analysis.imagePrediction?.heatmapPath ?? '',
      },
      strokeOnsetTime,
      elapsedAtTransfer: elapsed,
      sendingHospital: SENDING_HOSPITAL,
      receivingHospital,
      receivingDoctor,
      priority,
      transferNotes: notes,
      transferredAt: now,
      reportGeneratedAt,
      status: 'Pending',
    }

    saveTransfer(record)
    setTransferred(record)
  }

  return (
    <Card className="border-2 border-steel-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Hospital Transfer</CardTitle>
            <CardDescription>Transfer this patient to a receiving hospital</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {transferred ? (
          <>
            {/* Already transferred — show status */}
            <div className="flex items-center gap-3 rounded-2xl border border-green-500 bg-green-50 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-green-800">Transfer sent successfully</div>
                <div className="text-xs text-green-700">
                  {transferred.receivingHospital} — {transferred.receivingDoctor} — {transferred.priority}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">
                Transfer Timeline
              </div>
              <TransferStatusTimeline transfer={transferred} />
            </div>

            {transferred.acceptedAt && (
              <div className="flex items-center gap-3 rounded-2xl border border-steel-900 bg-white px-4 py-3">
                <CheckCircle className="h-5 w-5 text-steel-900 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-steel-900">
                    Accepted by {transferred.receivingHospital}
                  </div>
                  <div className="text-xs text-steel-500">
                    {transferred.acceptedBy} · {transferred.acceptedAt ? new Date(transferred.acceptedAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Transfer form */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Receiving Hospital</Label>
                <Select
                  value={receivingHospital}
                  onChange={(e) => setReceivingHospital(e.target.value)}
                >
                  {HOSPITALS.filter((h) => h.name !== SENDING_HOSPITAL).map((h) => (
                    <option key={h.id} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Receiving Doctor</Label>
                <Select
                  value={receivingDoctor}
                  onChange={(e) => setReceivingDoctor(e.target.value)}
                >
                  {APOLLO_DOCTORS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TransferPriority)}
                >
                  <option>Emergency</option>
                  <option>Urgent</option>
                  <option>Routine</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sending Hospital</Label>
                <div className="flex h-10 items-center rounded-xl border border-steel-200 bg-steel-50 px-3 text-sm text-steel-600">
                  {SENDING_HOSPITAL}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transfer Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Clinical notes for the receiving team..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-amber-400 bg-amber-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                Transferring will send all patient data, AI results, and the generated report to the receiving hospital.
              </p>
            </div>

            <Button className="w-full" onClick={handleTransfer}>
              <Send className="h-4 w-4" />
              Transfer Patient to {receivingHospital}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
