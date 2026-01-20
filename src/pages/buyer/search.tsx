/**
 * Buyer search page with smart search and filters
 */

import { useState, useEffect } from 'react'
import { useSearchProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { ProductCard } from '@/components/common/product-card'
import { LoadingState } from '@/components/states/loading-state'
import { EmptyState } from '@/components/states/empty-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FiltersSidebar } from '@/components/common/filters-sidebar'
import { Pagination } from '@/components/common/pagination'
import { Search, X, Filter as FilterIcon } from 'lucide-react'
import type { Product } from '@/types'
import { useTranslation } from '@/hooks/use-translation'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"

export function BuyerSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // New Filter States
  const [priceRange, setPriceRange] = useState<{ min: number | undefined; max: number | undefined }>({ min: undefined, max: undefined })
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'newest'>('newest')

  const t = useTranslation()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setActiveQuery(searchQuery.trim())
      } else {
        setActiveQuery('')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Enhanced Hook Call with Filters
  const { data: searchResult, isLoading } = useSearchProducts(
    activeQuery, 
    currentPage, 
    12, 
    {
        category: selectedCategoryId || undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        rating: minRating,
        sortBy
    }
  )

  const { data: categories } = useCategories()
  const products = searchResult?.products || []
  const totalProducts = categories?.reduce((acc, cat) => acc + (cat.productCount || 0), 0) || 0

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setActiveQuery(searchQuery.trim())
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveQuery('')
    setSelectedCategoryId(null)
    setPriceRange({ min: undefined, max: undefined })
    setMinRating(undefined)
    setSortBy('newest')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when filters change, but only if not already on page 1
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery, selectedCategoryId, priceRange.min, priceRange.max, minRating, sortBy])

  const suggestions = searchResult?.suggestions || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">


          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">
                {t('products.search')}
            </h1>
            
            {/* Mobile Filter Button */}
            <div className="lg:hidden w-full md:w-auto">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto flex gap-2">
                            <FilterIcon className="h-4 w-4" />
                            {t('filters.title')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto p-0">
                         {/* Visually hidden title for accessibility needed by Radix/ShadCN Dialog */}
                         <DialogTitle className="sr-only">{t('filters.title')}</DialogTitle>
                         <FiltersSidebar
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            setSelectedCategoryId={setSelectedCategoryId}
                            totalProducts={totalProducts}
                            searchResult={searchResult}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            minRating={minRating}
                            setMinRating={setMinRating}
                            className="border-none shadow-none sticky-0 relative top-0 max-h-none"
                          />
                    </DialogContent>
                </Dialog>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full">
            {/* ... keeping existing search bar ... */}
             <div className="flex gap-2">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                />
                {searchQuery && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={clearSearch}
                >
                    <X className="h-4 w-4" />
                </Button>
                )}
            </div>
            <Button type="submit">
                {t('common.search')}
            </Button>
            </div>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar */}
            <FiltersSidebar
                sortBy={sortBy}
                setSortBy={setSortBy}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
                totalProducts={totalProducts}
                searchResult={searchResult}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                className="hidden lg:block"
            />

            {/* Main Content */}
            <div className="lg:col-span-3">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground self-center">
                        {t('products.suggestions')}:
                    </span>
                        {suggestions.map((suggestion: string) => (
                        <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                            setSearchQuery(suggestion as string)
                            setActiveQuery(suggestion as string)
                            }}
                        >
                            {suggestion}
                        </Button>
                        ))}
                    </div>
                )}

                {/* Results */}
                {isLoading && <LoadingState />}
                
                {!isLoading && products.length === 0 && (
                    <EmptyState
                    title={t('products.noResults')}
                    description={t('products.noResultsDescription')}
                    />
                )}

                {!isLoading && !activeQuery && products.length === 0 && ( /* Only show start searching if really nothing is shown and query is empty, but with filters we might show all products initially or similar logic? Default search page behavior usually waits for query. keeping logic similar */
                    <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                        {t('products.startSearching')}
                        </p>
                    </CardContent>
                    </Card>
                )}

                {!isLoading && products.length > 0 && (
                    <>
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            {t('products.results')}: {searchResult?.total || 0}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    
                    {/* Pagination */}
                    {searchResult && searchResult.total > 12 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(searchResult.total / 12)}
                            onPageChange={handlePageChange}
                        />
                    )}
                    </>
                )}
            </div>
          </div>
      </div>
    </div>
  )
}

