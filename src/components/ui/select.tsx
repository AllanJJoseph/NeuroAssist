import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-11 w-full rounded-xl border border-steel-900 bg-white px-3.5 text-sm text-steel-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-steel-900/15 disabled:cursor-not-allowed disabled:bg-steel-50 disabled:text-steel-500',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
