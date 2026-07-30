import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { workflowSteps } from '../../lib/workflow'
import { ROUTES } from '../../utils/routes'

export function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()
  
  if (location.pathname === ROUTES.home) return null

  const currentIndex = workflowSteps.findIndex(s => s.path === location.pathname)
  const prevStep = currentIndex > 0 ? workflowSteps[currentIndex - 1] : null

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => prevStep && navigate(prevStep.path)}>
      ← Back
    </Button>
  )
}