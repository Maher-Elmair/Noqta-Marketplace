/**
 * Categories page
 */

import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCategories } from '@/hooks/use-categories'
import { useProducts } from '@/hooks/use-products'
import { ProductCard } from '@/components/common/product-card'
import { LoadingState } from '@/components/states/loading-state'
import { EmptyState } from '@/components/states/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/pagination'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/constants'
import type { Category } from '@/types'

export function CategoriesPage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { slug } = useParams()
  const navigate = useNavigate()
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 // Showing 8 items per page for grid layout

  // Reset page without using useEffect (controlled by keying Pagination/UI)
  // The state of currentPage and component are reset automatically when slug changes
  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Resolve slug to ID
  const selectedCategoryId = slug && slug !== 'all' 
    ? categories?.find(c => c.slug === slug)?.id || null
    : null;

  const t = useTranslation()
  const { i18n } = useI18nTranslation()
  const language = i18n.language as 'ar' | 'en'
  
  // Fetch products with pagination
  const { data: productsData, isLoading: productsLoading } = useProducts(
      currentPage, 
      itemsPerPage, 
      selectedCategoryId ? { category: selectedCategoryId } : undefined
  )

  const products = productsData?.data || []
  const pagination = productsData?.pagination
  
  const selectedCategoryName = selectedCategoryId 
    ? (categories?.find(c => c.id === selectedCategoryId)?.name[language] || categories?.find(c => c.id === selectedCategoryId)?.name.en)
    : null

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t('nav.categories')}
      </h1>

      {/* Categories Grid */}
      {categories && categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Button
            variant={selectedCategoryId === null ? 'default' : 'outline'}
            onClick={() => navigate(`${ROUTES.CATEGORY}/all`)}
            className="h-auto py-4"
          >
            {t('orders.all')}
          </Button>
          {categories.map((category: Category) => {
            const categoryName = category.name[language] || category.name.en
            const isSelected = selectedCategoryId === category.id
            return (
              <Button
                key={category.id}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => navigate(`${ROUTES.CATEGORY}/${category.slug}`)}
                className="h-auto py-4"
              >
                {categoryName}
              </Button>
            )
          })}
        </div>
      )}

      {/* Products by Category */}
      {selectedCategoryId && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategoryName}
          </h2>
          {productsLoading && <LoadingState />}
          {!productsLoading && products.length === 0 && (
            <EmptyState
              title={t('products.noResults')}
              description={t('products.noResultsDescription')}
            />
          )}
          {!productsLoading && products.length > 0 && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
                
                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </>
          )}
        </div>
      )}

      {/* All Categories View */}
      {!selectedCategoryId && categories && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: Category) => (
            <Link key={category.id} to={`${ROUTES.CATEGORY}/${category.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name[language] || category.name.en}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold mb-2">
                    {category.name[language] || category.name.en}
                  </h3>
                  {category.description && (
                    <p className="text-muted-foreground text-sm">
                      {category.description[language] || category.description.en}
                    </p>
                  )}
                  {category.productCount !== undefined && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {category.productCount} {t('nav.products')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

