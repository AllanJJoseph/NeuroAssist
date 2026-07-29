import type { NavigationLink } from '../types/navigation'

export const ROUTES = {
  home: '/',
  patient: '/patient',
  scan: '/scan',
  processing: '/processing',
  results: '/results',
  report: '/report',
  about: '/about',
  contact: '/contact',
} as const

export const NAVIGATION_LINKS: NavigationLink[] = [
  { label: 'Home', path: ROUTES.home },
  { label: 'About', path: ROUTES.about },
  { label: 'Contact', path: ROUTES.contact },
]
