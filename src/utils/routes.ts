import type { NavigationLink } from '../types/navigation'

export const ROUTES = {
  login: '/',
  home: '/home',
  register: '/register',
  patient: '/patient',
  scan: '/scan',
  processing: '/processing',
  results: '/results',
  report: '/report',
  about: '/about',
  contact: '/contact',
  // New routes
  registry: '/registry',
  transfers: '/transfers',
  apolloLogin: '/apollo',
  apolloDashboard: '/apollo/dashboard',
  apolloPatient: '/apollo/patient/:id',
} as const

export const NAVIGATION_LINKS: NavigationLink[] = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Registry', path: ROUTES.registry },
  { label: 'Transfers', path: ROUTES.transfers },
  { label: 'About', path: ROUTES.about },
  { label: 'Contact', path: ROUTES.contact },
]

export const WORKFLOW_ROUTES = [ROUTES.patient, ROUTES.scan, ROUTES.processing, ROUTES.results, ROUTES.report]
