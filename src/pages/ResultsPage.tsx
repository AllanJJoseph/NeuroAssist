import { useEffect, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, ClipboardCheck, FileText, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { PageHeader } from '../components/layout/PageHeader'
import { BrainScanPreview } from '../components/visuals/BrainScanPreview'
import { ContributionBars } from '../components/visuals/ContributionBars'
import { RiskMeter } from '../components/visuals/RiskMeter'
import { Separator } from '../components/ui/separator'
import { useWorkflow } from '../context/workflow-context'

export function ResultsPage() {
  const navigate = useNavigate()
  const { analysis, patient, scan } = useWorkflow()

  useEffect(() => {
    if (!analysis) {
      navigate('/patient', { replace: true })
    }
  }, [analysis, navigate])

  if (!analysis) {
    return <Navigate to="/patient" replace />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 4 of 6"
        title="Results dashboard"
        description="A clinical-style view of the mock AI output, emphasizing probability, lesion context, and next considerations."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => navigate('/scan')}>
              Edit scan
            </Button>
            <Button onClick={() => navigate('/report')}>
              Open clinical report
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

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

              <div className="rounded-3xl border border-medical-200 bg-medical-50 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-medical-700">Summary</div>
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
          <BrainScanPreview highlightLabel={analysis.lesionLocation} />

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
                <div key={item} className="flex gap-3 rounded-2xl border border-steel-200 bg-white px-4 py-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-medical-500" />
                  <div className="text-sm leading-6 text-steel-700">{item}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-steel-950 text-white">
            <CardContent className="space-y-3 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-300">Workflow status</div>
              <div className="text-lg font-semibold">Analysis complete for {patient.name}</div>
              <Separator className="border-white/10" />
              <div className="text-sm leading-6 text-steel-200">
                This dashboard is ready to hand off into the clinical report view or to restart the workflow for a different patient.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-steel-200 bg-steel-50 px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-medical-700 shadow-sm">{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{label}</div>
        <div className="text-base font-semibold text-steel-900">{value}</div>
      </div>
    </div>
  )
}
