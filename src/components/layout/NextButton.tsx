import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { workflowSteps } from '../../lib/workflow'
import { ROUTES } from '../../utils/routes'

export function NextButton() {
  const navigate = useNavigate()
  const location = useLocation()
  
  if (location.pathname === ROUTES.report) return null

  const currentIndex = workflowSteps.findIndex(s => s.path === location.pathname)
  const nextStep = currentIndex >= 0 && currentIndex < workflowSteps.length - 1 ? workflowSteps[currentIndex + 1] : null

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => nextStep && navigate(nextStep.path)}>
      Next →
    </Button>
  )
}
