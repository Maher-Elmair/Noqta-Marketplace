/**
 * Enhanced Product Card Component
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cart-store'
import { useUserFavorites } from '@/hooks/use-user-favorites'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/components/ui/use-toast'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { isFavorite, toggleFavorite } = useUserFavorites()
  const { isAuthenticated } = useAuthStore()
  const { i18n } = useI18nTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const t = useTranslation()
  const favorite = isFavorite(product.id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const images = product.images.length > 0 ? product.images : ['/placeholder-product.jpg']
  const language = i18n.language as 'ar' | 'en'

  // Auto-slide images on hover
  useEffect(() => {
    if (!isHovered || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 2000) // Change image every 2 seconds

    return () => clearInterval(interval)
  }, [isHovered, images.length])



  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
        toast({
            title: t('cart.loginRequired'),
            description: t('cart.loginRequiredDescription'),
            variant: 'destructive'
        })
        navigate('/login')
        return
    }

    if (product.sellerId) {
      addItem(product, product.sellerId, 1)
      toast({
          title: t('cart.addedToCart'),
          description: t('cart.addedToCartDescription'),
      })
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
        toast({
            title: t('cart.loginRequiredFavorites'),
            description: t('cart.loginRequiredFavoritesDescription'),
            variant: 'destructive'
        })
        navigate('/login')
        return
    }

    toggleFavorite(product.id)
  }

  const displayName = language === 'ar' ? product.name.ar : product.name.en
  const displayPrice = `$${product.price.toFixed(2)}`
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const productUrl = product.category?.slug
    ? `${ROUTES.PRODUCT}/${product.category.slug}/${product.slug}/${product.id}`
    : `${ROUTES.PRODUCT}/${product.slug}/${product.id}`

  return (
    <Link to={productUrl}>
      <Card
        className={cn(
          'group overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setCurrentImageIndex(0)
        }}
      >
        <div className="relative overflow-hidden">
          <div className="aspect-square w-full bg-muted relative">
            <img
              src={images[currentImageIndex]}
              alt={displayName}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            {/* Image indicator dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentImageIndex
                        ? 'w-4 bg-primary'
                        : 'w-1.5 bg-muted-foreground/50'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm hover:bg-background shadow-md"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-all',
                favorite
                  ? 'fill-red-500 text-red-500 scale-110'
                  : 'text-muted-foreground hover:text-red-500'
              )}
            />
          </Button>

          {/* Discount Badge */}
          {product.compareAtPrice && discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-destructive font-semibold text-lg">
                {t('products.outOfStock')}
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Seller Name */}
          {product.seller && (
            <p className="text-xs text-muted-foreground font-medium">
              {language === 'ar'
                ? product.seller.storeName.ar
                : product.seller.storeName.en}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {displayName}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="flex flex-col gap-2 pt-2 border-t">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                {displayPrice}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('products.addToCart')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
