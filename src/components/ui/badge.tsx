import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide', {
  variants: {
    variant: {
      default: 'bg-white text-steel-900 ring-1 ring-inset ring-steel-900',
      secondary: 'bg-white text-steel-900 ring-1 ring-inset ring-steel-900',
      success: 'bg-white text-steel-900 ring-1 ring-inset ring-steel-900',
      warning: 'bg-white text-steel-900 ring-1 ring-inset ring-steel-900',
      danger: 'bg-white text-steel-900 ring-1 ring-inset ring-steel-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn('bg-white text-steel-900 ring-1 ring-inset ring-steel-900', badgeVariants({ variant }), className)} {...props} />
}
