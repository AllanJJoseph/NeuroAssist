import type { ButtonProps } from './button'
import { Button } from './button'

export function PrimaryButton({ variant = 'default', ...props }: ButtonProps) {
  return <Button variant={variant} {...props} />
}
