import type { CSSProperties } from 'react'
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert } from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { cn } from '@/lib/utils'

export function Toaster({ className, style, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-right"
      offset={{ top: 72, right: 24 }}
      mobileOffset={{ top: 24, right: 16, left: 16 }}
      duration={3000}
      closeButton={false}
      richColors
      className={cn('toaster max-[600px]:!w-[calc(100%-var(--mobile-offset-left)-var(--mobile-offset-right))]', className)}
      icons={{
        success: <CircleCheck className="size-5 text-[var(--notification-success-icon)]" aria-hidden="true" />,
        error: <CircleX className="size-5 text-[var(--notification-error-icon)]" aria-hidden="true" />,
        info: <Info className="size-5" aria-hidden="true" />,
        warning: <TriangleAlert className="size-5 text-[var(--notification-warning-icon)]" aria-hidden="true" />,
        loading: <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />,
      }}
      style={{
        '--normal-bg': 'var(--notification-background)',
        '--normal-border': 'var(--notification-border)',
        '--normal-text': 'var(--notification-foreground)',
        '--success-bg': 'var(--notification-success-background)',
        '--success-border': 'var(--notification-success-border)',
        '--success-text': 'var(--notification-success-foreground)',
        '--error-bg': 'var(--notification-error-background)',
        '--error-border': 'var(--notification-error-border)',
        '--error-text': 'var(--notification-error-foreground)',
        '--info-bg': 'var(--notification-background)',
        '--info-border': 'var(--notification-border)',
        '--info-text': 'var(--notification-foreground)',
        '--warning-bg': 'var(--notification-warning-background)',
        '--warning-border': 'var(--notification-warning-border)',
        '--warning-text': 'var(--notification-warning-foreground)',
        '--border-radius': 'var(--radius-lg)',
        fontFamily: 'var(--font-sans)',
        ...style,
      } as CSSProperties}
      toastOptions={{
        classNames: {
          toast: '!left-auto !w-max !max-w-full !gap-3 !border-0 !shadow-[0_8px_28px_rgb(48_41_30_/_0.10)]',
          title: 'text-sm leading-relaxed font-medium',
          description: 'text-xs leading-relaxed',
        },
      }}
      containerAriaLabel="操作提示"
      {...props}
    />
  )
}
