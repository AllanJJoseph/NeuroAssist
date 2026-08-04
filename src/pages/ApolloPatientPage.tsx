import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LogOut, ArrowLeft, CheckCircle, Download,
  ClipboardCheck, ShieldAlert, AlertTriangle, FileText, Brain
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { PageHeader } from '../components/layout/PageHeader'
import { BrainScanPreview } from '../components/visuals/BrainScanPreview'
import { ContributionBars } from '../components/visuals/ContributionBars'
import { RiskMeter } from '../components/visuals/RiskMeter'
import { StrokeClock } from '../components/StrokeClock'
import { TransferStatusTimeline } from '../components/TransferStatusTimeline'
import { getTransferById, updateTransfer, computeElapsed, type TransferRecord } from '../lib/registry'
import { generateAndDownloadPdf } from '../lib/pdfBuilder'
import {
  DEMO_HOSPITAL_KEY,
  DEFAULT_RECEIVING_HOSPITAL,
  SENDING_HOSPITAL,
} from '../lib/hospitalConfig'
import { ROUTES } from '../utils/routes'
import { API_BASE_URL } from '../services/api'
import type { ReactNode } from 'react'

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-steel-900 bg-white px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900 shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{label}</div>
        <div className="text-base font-semibold text-steel-900">{value}</div>
      </div>
    </div>
  )
}

