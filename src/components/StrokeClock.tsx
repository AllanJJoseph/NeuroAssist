import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

type StrokeClockProps = {
  onsetTime: string | null | undefined
  variant?: 'default' | 'compact'
}

function computeElapsed(onsetIso: string): string {
  const diff = Math.max(0, Date.now() - new Date(onsetIso).getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getRiskColor(onsetIso: string): { bg: string; border: string; text: string; badge: string } {
  const hours = (Date.now() - new Date(onsetIso).getTime()) / 3_600_000
  if (hours < 1.5) return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', badge: 'bg-green-100 text-green-800' }
  if (hours < 4.5) return { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' }
  return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-800' }
}

/**
 * StrokeClock — standalone, reusable component.
 * Knows nothing about PatientFormState or workflow context.
 * Simply accepts an ISO onset timestamp and ticks every second.
 */
export function StrokeClock({ onsetTime, variant = 'default' }: StrokeClockProps) {
  const [elapsed, setElapsed] = useState<string>('')

  useEffect(() => {
    if (!onsetTime) return
    setElapsed(computeElapsed(onsetTime))
    const interval = window.setInterval(() => {
      setElapsed(computeElapsed(onsetTime))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [onsetTime])

  if (!onsetTime) return null

  const colors = getRiskColor(onsetTime)
  const onsetDate = new Date(onsetTime)

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${colors.border} ${colors.bg}`}>
        <Clock className={`h-4 w-4 shrink-0 ${colors.text}`} />
        <div className="flex flex-col">
          <span className={`font-mono text-xs font-bold tracking-wide whitespace-nowrap ${colors.text}`}>{elapsed}</span>
          <span className="text-[10px] text-steel-500 whitespace-nowrap">
            Onset: {onsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-3xl border-2 ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 ${colors.border} ${colors.bg}`}>
          <Clock className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div>
          <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${colors.text}`}>Stroke Clock</div>
          <div className="text-sm font-medium text-steel-700">Active monitoring</div>
        </div>
        <div className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}>
          <AlertTriangle className="h-3 w-3" />
          Live
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-steel-200 bg-white px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Stroke Started</div>
          <div className={`mt-1 text-sm font-semibold ${colors.text}`}>
            {onsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs text-steel-500">{onsetDate.toLocaleDateString()}</div>
        </div>
        <div className="rounded-2xl border border-steel-200 bg-white px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Elapsed Time</div>
          <div className={`mt-1 font-mono text-2xl font-bold tracking-wider ${colors.text}`}>{elapsed}</div>
          <div className="text-xs text-steel-500">HH : MM : SS</div>
        </div>
      </div>
    </div>
  )
}
