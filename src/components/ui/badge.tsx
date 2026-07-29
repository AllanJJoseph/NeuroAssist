import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide', {
  variants: {
    variant: {
      default: 'bg-medical-50 text-medical-700 ring-1 ring-inset ring-medical-200',
      secondary: 'bg-steel-100 text-steel-700 ring-1 ring-inset ring-steel-200',
      success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
      warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
      danger: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
