type ContributionBarsProps = {
  items: Array<{
    label: string
    value: number
  }>
}

export function ContributionBars({ items }: ContributionBarsProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-steel-700">{item.label}</span>
            <span className="text-steel-500">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-steel-900 bg-white">
            <div className="h-full rounded-full bg-steel-900" style={{ width: `${(item.value / maxValue) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
