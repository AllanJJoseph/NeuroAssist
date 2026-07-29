import { Badge } from '../ui/badge'

type BrainScanPreviewProps = {
  title?: string
  subtitle?: string
  highlightLabel?: string
}

export function BrainScanPreview({
  title = 'Synthetic scan preview',
  subtitle = 'Illustrative imaging placeholder for the hackathon demo',
  highlightLabel = 'Suspected lesion',
}: BrainScanPreviewProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-steel-200 bg-gradient-to-b from-white to-steel-50 shadow-card">
      <div className="flex items-center justify-between border-b border-steel-200 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-steel-900">{title}</div>
          <div className="text-xs text-steel-500">{subtitle}</div>
        </div>
        <Badge>{highlightLabel}</Badge>
      </div>

      <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_50%_40%,rgba(148,163,184,0.12),transparent_54%)] p-6">
        <svg viewBox="0 0 420 300" className="h-full w-full">
          <defs>
            <linearGradient id="brainFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            <linearGradient id="lesionGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <path
            d="M132 52c-31 0-57 22-62 53-1 7-1 15 1 22-11 7-18 19-18 32 0 21 16 38 37 40 8 25 31 43 58 43 20 0 39-9 51-24 9 4 18 6 28 6 39 0 71-32 71-72 0-16-6-31-16-43 8-12 13-27 13-43 0-42-34-76-76-76-18 0-35 6-49 16-12-8-27-14-38-14Z"
            fill="url(#brainFill)"
            stroke="#93c5fd"
            strokeWidth="4"
            opacity="0.95"
          />

          <path d="M151 90c14 8 22 20 26 34M109 130c18-1 35 6 46 19M248 100c-18 8-30 22-35 40M233 171c14 2 24 10 31 22" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />

          <circle cx="267" cy="155" r="26" fill="url(#lesionGlow)" opacity="0.82" />
          <circle cx="267" cy="155" r="14" fill="#ffffff" opacity="0.22" />
          <circle cx="267" cy="155" r="42" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="8 8" opacity="0.45" />

          <path d="M87 94c-15 21-22 45-22 71 0 58 45 105 103 105" fill="none" stroke="#bfdbfe" strokeWidth="10" strokeLinecap="round" opacity="0.55" />
        </svg>

        <div className="absolute left-8 top-8 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-soft backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Lesion marker</div>
          <div className="mt-1 text-sm font-medium text-steel-900">Highlighted region with elevated signal</div>
        </div>
      </div>
    </div>
  )
}
