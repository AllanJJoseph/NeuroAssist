import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen text-steel-900">
      <Navbar />

      <main>{children}</main>
    </div>
  )
}
