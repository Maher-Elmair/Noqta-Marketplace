/**
 * Buyer favorites/wishlist page
 */

import { useUserFavorites } from '@/hooks/use-user-favorites'
import { useProductsByIds } from '@/hooks/use-products'
import { ProductCard } from '@/components/common/product-card'
import { EmptyState } from '@/components/states/empty-state'
import { LoadingState } from '@/components/states/loading-state'
import { Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export function BuyerFavoritesPage() {
  const { favorites } = useUserFavorites()
  const t = useTranslation()
  const { data: productsResponse, isLoading } = useProductsByIds(favorites)

  // Get favorites from response
  const favoriteProducts = productsResponse?.data || []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    )
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<Heart className="h-12 w-12 text-muted-foreground" />}
          title={t('favorites.empty')}
          description={t('favorites.emptyDescription')}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t('favorites.title')}
      </h1>
      <p className="text-muted-foreground mb-6">
        {favoriteProducts.length} {t('favorites.count')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

