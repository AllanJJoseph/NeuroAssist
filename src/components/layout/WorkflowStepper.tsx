import { Link, useLocation } from 'react-router-dom'
import { workflowSteps } from '../../lib/workflow'
import { BackButton } from './BackButton'
import { NextButton } from './NextButton'

export function WorkflowStepper() {
  const location = useLocation()
  const activeIndex = Math.max(0, workflowSteps.findIndex((step) => step.path === location.pathname))
  const stepCount = workflowSteps.length
  const indicatorWidth = `${100 / stepCount}%`

  return (
    <nav aria-label="Clinical workflow progress" className="border-b border-steel-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="w-24 shrink-0"><BackButton /></div>
        
        <ol className="relative grid flex-1 min-w-[38rem] grid-cols-6 overflow-hidden rounded-2xl border border-black bg-white p-1 shadow-sm lg:min-w-0" aria-label="Clinical workflow steps">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-1 rounded-[0.9rem] bg-black transition-transform duration-300 ease-out"
            style={{
              width: `calc(${indicatorWidth} - 0.5rem)`,
              transform: `translateX(calc(${activeIndex} * 100%))`,
            }}
          />

          {workflowSteps.map((step, index) => {
            const isActive = index === activeIndex

            return (
              <li key={step.path} className="relative z-10">
                <Link
                  to={step.path}
                  aria-current={isActive ? 'step' : undefined}
                  className="flex h-10 items-center justify-center rounded-[0.9rem] px-3 text-xs font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-sm"
                >
                  <span className={isActive ? 'text-white' : 'text-black'}>{step.label}</span>
                </Link>
              </li>
            )
          })}
        </ol>

        <div className="flex w-24 shrink-0 justify-end"><NextButton /></div>
      </div>
    </nav>
  )
}
