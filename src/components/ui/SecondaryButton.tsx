import type { ButtonProps } from './button'
import { Button } from './button'

export function SecondaryButton({ variant = 'outline', ...props }: ButtonProps) {
  return <Button variant={variant} {...props} />
}
