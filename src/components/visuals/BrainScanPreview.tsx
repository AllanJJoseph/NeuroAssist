import { Badge } from '../ui/badge'

type BrainScanPreviewProps = {
  title?: string
  subtitle?: string
  highlightLabel?: string
  previewUrl?: string
}

function getLesionCoordinates(locationText: string | undefined): { x: number; y: number } {
  if (!locationText) return { x: 267, y: 155 }

  const lower = locationText.toLowerCase()
  let x = 210
  let y = 160

  if (lower.includes('left')) {
    x = 145
  } else if (lower.includes('right')) {
    x = 265
  }

  if (lower.includes('basal') || lower.includes('edema') || lower.includes('deep')) {
    y = 165
    if (x === 210) x = 180
  } else if (lower.includes('frontal') || lower.includes('anterior')) {
    y = 105
  } else if (lower.includes('parietal') || lower.includes('mca') || lower.includes('territory')) {
    y = 145
  } else if (lower.includes('occipital') || lower.includes('posterior')) {
    y = 205
  }

  return { x, y }
}

export function BrainScanPreview({
  title = 'Brain scan visualization',
  subtitle = 'AI lesion localization overlay',
  highlightLabel = 'Suspected lesion',
  previewUrl,
}: BrainScanPreviewProps) {
  const { x, y } = getLesionCoordinates(highlightLabel)

  const leftPercent = (x / 420) * 100
  const topPercent = (y / 300) * 100

  return (
    <div className="overflow-hidden rounded-3xl border border-steel-900 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-steel-900 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-steel-900">{title}</div>
          <div className="text-xs text-steel-500">{subtitle}</div>
        </div>
        <Badge variant="secondary">{highlightLabel}</Badge>
      </div>

      <div className="relative aspect-[4/3] bg-steel-900 p-6 overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt="Uploaded brain scan" className="h-full w-full object-cover rounded-2xl opacity-90" />
        ) : (
          <svg viewBox="0 0 420 300" className="h-full w-full">
            <defs>
              <linearGradient id="brainFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5f5f5" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <radialGradient id="lesionRedGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>

            <path
              d="M132 52c-31 0-57 22-62 53-1 7-1 15 1 22-11 7-18 19-18 32 0 21 16 38 37 40 8 25 31 43 58 43 20 0 39-9 51-24 9 4 18 6 28 6 39 0 71-32 71-72 0-16-6-31-16-43 8-12 13-27 13-43 0-42-34-76-76-76-18 0-35 6-49 16-12-8-27-14-38-14Z"
              fill="url(#brainFill)"
              stroke="#171717"
              strokeWidth="4"
              opacity="0.95"
            />

            <path d="M151 90c14 8 22 20 26 34M109 130c18-1 35 6 46 19M248 100c-18 8-30 22-35 40M233 171c14 2 24 10 31 22" fill="none" stroke="#737373" strokeWidth="5" strokeLinecap="round" />

            <path d="M87 94c-15 21-22 45-22 71 0 58 45 105 103 105" fill="none" stroke="#d4d4d4" strokeWidth="10" strokeLinecap="round" opacity="0.55" />

            <g className="pointer-events-none">
              <circle cx={x} cy={y} r="36" fill="url(#lesionRedGlow)" opacity="0.85" />
              <circle cx={x} cy={y} r="28" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.9" />
              <circle cx={x} cy={y} r="16" fill="#ef4444" opacity="0.35" />
              <circle cx={x} cy={y} r="8" fill="#dc2626" opacity="0.9" />
              <circle cx={x} cy={y} r="3" fill="#ffffff" />
              <line x1={x - 18} y1={y} x2={x + 18} y2={y} stroke="#ef4444" strokeWidth="1.5" opacity="0.85" />
              <line x1={x} y1={y - 18} x2={x} y2={y + 18} stroke="#ef4444" strokeWidth="1.5" opacity="0.85" />
            </g>
          </svg>
        )}

        <div
          className="absolute pointer-events-none z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
        >
          <span className="absolute h-16 w-16 rounded-full bg-red-500/40 animate-ping" />
          <span className="absolute h-12 w-12 rounded-full border-2 border-red-500 bg-red-500/20 shadow-lg shadow-red-500/50" />
          <span className="relative h-4 w-4 rounded-full bg-red-600 border-2 border-white shadow-md" />
        </div>

        <div className="absolute left-6 top-6 z-20 rounded-2xl border border-steel-900 bg-white/95 backdrop-blur-md px-4 py-3 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Lesion marker</div>
          </div>
          <div className="mt-1 text-sm font-medium text-steel-900">
            {highlightLabel || 'Highlighted region with elevated signal'}
          </div>
        </div>
      </div>
    </div>
  )
}
