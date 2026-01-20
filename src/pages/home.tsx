import { useFeaturedProducts, useNewArrivals } from '@/hooks/use-products'
import { useBestSellingVendors } from '@/hooks/use-vendors'
import { ProductCard } from '@/components/common/product-card'
import { VendorCard } from '@/components/vendors/vendor-card'
import { LoadingState } from '@/components/states/loading-state'
import { EmptyState } from '@/components/states/empty-state'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useTranslation } from '@/hooks/use-translation'

export function HomePage() {
  const { data: featuredResponse, isLoading: isFeaturedLoading, error: featuredError } = useFeaturedProducts(6)
  const { data: newArrivalsResponse, isLoading: isNewLoading } = useNewArrivals(6)
  const { data: bestSellersResponse, isLoading: isBestSellersLoading } = useBestSellingVendors(4)
  
  const t = useTranslation()

  const featuredProducts = featuredResponse?.data || []
  const newArrivals = newArrivalsResponse?.data || []
  const bestSellingVendors = bestSellersResponse?.data || []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {t('home.title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.BUYER.SEARCH}>
            <Button size="lg">
              {t('home.exploreProducts')}
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">
              {t('home.becomeSeller')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-6 py-2 leading-relaxed tracking-tight">
            {t('home.featuredProducts')}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        {isFeaturedLoading && <LoadingState count={6} />}
        {featuredError && (
          <EmptyState
            title={t('errors.genericError')}
            description={t('errors.genericErrorDescription')}
          />
        )}
        {!isFeaturedLoading && !featuredError && featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-6 py-2 leading-relaxed tracking-tight">
            {t('home.newArrivals')}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        {isNewLoading ? <LoadingState count={6} /> : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             {newArrivals.map((product) => (
               <ProductCard key={product.id} product={product} />
             ))}
           </div>
        )}
      </section>

      {/* Best Selling Vendors Section */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-6 py-2 leading-relaxed tracking-tight">
            {t('home.bestSellingVendors')}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
         {isBestSellersLoading ? <LoadingState count={4} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {bestSellingVendors.map((seller) => (
                <VendorCard key={seller.id} seller={seller} />
              ))}
            </div>
         )}
      </section>

      {/* Story Section */}
      <section className="bg-muted/50 rounded-lg p-8 mb-12">
        <h2 className="text-3xl font-bold mb-4">
          {t('home.ourStory')}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t('home.storyText')}
        </p>
      </section>
    </div>
  )
}
