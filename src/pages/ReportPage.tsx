import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { PageHeader } from '../components/layout/PageHeader'
import { Separator } from '../components/ui/separator'
import { useWorkflow } from '../context/workflow-context'
import { useStrokeOnset } from '../context/stroke-onset-context'
import { StrokeClock } from '../components/StrokeClock'
import { HospitalTransferPanel } from '../components/HospitalTransferPanel'
import { generateAndDownloadPdf } from '../lib/pdfBuilder'
import { getTransfers, getRegistry, computeElapsed } from '../lib/registry'
import { API_BASE_URL } from '../services/api'
import { ROUTES } from '../utils/routes'

export function ReportPage() {
  const navigate = useNavigate()
  const { analysis, patient, scan } = useWorkflow()
  const { strokeOnsetTime } = useStrokeOnset()
  const [reportGeneratedAt] = useState(() => new Date().toISOString())

  useEffect(() => {
    if (!analysis) {
      navigate(ROUTES.patient, { replace: true })
    }
  }, [analysis, navigate])

  if (!analysis) {
    return <Navigate to={ROUTES.patient} replace />
  }

  const reportId = `NA-${new Date().toISOString().slice(0, 10)}`

  // Find registry record & existing transfer record if any
  const registryPatient = getRegistry().find((r) => r.name === patient.name && r.age === patient.age)
  const existingTransfer = getTransfers().find((t) => t.patientSnapshot.name === patient.name && t.patientSnapshot.age === patient.age)

  const reportSections = [
    { title: 'Patient summary', content: `${patient.name}, age ${patient.age}, ${patient.gender}. Blood pressure ${patient.systolic}/${patient.diastolic} mmHg, glucose ${patient.glucose} mg/dL, BMI ${patient.bmi}.` },
    { title: 'AI findings', content: `Estimated stroke probability ${analysis.strokeProbability}%, clinical confidence ${analysis.confidence}%, predicted stroke type ${analysis.strokeType}, risk level ${analysis.riskLevel}.` },
    { title: 'Imaging analysis', content: analysis.imagingSummary },
    { title: 'Clinical considerations', content: analysis.clinicalConsiderations.join(' ') },
  ]

  const downloadReport = async () => {
    const elapsed = strokeOnsetTime ? computeElapsed(strokeOnsetTime) : ''
    await generateAndDownloadPdf({
      patient,
      scan,
      analysis,
      reportId,
      strokeOnsetTime,
      elapsedAtGeneration: elapsed,
      transfer: existingTransfer,
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 5 of 6"
        title="Clinical report"
        description="A formatted summary suitable for physician-facing handoff. Download exports a professional PDF with Clinical AI results, Image AI findings, and the Grad-CAM heatmap."
        action={
          <Button type="button" onClick={downloadReport}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        }
      />

      {/* FEATURE 4: Live Stroke Clock Widget */}
      {strokeOnsetTime && (
        <div className="mt-6">
          <StrokeClock onsetTime={strokeOnsetTime} />
        </div>
      )}

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>NeuroAssist clinical summary</CardTitle>
                <CardDescription>Report generated from the current workflow analysis.</CardDescription>
              </div>
              <Badge>{reportId}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-7 text-steel-700">
            <div className="grid gap-4 lg:grid-cols-2">
              {reportSections.map((section) => (
                <div key={section.title} className="rounded-3xl border border-steel-900 bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{section.title}</div>
                  <p className="mt-2 text-sm leading-7 text-steel-700">{section.content}</p>
                </div>
              ))}
            </div>

            {/* Stroke Onset Time & Elapsed in Report View */}
            {strokeOnsetTime && (
              <div className="rounded-3xl border border-steel-900 bg-amber-50/50 p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Stroke Onset & Elapsed Time</div>
                  <div className="mt-1 text-sm font-semibold text-steel-900">
                    Started: {new Date(strokeOnsetTime).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-steel-500">Elapsed at Report Generation</div>
                  <div className="font-mono text-lg font-bold text-steel-900">
                    {computeElapsed(strokeOnsetTime)}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-steel-900 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Risk factors</div>
                <ul className="mt-3 space-y-2">
                  {analysis.riskFactors.map((factor) => (
                    <li key={factor.label} className="flex items-start justify-between gap-4 border-b border-steel-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-steel-900">{factor.label}</div>
                        <div className="text-sm text-steel-500">{factor.detail}</div>
                      </div>
                      <div className="font-semibold text-steel-900">{factor.score}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-steel-900 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Imaging overview</div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-steel-700">
                  <p>Scan modality: {scan.modality}</p>
                  <p>Lesion location: {analysis.lesionLocation}</p>
                  <p>{analysis.imagingSummary}</p>
                </div>
              </div>
            </div>

            {/* FEATURE 11: Original CT Scan and Grad-CAM image displayed side-by-side with AI interpretation */}
            {analysis.imagePrediction && (
              <>
                <Separator />
                <div className="rounded-3xl border border-steel-900 bg-white p-5 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">
                    Imaging & Grad-CAM Analysis (EfficientNet-B0)
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-steel-600">Original Scan ({scan.modality})</div>
                      {scan.previewUrl ? (
                        <img
                          src={scan.previewUrl}
                          alt="Original Brain Scan"
                          className="h-64 w-full rounded-2xl border border-steel-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-2xl border border-steel-200 bg-steel-50 text-steel-400">
                          Original Scan Preview
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-steel-600">Grad-CAM Heatmap Activation</div>
                      <img
                        src={`${API_BASE_URL}${analysis.imagePrediction.heatmapPath}`}
                        alt="Grad-CAM Heatmap"
                        className="h-64 w-full rounded-2xl border border-steel-200 object-contain bg-black/5"
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-steel-50 p-4 text-xs leading-6 text-steel-700">
                    <span className="font-semibold text-steel-900">AI Interpretation: </span>
                    The highlighted regions in the Grad-CAM heatmap indicate the areas of the scan that contributed most strongly to the AI prediction. Warmer colors (red/yellow) represent higher activation, suggesting these regions were most influential in the model's assessment.
                  </div>
                </div>
              </>
            )}

            <div className="rounded-3xl border border-steel-900 bg-white p-5 text-steel-900">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                Disclaimer
              </div>
              <p className="mt-2 text-sm leading-7">
                NeuroAssist provides clinical decision support only. This report must not replace clinical judgment, direct patient assessment, or formal diagnostic review by the treating physician.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FEATURE 5: Hospital Transfer Section */}
        <HospitalTransferPanel
          patient={patient}
          scan={scan}
          analysis={analysis}
          strokeOnsetTime={strokeOnsetTime}
          patientId={registryPatient?.id}
          patientSnapshot={registryPatient}
          reportGeneratedAt={reportGeneratedAt}
        />
      </div>
    </div>
  )
}
 