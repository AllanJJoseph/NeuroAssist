import { CheckCircle, Circle, Clock } from 'lucide-react'
import type { TransferRecord } from '../lib/registry'

type Step = {
  key: keyof typeof STEP_LABELS
  label: string
  timestamp: string | undefined
}

const STEP_LABELS = {
  analysis: 'AI Analysis Complete',
  report: 'Report Generated',
  transferred: 'Transfer Sent',
  received: 'Apollo Received',
  viewed: 'Doctor Viewed',
  accepted: 'Transfer Accepted',
}

function getSteps(transfer: TransferRecord): Step[] {
  return [
    { key: 'analysis', label: STEP_LABELS.analysis, timestamp: transfer.reportGeneratedAt },
    { key: 'report', label: STEP_LABELS.report, timestamp: transfer.reportGeneratedAt },
    { key: 'transferred', label: STEP_LABELS.transferred, timestamp: transfer.transferredAt },
    { key: 'received', label: STEP_LABELS.received, timestamp: transfer.receivedAt },
    { key: 'viewed', label: STEP_LABELS.viewed, timestamp: transfer.viewedAt },
    { key: 'accepted', label: STEP_LABELS.accepted, timestamp: transfer.acceptedAt },
  ]
}

function isStepComplete(step: Step): boolean {
  return !!step.timestamp
}

type TransferStatusTimelineProps = {
  transfer: TransferRecord | null | undefined
}

export function TransferStatusTimeline({ transfer }: TransferStatusTimelineProps) {
  if (!transfer) return null

  const steps = getSteps(transfer)

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const done = isStepComplete(step)
        const isLast = index === steps.length - 1

        return (
          <div key={step.key} className="flex gap-4">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                  done
                    ? 'border-steel-900 bg-steel-900 text-white'
                    : 'border-steel-300 bg-white text-steel-400',
                ].join(' ')}
              >
                {done ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              {!isLast && (
                <div className={['w-0.5 flex-1 my-1', done ? 'bg-steel-900' : 'bg-steel-200'].join(' ')} />
              )}
            </div>

            {/* Content */}
            <div className={['pb-4', isLast ? '' : ''].join(' ')}>
              <div className={['text-sm font-semibold', done ? 'text-steel-900' : 'text-steel-400'].join(' ')}>
                {step.label}
              </div>
              {step.timestamp ? (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-steel-500">
                  <Clock className="h-3 w-3" />
                  {new Date(step.timestamp).toLocaleString()}
                </div>
              ) : (
                <div className="mt-0.5 text-xs text-steel-400">Pending</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
