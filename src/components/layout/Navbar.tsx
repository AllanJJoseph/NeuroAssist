import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, LogOut } from 'lucide-react'
import { NAVIGATION_LINKS, ROUTES } from '../../utils/routes'
import { PillNav } from './PillNav'
import { useAuth } from '../../context/use-auth'

export function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="border-b border-steel-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link to={ROUTES.home} className="flex items-center gap-3">
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
          <button
            id="logout-button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-black bg-white px-3.5 py-2 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
