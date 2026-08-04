import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { TransferStatusTimeline } from '../components/TransferStatusTimeline'
import { getTransfers, type TransferRecord } from '../lib/registry'
import { ROUTES } from '../utils/routes'

function statusBadge(status: TransferRecord['status']) {
  const map: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    Received: 'bg-blue-100 text-blue-800 border border-blue-300',
    Viewed: 'bg-purple-100 text-purple-800 border border-purple-300',
    Accepted: 'bg-green-100 text-green-800 border border-green-300',
  }
  return map[status] ?? 'bg-steel-100 text-steel-700'
}

function priorityBadge(priority: TransferRecord['priority']) {
  const map: Record<string, string> = {
    Emergency: 'bg-red-100 text-red-800',
    Urgent: 'bg-orange-100 text-orange-800',
    Routine: 'bg-steel-100 text-steel-700',
  }
  return map[priority] ?? 'bg-steel-100 text-steel-700'
}

export function TransferStatusPage() {
  const navigate = useNavigate()
  const [transfers, setTransfers] = useState<TransferRecord[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = () => {
    setTransfers([...getTransfers()].sort(
      (a, b) => new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime(),
    ))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Aster Hospital · Outgoing Transfers</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-steel-900 sm:text-4xl">
              Transfer Status
            </h1>
            <p className="mt-2 text-sm leading-6 text-steel-600">
              Track all patient transfers sent to Apollo Hospital. Status updates automatically every 3 seconds.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => navigate(ROUTES.patient)}>
            <Send className="h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          ['Total Sent', transfers.length, 'text-steel-900'],
          ['Pending', transfers.filter((t) => t.status === 'Pending').length, 'text-amber-600'],
          ['Viewed by Apollo', transfers.filter((t) => t.status === 'Viewed' || t.status === 'Accepted').length, 'text-purple-600'],
          ['Accepted', transfers.filter((t) => t.status === 'Accepted').length, 'text-green-600'],
        ].map(([label, value, color]) => (
          <Card key={label as string}>
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{label as string}</div>
              <div className={`mt-2 text-3xl font-bold ${color}`}>{value as number}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transfer list */}
      <div className="mt-6 space-y-4">
        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-steel-300 py-16 text-center">
            <Send className="mb-4 h-12 w-12 text-steel-300" />
            <div className="text-lg font-semibold text-steel-500">No transfers yet</div>
            <p className="mt-2 text-sm text-steel-400">
              Complete a stroke analysis and transfer a patient from the Report page.
            </p>
          </div>
        ) : (
          transfers.map((t) => {
            const isExpanded = expandedId === t.id

            return (
              <Card key={t.id} className={t.status === 'Accepted' ? 'border-green-300' : ''}>
                <CardContent className="p-0">
                  {/* Summary row */}
                  <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-steel-200 bg-steel-50 text-sm font-bold text-steel-700">
                        {t.patientSnapshot.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-steel-900">{t.patientSnapshot.name}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(t.status)}`}>
                            {t.status === 'Accepted'
                              ? `✓ Accepted by ${t.receivingHospital}`
                              : t.status === 'Viewed'
                              ? '👁 Viewed by Apollo'
                              : t.status === 'Received'
                              ? '📬 Received by Apollo'
                              : '⏳ Pending'}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadge(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>
                        <div className="mt-0.5 text-sm text-steel-500">
                          → {t.receivingHospital} · {t.receivingDoctor}
                        </div>
                        <div className="mt-0.5 text-xs text-steel-400">
                          Sent {new Date(t.transferredAt).toLocaleString()}
                          {t.acceptedAt ? ` · Accepted ${new Date(t.acceptedAt).toLocaleString()}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                      className="flex items-center gap-2 rounded-xl border border-steel-200 bg-white px-4 py-2 text-sm font-medium text-steel-700 transition hover:border-steel-900 hover:text-steel-900 shrink-0"
                    >
                      Timeline
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Expanded timeline */}
                  {isExpanded && (
                    <div className="border-t border-steel-100 px-5 py-5">
                      <TransferStatusTimeline transfer={t} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
