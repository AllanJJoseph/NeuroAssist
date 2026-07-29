import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value: number
}

export function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-steel-100', className)} {...props}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-medical-500 to-medical-600 transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
