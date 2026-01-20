/**
 * Loading state component with skeleton
 */

import { Card, CardContent } from '@/components/ui/card'

interface LoadingStateProps {
  count?: number
}

export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-muted rounded-t-lg" />
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

