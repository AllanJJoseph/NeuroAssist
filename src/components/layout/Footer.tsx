import { Link } from 'react-router-dom'
import { NAVIGATION_LINKS } from '../../utils/routes'

export function Footer() {
  return (
    <footer className="border-t border-steel-200/70 bg-white/75">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-steel-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>NeuroAssist demo frontend for stroke decision support.</p>
        <div className="flex flex-wrap gap-4">
          {NAVIGATION_LINKS.map((link) => (
            <Link key={link.path} to={link.path} className="font-medium text-steel-600 transition hover:text-medical-700">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
