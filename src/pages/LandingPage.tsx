import { ArrowRight, Brain, FileScan, Sparkles, Stethoscope, Users, Activity, Send, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useWorkflow } from '../context/workflow-context'
import { ROUTES } from '../utils/routes'

const dashboardCards = [
  {
    title: 'Patient Registry',
    description: 'Manage EHR records, add/edit patients, and import into stroke evaluation.',
    icon: Users,
    path: ROUTES.registry,
    badge: 'EHR',
    action: 'Open Registry',
  },
  {
    title: 'Stroke Prediction',
    description: 'Start structured intake, upload CT/MRI scan, and trigger AI prediction.',
    icon: Activity,
    path: ROUTES.patient,
    badge: 'AI Pipeline',
    action: 'Start Analysis',
    isStart: true,
  },
  {
    title: 'Transfer Status',
    description: 'Track outgoing hospital transfers, doctor views, and acceptance status.',
    icon: Send,
    path: ROUTES.transfers,
    badge: 'Referrals',
    action: 'View Status',
  },
  {
    title: 'Apollo Portal',
    description: 'Simulated receiving hospital portal for incoming emergency referrals.',
    icon: Building2,
    path: ROUTES.apolloLogin,
    badge: 'Receiving Site',
    action: 'Open Portal',
  },
]

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
      {/* Hospital Dashboard Hub */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit">Aster Hospital · Clinical Decision Support Hub</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-steel-900">Hospital Dashboard</h2>
          <p className="text-sm text-steel-600">Select a module to manage patients, run stroke risk assessments, or monitor hospital transfers.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => (
            <Card
              key={card.title}
              className="group flex flex-col justify-between border-steel-200 bg-white transition hover:border-steel-900 hover:shadow-card cursor-pointer"
              onClick={() => {
                if (card.isStart) handleStart()
                else navigate(card.path)
              }}
            >
              <CardHeader className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-steel-900 bg-steel-50 text-steel-900 transition group-hover:bg-steel-900 group-hover:text-white">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary">{card.badge}</Badge>
                </div>
                <div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-5 text-steel-600">{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Button
                  size="sm"
                  variant={card.isStart ? 'default' : 'outline'}
                  className="w-full justify-between"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (card.isStart) handleStart()
                    else navigate(card.path)
                  }}
                >
                  <span>{card.action}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-steel-900 bg-white px-6 py-10 shadow-card sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.06),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.04),transparent_28%)]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
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
              <Button size="lg" variant="outline" onClick={() => navigate(ROUTES.registry)}>
                Patient Registry
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Workflow', '6-step guided flow'],
                ['Output', 'Probability, type, risk level'],
                ['Build', 'React, TypeScript, Tailwind'],
              ].map(([label, value]) => (
                <Card key={label} className="bg-white">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{label}</div>
                    <div className="mt-2 text-sm font-semibold text-steel-900">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden bg-steel-900 text-white shadow-soft">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%),linear-gradient(180deg,rgba(23,23,23,0.96),rgba(23,23,23,1))]" />
            <CardHeader className="relative">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900">
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
