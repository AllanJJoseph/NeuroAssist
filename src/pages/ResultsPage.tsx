import { useEffect, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Brain, ClipboardCheck, FileText, ShieldAlert, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { PageHeader } from '../components/layout/PageHeader'
import { BrainScanPreview } from '../components/visuals/BrainScanPreview'
import { ContributionBars } from '../components/visuals/ContributionBars'
import { RiskMeter } from '../components/visuals/RiskMeter'
import { Separator } from '../components/ui/separator'
import { useWorkflow } from '../context/workflow-context'
import { useStrokeOnset } from '../context/stroke-onset-context'
import { StrokeClock } from '../components/StrokeClock'
import { TransferStatusTimeline } from '../components/TransferStatusTimeline'
import { getTransfers } from '../lib/registry'
import { ROUTES } from '../utils/routes'
import { API_BASE_URL } from '../services/api'

export function ResultsPage() {
  const navigate = useNavigate()
  const { analysis, patient, scan } = useWorkflow()
  const { strokeOnsetTime } = useStrokeOnset()

  useEffect(() => {
    if (!analysis) {
      navigate(ROUTES.patient, { replace: true })
    }
  }, [analysis, navigate])

  if (!analysis) {
    return <Navigate to={ROUTES.patient} replace />
  }

  const existingTransfer = getTransfers().find(
    (t) => t.patientSnapshot.name === patient.name && t.patientSnapshot.age === patient.age,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 4 of 6"
        title="Results dashboard"
        description="Clinical AI stroke risk assessment, imaging analysis, and Image AI prediction with Grad-CAM visualization."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => navigate(ROUTES.report)}>
              Generate Report
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* FEATURE 4: Stroke Clock Widget if onset time present */}
      {strokeOnsetTime && (
        <div className="mt-6">
          <StrokeClock onsetTime={strokeOnsetTime} />
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary assessment</CardTitle>
              <CardDescription>Probability, confidence, predicted type, and risk level in one place.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <RiskMeter value={analysis.strokeProbability} label="Stroke probability" />

              <div className="grid gap-4 sm:grid-cols-2">
                <Metric label="Confidence" value={`${analysis.confidence}%`} icon={<ClipboardCheck className="h-4 w-4" />} />
                <Metric label="Predicted type" value={analysis.strokeType} icon={<ShieldAlert className="h-4 w-4" />} />
                <Metric label="Risk level" value={analysis.riskLevel} icon={<AlertTriangle className="h-4 w-4" />} />
                <Metric label="Modality" value={scan.modality} icon={<FileText className="h-4 w-4" />} />
              </div>

              <div className="rounded-3xl border border-steel-900 bg-white p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-700">Summary</div>
                <p className="mt-2 text-sm leading-7 text-steel-700">{analysis.reportSummary}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Major contributing risk factors</CardTitle>
              <CardDescription>Ranked influences that pushed the mock model toward the current result.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContributionBars items={analysis.signalBreakdown} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <BrainScanPreview
            highlightLabel={analysis.lesionLocation}
            previewUrl={scan.previewUrl}
            heatmapUrl={analysis.imagePrediction?.heatmapPath ? `${API_BASE_URL}${analysis.imagePrediction.heatmapPath}` : undefined}
            title={analysis.imagePrediction ? 'Grad-CAM heatmap' : 'Brain scan visualization'}
            subtitle={analysis.imagePrediction ? 'Image AI activation map' : 'AI lesion localization overlay'}
          />

          <Card>
            <CardHeader>
              <CardTitle>Imaging interpretation</CardTitle>
              <CardDescription>Placeholder scan with a highlighted region representing the suspected lesion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-steel-700">
              <div className="rounded-2xl bg-steel-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Lesion location</div>
                <div className="mt-1 text-base font-semibold text-steel-900">{analysis.lesionLocation}</div>
              </div>
              <div>{analysis.imagingSummary}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next clinical considerations</CardTitle>
              <CardDescription>Suggested next steps for physician review, not a final diagnosis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.clinicalConsiderations.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-steel-900 bg-white px-4 py-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-steel-900" />
                  <div className="text-sm leading-6 text-steel-700">{item}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white text-steel-900">
            <CardContent className="space-y-3 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-500">Workflow status</div>
              <div className="text-lg font-semibold">Analysis complete for {patient.name}</div>
              <Separator />
              <div className="text-sm leading-6 text-steel-600">
                This dashboard is ready to hand off into the clinical report view or to restart the workflow for a different patient.
              </div>
            </CardContent>
          </Card>

          {/* FEATURE 9, 10: Hospital Transfer Status Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Hospital Transfer Status
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.report)}>
                  Transfer Patient
                </Button>
              </div>
              <CardDescription>Track referral to receiving hospital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingTransfer ? (
                <>
                  <div className="rounded-2xl border border-steel-900 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-steel-900">
                        {existingTransfer.status === 'Accepted'
                          ? `Accepted by ${existingTransfer.receivingHospital}`
                          : existingTransfer.status === 'Viewed'
                          ? `Viewed by ${existingTransfer.receivingHospital}`
                          : existingTransfer.status === 'Received'
                          ? `Received by ${existingTransfer.receivingHospital}`
                          : `Transfer sent to ${existingTransfer.receivingHospital}`}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-steel-100 text-steel-800">
                        {existingTransfer.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-steel-500">
                      Doctor: {existingTransfer.receivingDoctor} · Priority: {existingTransfer.priority}
                    </div>
                  </div>
                  <TransferStatusTimeline transfer={existingTransfer} />
                </>
              ) : (
                <div className="rounded-2xl bg-steel-50 p-4 text-center text-sm text-steel-500">
                  No transfer initiated yet. Generate report to initiate hospital transfer.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image AI Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Image AI
              </CardTitle>
              <CardDescription>EfficientNet-B0 prediction with Grad-CAM visualization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.imagePrediction ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Metric
                      label="Prediction"
                      value={analysis.imagePrediction.prediction}
                      icon={<Brain className="h-4 w-4" />}
                    />
                    <Metric
                      label="Image confidence"
                      value={`${(analysis.imagePrediction.confidence * 100).toFixed(2)}%`}
                      icon={<ClipboardCheck className="h-4 w-4" />}
                    />
                  </div>
                  <div className="rounded-3xl border border-steel-900 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500 mb-3">Grad-CAM Heatmap</div>
                    <img
                      src={`${API_BASE_URL}${analysis.imagePrediction.heatmapPath}`}
                      alt="Grad-CAM Heatmap"
                      className="w-full rounded-2xl object-contain"
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl bg-steel-50 px-4 py-3 text-sm text-steel-500">
                  Image analysis unavailable.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-steel-900 bg-white px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900 shadow-sm">{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{label}</div>
        <div className="text-base font-semibold text-steel-900">{value}</div>
      </div>
    </div>
  )
}
