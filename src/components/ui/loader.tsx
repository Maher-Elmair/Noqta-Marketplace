/**
 * Reusable Loader Component
 */

import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loader({ size = 'md', className }: LoaderProps) {
  const t = useTranslation()
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }

  return (
    <div
      className={cn(
        'inline-block rounded-full border-solid border-current border-r-transparent animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={t('common.loading')}
    >
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}
