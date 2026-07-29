import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Badge } from '../ui/badge'
import { workflowSteps } from '../../lib/workflow'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const activeIndex = workflowSteps.findIndex((step) => step.path === location.pathname)
  const safeIndex = activeIndex < 0 ? 0 : activeIndex
  const showStepper = location.pathname !== '/'

  return (
    <div className="min-h-screen text-steel-900">
      <header className="border-b border-steel-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-medical-600 text-white shadow-soft">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-steel-900">NeuroAssist</div>
              <div className="text-xs text-steel-500">AI stroke decision support demo</div>
            </div>
          </Link>

          <Badge variant="secondary" className="hidden sm:inline-flex">
            Mock clinical workflow
          </Badge>
        </div>

        {showStepper ? (
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
            <div className="grid gap-2 rounded-2xl border border-steel-200 bg-steel-50/85 p-2 sm:grid-cols-6">
              {workflowSteps.map((step, index) => {
                const isActive = index === safeIndex
                const isComplete = index < safeIndex

                return (
                  <div
                    key={step.path}
                    className={[
                      'flex items-center justify-between rounded-xl px-3 py-2 text-sm transition',
                      isActive ? 'bg-white text-medical-700 shadow-sm' : 'text-steel-500',
                      isComplete ? 'bg-white/80 text-steel-700' : '',
                    ].join(' ')}
                  >
                    <span className="font-medium">{step.label}</span>
                    <ArrowRight className={["h-4 w-4", isActive ? 'text-medical-600' : 'text-steel-300'].join(' ')} />
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>
    </div>
  )
}
