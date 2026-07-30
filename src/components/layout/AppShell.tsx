import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { WorkflowStepper } from './WorkflowStepper'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <WorkflowStepper />
      <main>{children}</main>
    </div>
  )
}
