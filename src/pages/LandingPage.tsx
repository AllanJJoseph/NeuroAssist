import { ArrowRight, Brain, FileScan, Sparkles, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useWorkflow } from '../context/workflow-context'
import { ROUTES } from '../utils/routes'

const highlights = [
  {
    icon: Stethoscope,
    title: 'Structured intake',
    description: 'Capture the clinical context quickly with a form designed for bedside use.',
  },
  {
    icon: FileScan,
    title: 'Imaging ready',
    description: 'CT and MRI upload flow with preview, progress feedback, and analysis handoff.',
  },
  {
    icon: Brain,
    title: 'Explainable AI output',
    description: 'Present stroke probability, risk drivers, and recommended considerations in one view.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { resetWorkflow } = useWorkflow()

  const handleStart = () => {
    resetWorkflow()
    navigate(ROUTES.patient)
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-steel-200 bg-white px-6 py-10 shadow-card sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.07),transparent_28%)]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="inline-flex">Clinical decision support for stroke triage</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-steel-900 sm:text-5xl lg:text-6xl">
                AI-assisted stroke assessment built for rapid clinical use.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-steel-600 sm:text-lg">
                NeuroAssist organizes patient data, scan review, and mock AI interpretation into a clean workflow that feels like hospital software. It is decision support only and does not replace physician judgment.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={handleStart}>
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate(ROUTES.results)}>
                View Demo Results
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Workflow', '6-step guided flow'],
                ['Output', 'Probability, type, risk level'],
                ['Build', 'React, TypeScript, Tailwind'],
              ].map(([label, value]) => (
                <Card key={label} className="bg-steel-50/80">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{label}</div>
                    <div className="mt-2 text-sm font-semibold text-steel-900">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden bg-steel-950 text-white shadow-soft">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(15,23,42,1))]" />
            <CardHeader className="relative">
              <Badge variant="secondary" className="w-fit bg-white/10 text-white ring-white/15">
                Stroke workflow snapshot
              </Badge>
              <CardTitle className="text-2xl text-white">Designed for high-pressure clinical moments</CardTitle>
              <CardDescription className="max-w-md text-steel-200">
                A focused layout, immediate data capture, and AI summaries that are easy to scan under time pressure.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {[
                'Structured intake with key stroke risk factors',
                'Image upload and mock analysis handoff',
                'Results dashboard with lesion preview and next steps',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-500/20 text-medical-200">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-sm text-white/90">{item}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-50 text-medical-700">
                <item.icon className="h-6 w-6" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}
