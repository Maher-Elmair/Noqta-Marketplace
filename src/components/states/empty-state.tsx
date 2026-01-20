/**
 * Empty state component
 */

import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        {icon || <Package className="h-12 w-12 text-muted-foreground mb-4" />}
        {title && (
          <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick}>{action.label}</Button>
        )}
      </CardContent>
    </Card>
  )
}

