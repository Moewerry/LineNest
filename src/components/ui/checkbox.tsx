import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Checkbox({ className, checked, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root
    data-slot="checkbox"
    checked={checked}
    className={cn('size-4 shrink-0 rounded border border-input bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground', className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      {checked === 'indeterminate' ? <Minus className="size-3" /> : <Check className="size-3" />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
}
