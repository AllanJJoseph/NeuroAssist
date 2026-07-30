import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value: number
}

export function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full border border-steel-900 bg-white', className)} {...props}>
      <div className="h-full rounded-full bg-steel-900 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
