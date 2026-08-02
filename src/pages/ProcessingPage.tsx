import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, AlertTriangle, BrainCircuit, ClipboardList, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { useWorkflow } from '../context/workflow-context'
import { ROUTES } from '../utils/routes'

const processingMessages = [
  'Analyzing patient information...',
  'Running stroke prediction model...',
  'Processing brain scan...',
  'Generating explainable insights...',
  'Preparing clinical report...',
]

export function ProcessingPage() {
  const navigate = useNavigate()
  const { runBackendAnalysis, scan } = useWorkflow()
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [backendDone, setBackendDone] = useState(false)

  useEffect(() => {
    let active = true

    runBackendAnalysis()
      .then(() => {
        if (active) {
          setBackendDone(true)
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : 'Backend processing failed')
        }
      })

    return () => {
      active = false
    }
  }, [runBackendAnalysis])

  useEffect(() => {
    if (errorMessage) return undefined

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval)
          return 100
        }

        if (backendDone) {
          const next = current + 5
          if (next >= 100) {
            window.clearInterval(interval)
            return 100
          }
          return next
        }

        if (current < 90) {
          return current + 1.35
        }

        return Math.min(98, current + 0.1)
      })
    }, 30)

    return () => window.clearInterval(interval)
  }, [backendDone, errorMessage])

  useEffect(() => {
    if (progress >= 100 && backendDone) {
      navigate(ROUTES.results, { replace: true })
    }
  }, [progress, backendDone, navigate])

  const step = Math.min(processingMessages.length - 1, Math.floor((progress / 100) * processingMessages.length))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 3 of 6"
        title="AI processing"
        description="This screen simulates the model pipeline with a controlled, professional loading sequence before the results dashboard appears."
      />

      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500 bg-red-50 p-4 text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Processing workflow</CardTitle>
            <CardDescription>Each stage mirrors a backend call that will later be connected to FastAPI services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-3xl border border-steel-900 bg-steel-50 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900 shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-500">Current step</div>
                  <div className="text-lg font-semibold text-steel-900">{processingMessages[step]}</div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={progress} />
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
                      active ? 'border-steel-900 bg-white shadow-sm' : 'border-steel-900 bg-white text-steel-400',
                    ].join(' ')}
                  >
                    <div className={['flex h-10 w-10 items-center justify-center rounded-full border border-steel-900', active ? 'bg-steel-900 text-white' : 'bg-white text-steel-500'].join(' ')}>
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

        <Card className="bg-white text-steel-900">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">Workflow status</Badge>
            <CardTitle>Background processing in progress</CardTitle>
            <CardDescription>The UI advances automatically to the results view after the simulated processing completes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-steel-900 bg-white p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-500">Scan modality</div>
              <div className="mt-2 text-lg font-semibold">{scan.modality}</div>
            </div>

            <div className="rounded-3xl border border-steel-900 bg-white p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-500">Transition</div>
              <div className="mt-2 text-sm leading-6 text-steel-600">
                Preparing mock inference outputs, clinical risk drivers, and the report payload for the next screen.
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-3xl border border-steel-900 bg-white p-5 text-steel-900">
              <Sparkles className="h-5 w-5" />
              <div>
                <div className="font-semibold">Explanations enabled</div>
                <div className="text-sm text-steel-600">Risk factors and imaging cues are surfaced for the clinician.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
