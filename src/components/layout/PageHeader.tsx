import type { ReactNode } from 'react'
import { Badge } from '../ui/badge'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <Badge variant="secondary">{eyebrow}</Badge> : null}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-steel-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-steel-600 sm:text-base">{description}</p>
        </div>
      </div>

      {action ? <div>{action}</div> : null}
    </div>
  )
}
