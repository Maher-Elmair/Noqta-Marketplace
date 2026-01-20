/**
 * Product recommendations component
 */

import { useFeaturedProducts } from '@/hooks/use-products'
import { ProductCard } from '@/components/common/product-card'
import { LoadingState } from '@/components/states/loading-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

interface RecommendationsProps {
  type?: 'similar' | 'frequently_bought_together' | 'trending' | 'personalized'
  title?: string
  limit?: number
}

export function Recommendations({
  type = 'trending',
  title,
  limit = 6,
}: RecommendationsProps) {
  const { data: featuredResponse, isLoading } = useFeaturedProducts(limit)
  const t = useTranslation()

  const products = featuredResponse?.data || []

  const getTitle = () => {
    if (title) return title
    switch (type) {
      case 'similar':
        return t('recommendations.similar')
      case 'frequently_bought_together':
        return t('recommendations.frequentlyBoughtTogether')
      case 'trending':
        return t('recommendations.trending')
      case 'personalized':
        return t('recommendations.personalized')
      default:
        return t('recommendations.title')
    }
  }

  if (isLoading) {
    return <LoadingState count={limit} />
  }

  if (products.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

