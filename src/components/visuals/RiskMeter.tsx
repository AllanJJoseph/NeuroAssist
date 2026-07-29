type RiskMeterProps = {
  value: number
  label: string
}

export function RiskMeter({ value, label }: RiskMeterProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  return (
    <div className="flex items-center gap-5 rounded-3xl border border-steel-200 bg-white p-5 shadow-card">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 140 140" className="h-32 w-32 -rotate-90">
          <circle cx="70" cy="70" r={radius} className="fill-none stroke-steel-100" strokeWidth="14" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="fill-none stroke-medical-600 transition-all"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-semibold text-steel-900">{Math.round(value)}%</div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-steel-500">Stroke</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-500">{label}</div>
        <p className="max-w-sm text-sm leading-6 text-steel-600">
          Probability estimate calculated from structured patient data and mock imaging findings.
        </p>
      </div>
    </div>
  )
}
