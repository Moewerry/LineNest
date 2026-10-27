import { toast as sonnerToast } from 'sonner'

export const toast = Object.assign(
  (...args: Parameters<typeof sonnerToast>) => sonnerToast(...args),
  sonnerToast,
  {
    success: (...[message, options]: Parameters<typeof sonnerToast.success>) =>
      sonnerToast.success(message, { ...options, duration: 2000 }),
    error: (...[message, options]: Parameters<typeof sonnerToast.error>) =>
      sonnerToast.error(message, { ...options, duration: 3000 }),
  },
)
