import type { ReactNode } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'

type FeatureCardProps = {
  title: string
  description: string
  icon?: ReactNode
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900">{icon}</div> : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