export function ApolloPatientPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [transfer, setTransfer] = useState<TransferRecord | null>(null)
  const [accepted, setAccepted] = useState(false)

  // Auth guard
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_HOSPITAL_KEY) !== 'Apollo') {
      navigate(ROUTES.apolloLogin, { replace: true })
    }
  }, [navigate])

  // Load transfer and mark as Viewed
  useEffect(() => {
    if (!id) return
    const t = getTransferById(id)
    if (!t) return
    if (t.status === 'Received' || t.status === 'Pending') {
      const now = new Date().toISOString()
      updateTransfer(id, { status: 'Viewed', viewedAt: now })
      setTransfer({ ...t, status: 'Viewed', viewedAt: now })
    } else {
      setTransfer(t)
    }
    setAccepted(t.status === 'Accepted')
  }, [id])

  const handleAccept = () => {
    if (!transfer) return
    const now = new Date().toISOString()
    updateTransfer(transfer.id, {
      status: 'Accepted',
      acceptedBy: DEFAULT_RECEIVING_HOSPITAL,
      acceptedAt: now,
    })
    setTransfer((prev) =>
      prev ? { ...prev, status: 'Accepted', acceptedBy: DEFAULT_RECEIVING_HOSPITAL, acceptedAt: now } : prev,
    )
    setAccepted(true)
  }

  const handleDownloadPdf = async () => {
    if (!transfer) return
    const { analysisSnapshot: analysis, patientSnapshot: patient, scanSnapshot: scan, strokeOnsetTime } = transfer
    const reportId = `NA-${new Date().toISOString().slice(0, 10)}`
    const elapsed = strokeOnsetTime ? computeElapsed(strokeOnsetTime) : ''

    const patientForm = {
      name: patient.name, age: patient.age, gender: patient.gender,
      systolic: patient.systolic, diastolic: patient.diastolic, glucose: patient.glucose,
      bmi: patient.bmi, smokingHistory: patient.smokingHistory,
      hypertension: patient.hypertension, diabetes: patient.diabetes,
      heartDisease: patient.heartDisease, previousStroke: patient.previousStroke,
      symptoms: patient.symptoms,
    }
    const scanForm = {
      modality: scan.modality as 'CT' | 'MRI',
      fileName: scan.fileName,
      previewUrl: scan.previewUrl,
      uploadProgress: 100,
    }
    await generateAndDownloadPdf({
      patient: patientForm,
      scan: scanForm,
      analysis,
      reportId,
      strokeOnsetTime,
      elapsedAtGeneration: elapsed,
      transfer,
    })
  }

  const handleLogout = () => {
    sessionStorage.removeItem(DEMO_HOSPITAL_KEY)
    navigate(ROUTES.apolloLogin, { replace: true })
  }

  if (!transfer) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-center justify-center py-20 text-steel-500">Loading transfer details...</div>
      </div>
    )
  }

  const { analysisSnapshot: analysis, patientSnapshot: patient, scanSnapshot: scan, strokeOnsetTime } = transfer
  const heatmapUrl = scan.gradcamPath ? `${API_BASE_URL}${scan.gradcamPath}` : undefined

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.apolloDashboard)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <PageHeader
            eyebrow={`${DEFAULT_RECEIVING_HOSPITAL} · Incoming Transfer · ${transfer.priority}`}
            title={patient.name}
            description={`Referred from ${SENDING_HOSPITAL} · ${new Date(transfer.transferredAt).toLocaleString()}`}
          />
        </div>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {!accepted ? (
            <Button onClick={handleAccept}>
              <CheckCircle className="h-4 w-4" />
              Accept Transfer
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-green-500 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
              <CheckCircle className="h-4 w-4" />
              Accepted
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stroke Clock */}
      {strokeOnsetTime && (
        <div className="mt-6">
          <StrokeClock onsetTime={strokeOnsetTime} />
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>From the referring hospital record</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                {[
                  ['Name', patient.name],
                  ['Age', `${patient.age} years`],
                  ['Gender', patient.gender],
                  ['Blood Group', patient.bloodGroup || '—'],
                  ['Phone', patient.phoneNumber || '—'],
                  ['BMI', patient.bmi || '—'],
                  ['BP', `${patient.systolic}/${patient.diastolic} mmHg`],
                  ['Glucose', `${patient.glucose} mg/dL`],
                  ['Smoking', patient.smokingHistory],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-steel-50 px-4 py-2">
                    <span className="text-steel-500">{label}</span>
                    <span className="font-medium text-steel-900">{value}</span>
                  </div>
                ))}
              </div>
              {patient.symptoms && (
                <div className="mt-3 rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm text-steel-700">
                  <span className="font-semibold text-steel-900">Symptoms: </span>{patient.symptoms}
                </div>
              )}
              {[patient.hypertension && 'Hypertension', patient.diabetes && 'Diabetes', patient.heartDisease && 'Heart Disease', patient.previousStroke && 'Previous Stroke'].filter(Boolean).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[patient.hypertension && 'Hypertension', patient.diabetes && 'Diabetes', patient.heartDisease && 'Heart Disease', patient.previousStroke && 'Previous Stroke'].filter(Boolean).map((c) => (
                    <span key={c as string} className="rounded-full bg-steel-100 px-3 py-1 text-xs font-medium text-steel-700">{c as string}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Primary Assessment — mirrors ResultsPage */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Assessment</CardTitle>
              <CardDescription>AI stroke risk results from referring hospital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <RiskMeter value={analysis.strokeProbability} label="Stroke probability" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Metric label="Confidence" value={`${analysis.confidence}%`} icon={<ClipboardCheck className="h-4 w-4" />} />
                <Metric label="Stroke Type" value={analysis.strokeType} icon={<ShieldAlert className="h-4 w-4" />} />
                <Metric label="Risk Level" value={analysis.riskLevel} icon={<AlertTriangle className="h-4 w-4" />} />
                <Metric label="Modality" value={scan.modality} icon={<FileText className="h-4 w-4" />} />
              </div>
              <div className="rounded-3xl border border-steel-900 bg-white p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-700">Summary</div>
                <p className="mt-2 text-sm leading-7 text-steel-700">{analysis.reportSummary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contributing Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Major Contributing Risk Factors</CardTitle>
              <CardDescription>Ranked signal contributions from the AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <ContributionBars items={analysis.signalBreakdown} />
            </CardContent>
          </Card>

          {/* Clinical Considerations */}
          <Card>
            <CardHeader>
              <CardTitle>Next Clinical Considerations</CardTitle>
              <CardDescription>Suggested next steps for physician review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.clinicalConsiderations.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-steel-900 bg-white px-4 py-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-steel-900" />
                  <div className="text-sm leading-6 text-steel-700">{item}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Brain Scan + GradCAM — reuses BrainScanPreview */}
          <BrainScanPreview
            highlightLabel={analysis.lesionLocation}
            previewUrl={scan.previewUrl}
            heatmapUrl={heatmapUrl}
            title={heatmapUrl ? 'Grad-CAM heatmap' : 'Brain scan visualization'}
            subtitle={heatmapUrl ? 'Image AI activation map' : 'AI lesion localization overlay'}
          />

          {/* Image AI Section — mirrors ResultsPage */}
          {analysis.imagePrediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Image AI (EfficientNet-B0)
                </CardTitle>
                <CardDescription>Grad-CAM visualization from the image prediction model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Metric label="Prediction" value={analysis.imagePrediction.prediction} icon={<Brain className="h-4 w-4" />} />
                  <Metric label="Image Confidence" value={`${(analysis.imagePrediction.confidence * 100).toFixed(2)}%`} icon={<ClipboardCheck className="h-4 w-4" />} />
                </div>
                {heatmapUrl && (
                  <div className="rounded-3xl border border-steel-900 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500 mb-3">Grad-CAM Heatmap</div>
                    <img src={heatmapUrl} alt="Grad-CAM" className="w-full rounded-2xl object-contain" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transfer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>Referral information from {SENDING_HOSPITAL}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ['From', SENDING_HOSPITAL],
                ['To', transfer.receivingHospital],
                ['Doctor', transfer.receivingDoctor],
                ['Priority', transfer.priority],
                ['Elapsed at Transfer', transfer.elapsedAtTransfer || '—'],
                ['Transferred At', new Date(transfer.transferredAt).toLocaleString()],
                ...(transfer.acceptedAt ? [['Accepted At', new Date(transfer.acceptedAt).toLocaleString()]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-steel-50 px-4 py-2">
                  <span className="text-steel-500">{label}</span>
                  <span className="font-medium text-steel-900 text-right">{value}</span>
                </div>
              ))}
              {transfer.transferNotes && (
                <div className="rounded-2xl border border-steel-200 bg-white px-4 py-3 mt-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500 mb-1">Transfer Notes</div>
                  <p className="text-sm text-steel-700">{transfer.transferNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Timeline</CardTitle>
              <CardDescription>Audit trail of this referral</CardDescription>
            </CardHeader>
            <CardContent>
              <TransferStatusTimeline transfer={transfer} />
            </CardContent>
          </Card>

          <Separator />

          {/* Accept Action */}
          {!accepted ? (
            <Card className="border-2 border-steel-900">
              <CardContent className="p-6 space-y-4">
                <div className="text-sm font-semibold text-steel-900">Accept this transfer?</div>
                <p className="text-sm text-steel-600 leading-6">
                  Accepting confirms that {DEFAULT_RECEIVING_HOSPITAL} has received and reviewed the patient referral. This action will be timestamped and visible to the referring hospital.
                </p>
                <Button className="w-full" onClick={handleAccept}>
                  <CheckCircle className="h-4 w-4" />
                  Accept Transfer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-green-800">Transfer Accepted</div>
                    <div className="text-xs text-green-700 mt-0.5">
                      {transfer.acceptedAt ? new Date(transfer.acceptedAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
