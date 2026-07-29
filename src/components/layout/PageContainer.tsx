import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10', className)} {...props}>
      {children}
    </div>
  )
}
