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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 5 of 6"
        title="Clinical report"
        description="A formatted summary suitable for a physician-facing handoff. PDF export is represented here as a placeholder action."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => navigate(ROUTES.results)}>
              Back to results
            </Button>
            <Button disabled>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
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
                <div key={section.title} className="rounded-3xl border border-steel-200 bg-steel-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{section.title}</div>
                  <p className="mt-2 text-sm leading-7 text-steel-700">{section.content}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-steel-200 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Risk factors</div>
                <ul className="mt-3 space-y-2">
                  {analysis.riskFactors.map((factor) => (
                    <li key={factor.label} className="flex items-start justify-between gap-4 border-b border-steel-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-steel-900">{factor.label}</div>
                        <div className="text-sm text-steel-500">{factor.detail}</div>
                      </div>
                      <div className="font-semibold text-medical-700">{factor.score}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-steel-200 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Imaging overview</div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-steel-700">
                  <p>Scan modality: {scan.modality}</p>
                  <p>Lesion location: {analysis.lesionLocation}</p>
                  <p>{analysis.imagingSummary}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
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
