import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, BrainCircuit, ClipboardList, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { useWorkflow } from '../context/workflow-context'

const processingMessages = [
  'Analyzing patient information...',
  'Running stroke prediction model...',
  'Processing brain scan...',
  'Generating explainable insights...',
  'Preparing clinical report...',
]

export function ProcessingPage() {
  const navigate = useNavigate()
  const { analysis, finalizeAnalysis, scan } = useWorkflow()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!analysis) {
      finalizeAnalysis()
    }

    const interval = window.setInterval(() => {
      setStep((current) => Math.min(processingMessages.length - 1, current + 1))
    }, 900)

    const timeout = window.setTimeout(() => {
      navigate('/results')
    }, 4700)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [analysis, finalizeAnalysis, navigate])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 3 of 6"
        title="AI processing"
        description="This screen simulates the model pipeline with a controlled, professional loading sequence before the results dashboard appears."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Processing workflow</CardTitle>
            <CardDescription>Each stage mirrors a backend call that will later be connected to FastAPI services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-3xl border border-steel-200 bg-steel-50 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-medical-700 shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-500">Current step</div>
                  <div className="text-lg font-semibold text-steel-900">{processingMessages[step]}</div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={((step + 1) / processingMessages.length) * 100} />
              </div>
            </div>

            <div className="space-y-3">
              {processingMessages.map((message, index) => {
                const active = index <= step

                return (
                  <div
                    key={message}
                    className={[
                      'flex items-center gap-4 rounded-2xl border px-4 py-4 transition',
                      active ? 'border-medical-200 bg-white shadow-sm' : 'border-steel-200 bg-steel-50/70 text-steel-400',
                    ].join(' ')}
                  >
                    <div className={['flex h-10 w-10 items-center justify-center rounded-full', active ? 'bg-medical-50 text-medical-700' : 'bg-white text-steel-300'].join(' ')}>
                      {index === 0 ? <ClipboardList className="h-4 w-4" /> : index === 1 ? <Activity className="h-4 w-4" /> : index === 2 ? <BrainCircuit className="h-4 w-4" /> : index === 3 ? <Sparkles className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                    </div>
                    <div className="text-sm font-medium">{message}</div>
                    {active ? <Badge className="ml-auto">Active</Badge> : <Badge variant="secondary" className="ml-auto">Pending</Badge>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-steel-950 text-white">
          <CardHeader>
            <Badge variant="secondary" className="w-fit bg-white/10 text-white ring-white/15">Workflow status</Badge>
            <CardTitle className="text-white">Background processing in progress</CardTitle>
            <CardDescription className="text-steel-300">The UI advances automatically to the results view after the simulated processing completes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-300">Scan modality</div>
              <div className="mt-2 text-lg font-semibold">{scan.modality}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-300">Transition</div>
              <div className="mt-2 text-sm leading-6 text-steel-200">
                Preparing mock inference outputs, clinical risk drivers, and the report payload for the next screen.
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-3xl border border-medical-400/30 bg-medical-500/10 p-5 text-medical-50">
              <Sparkles className="h-5 w-5" />
              <div>
                <div className="font-semibold">Explanations enabled</div>
                <div className="text-sm text-medical-100">Risk factors and imaging cues are surfaced for the clinician.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
