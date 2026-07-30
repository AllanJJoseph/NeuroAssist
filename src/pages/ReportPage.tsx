import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { PageHeader } from '../components/layout/PageHeader'
import { Separator } from '../components/ui/separator'
import { useWorkflow } from '../context/workflow-context'
import { ROUTES } from '../utils/routes'

export function ReportPage() {
  const navigate = useNavigate()
  const { analysis, patient, scan } = useWorkflow()

  useEffect(() => {
    if (!analysis) {
      navigate(ROUTES.patient, { replace: true })
    }
  }, [analysis, navigate])

  if (!analysis) {
    return <Navigate to={ROUTES.patient} replace />
  }

  const reportSections = [
    { title: 'Patient summary', content: `${patient.name}, age ${patient.age}, ${patient.gender}. Blood pressure ${patient.systolic}/${patient.diastolic} mmHg, glucose ${patient.glucose} mg/dL, BMI ${patient.bmi}.` },
    { title: 'AI findings', content: `Estimated stroke probability ${analysis.strokeProbability}%, confidence ${analysis.confidence}%, predicted stroke type ${analysis.strokeType}, risk level ${analysis.riskLevel}.` },
    { title: 'Imaging analysis', content: analysis.imagingSummary },
    { title: 'Clinical considerations', content: analysis.clinicalConsiderations.join(' ') },
  ]

  const downloadReport = () => {
    const lines = [
      'NeuroAssist Clinical Report',
      `Generated: ${analysis.generatedAt}`,
      '',
      `Patient: ${patient.name}, age ${patient.age}, ${patient.gender}`,
      `Vitals: BP ${patient.systolic}/${patient.diastolic} mmHg, glucose ${patient.glucose} mg/dL, BMI ${patient.bmi}`,
      `Scan modality: ${scan.modality}`,
      `Stroke probability: ${analysis.strokeProbability}%`,
      `Confidence: ${analysis.confidence}%`,
      `Predicted stroke type: ${analysis.strokeType}`,
      `Risk level: ${analysis.riskLevel}`,
      '',
      'Clinical considerations:',
      ...analysis.clinicalConsiderations.map((item) => `- ${item}`),
      '',
      'Risk factors:',
      ...analysis.riskFactors.map((factor) => `- ${factor.label}: ${factor.detail} (${factor.score})`),
      '',
      `Imaging summary: ${analysis.imagingSummary}`,
      `Lesion location: ${analysis.lesionLocation}`,
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'neuroassist-clinical-report.txt'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 5 of 6"
        title="Clinical report"
        description="A formatted summary suitable for a physician-facing handoff. The download action exports a text report from the browser."
        action={
          <Button type="button" onClick={downloadReport}>
            <Download className="h-4 w-4" />
            Download report
          </Button>
        }
      />

      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>NeuroAssist clinical summary</CardTitle>
                <CardDescription>Mock report generated from the current workflow state.</CardDescription>
              </div>
              <Badge>Report ID NA-2026-07-29</Badge>
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

            <div className="rounded-3xl border border-steel-900 bg-white p-5 text-steel-900">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                Disclaimer
              </div>
              <p className="mt-2 text-sm leading-7">
                NeuroAssist provides decision support only. The output is based on mock data in this hackathon build and must not replace clinical judgment, direct patient assessment, or formal diagnostic review by the treating physician.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
