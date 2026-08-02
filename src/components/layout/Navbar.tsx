import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { NAVIGATION_LINKS } from '../../utils/routes'
import { PillNav } from './PillNav'

export function Navbar() {
  return (
    <header className="border-b border-steel-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900 shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-steel-900">NeuroAssist</div>
            <div className="text-xs text-steel-500">AI stroke decision support demo</div>
          </div>
        </Link>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <PillNav
            className="w-full sm:w-auto"
            items={NAVIGATION_LINKS.map((link) => ({
              label: link.label,
              href: link.path,
            }))}
          />
        </div>
      </div>
    </header>
  )
}
