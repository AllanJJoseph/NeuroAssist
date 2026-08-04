import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, Eye, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { PageHeader } from '../components/layout/PageHeader'
import { StrokeClock } from '../components/StrokeClock'
import { getTransfers, updateTransfer, type TransferRecord } from '../lib/registry'
import {
  DEMO_HOSPITAL_KEY,
  DEFAULT_RECEIVING_HOSPITAL,
  SENDING_HOSPITAL,
} from '../lib/hospitalConfig'
import { ROUTES } from '../utils/routes'

const RISK_ORDER: Record<string, number> = { Critical: 0, High: 1, Moderate: 2, Low: 3 }

function sortTransfers(transfers: TransferRecord[]): TransferRecord[] {
  return [...transfers].sort((a, b) => {
    const riskA = RISK_ORDER[a.analysisSnapshot.riskLevel] ?? 99
    const riskB = RISK_ORDER[b.analysisSnapshot.riskLevel] ?? 99
    if (riskA !== riskB) return riskA - riskB
    const onsetA = a.strokeOnsetTime ? new Date(a.strokeOnsetTime).getTime() : Infinity
    const onsetB = b.strokeOnsetTime ? new Date(b.strokeOnsetTime).getTime() : Infinity
    if (onsetA !== onsetB) return onsetA - onsetB
    return new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime()
  })
}

function statusBadge(status: TransferRecord['status']) {
  const map: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    Received: 'bg-blue-100 text-blue-800 border border-blue-300',
    Viewed: 'bg-purple-100 text-purple-800 border border-purple-300',
    Accepted: 'bg-green-100 text-green-800 border border-green-300',
  }
  return map[status] ?? 'bg-steel-100 text-steel-700 border border-steel-200'
}

function priorityBadge(priority: TransferRecord['priority']) {
  const map: Record<string, string> = {
    Emergency: 'bg-red-100 text-red-800 border border-red-300',
    Urgent: 'bg-orange-100 text-orange-800 border border-orange-300',
    Routine: 'bg-steel-100 text-steel-700 border border-steel-200',
  }
  return map[priority] ?? 'bg-steel-100 text-steel-700'
}

function riskBadge(level: string) {
  const map: Record<string, string> = {
    Critical: 'bg-red-600 text-white',
    High: 'bg-orange-500 text-white',
    Moderate: 'bg-yellow-500 text-white',
    Low: 'bg-green-500 text-white',
  }
  return map[level] ?? 'bg-steel-500 text-white'
}

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(isoString).toLocaleDateString()
}

export function ApolloDashboardPage() {
  const navigate = useNavigate()
  const [transfers, setTransfers] = useState<TransferRecord[]>([])
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  // Auth guard
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_HOSPITAL_KEY) !== 'Apollo') {
      navigate(ROUTES.apolloLogin, { replace: true })
    }
  }, [navigate])

  // Load and mark Pending → Received
  useEffect(() => {
    const all = getTransfers().filter((t) => t.receivingHospital === DEFAULT_RECEIVING_HOSPITAL)
    const now = new Date().toISOString()
    all.forEach((t) => {
      if (t.status === 'Pending') {
        updateTransfer(t.id, { status: 'Received', receivedAt: now })
      }
    })
    setTransfers(sortTransfers(getTransfers().filter((t) => t.receivingHospital === DEFAULT_RECEIVING_HOSPITAL)))
  }, [lastRefresh])

  // Poll every 5s
  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(Date.now()), 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem(DEMO_HOSPITAL_KEY)
    navigate(ROUTES.apolloLogin, { replace: true })
  }

  const handleView = (t: TransferRecord) => {
    // Dismiss notification for this transfer
    setDismissedNotifications((prev) => new Set([...prev, t.id]))
    navigate(ROUTES.apolloPatient.replace(':id', t.id))
  }

  // Unread = Received and not dismissed
  const unreadTransfers = transfers.filter(
    (t) => t.status === 'Received' && !dismissedNotifications.has(t.id),
  )

  const stats = [
    { label: 'Total Referrals', value: transfers.length, color: 'text-steel-900' },
    { label: 'Pending Review', value: transfers.filter((t) => t.status === 'Received').length, color: 'text-amber-600' },
    { label: 'Viewed', value: transfers.filter((t) => t.status === 'Viewed').length, color: 'text-purple-600' },
    { label: 'Accepted', value: transfers.filter((t) => t.status === 'Accepted').length, color: 'text-green-600' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header — matches NeuroAssist PageHeader style */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          eyebrow={`${DEFAULT_RECEIVING_HOSPITAL} · Clinical Portal`}
          title="Incoming Emergency Referrals"
          description={`Real-time view of patient transfers from ${SENDING_HOSPITAL}. Auto-refreshes every 5 seconds.`}
        />
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Rich Notification Banner — Issue 7 */}
      {unreadTransfers.length > 0 && (
        <div className="mt-6 space-y-3">
          {unreadTransfers.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-900">New Emergency Referral</div>
                  <div className="text-base font-semibold text-steel-900">{t.patientSnapshot.name}</div>
                  <div className="mt-0.5 text-xs text-steel-600">
                    Transferred from <strong>{SENDING_HOSPITAL}</strong> ·{' '}
                    <span className={`font-semibold ${t.priority === 'Emergency' ? 'text-red-700' : 'text-orange-700'}`}>
                      {t.priority}
                    </span>{' '}
                    · {timeAgo(t.transferredAt)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleView(t)}
                className="shrink-0"
              >
                <Eye className="h-4 w-4" />
                View Referral
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{label}</div>
              <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referrals Table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          {transfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="mb-4 h-12 w-12 text-steel-300" />
              <div className="text-lg font-semibold text-steel-500">No transfers yet</div>
              <p className="mt-2 text-sm text-steel-400">
                Transfers sent from {SENDING_HOSPITAL} will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50">
                    {['Patient', 'Sending Hospital', 'Receiving Doctor', 'Stroke Clock', 'Priority', 'Risk', 'Status', 'Transferred At', ''].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-steel-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100">
                  {transfers.map((t) => (
                    <tr key={t.id} className="group hover:bg-steel-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-steel-900">{t.patientSnapshot.name}</div>
                        <div className="text-xs text-steel-500">{t.patientSnapshot.age}y · {t.patientSnapshot.gender}</div>
                      </td>
                      <td className="px-4 py-4 text-steel-700">{SENDING_HOSPITAL}</td>
                      <td className="px-4 py-4 text-steel-700">{t.receivingDoctor}</td>
                      <td className="px-4 py-4">
                        {t.strokeOnsetTime ? (
                          <StrokeClock onsetTime={t.strokeOnsetTime} variant="compact" />
                        ) : (
                          <span className="text-xs text-steel-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskBadge(t.analysisSnapshot.riskLevel)}`}>
                          {t.analysisSnapshot.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-steel-500">
                        {new Date(t.transferredAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(t)}
                        >
                          <Eye className="h-3 w-3" />
                          View
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
