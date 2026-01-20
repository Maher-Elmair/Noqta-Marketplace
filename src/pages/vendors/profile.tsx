import { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { mockProducts, mockCategories } from '@/services/mock-data';
import { ProductCard } from '@/components/common/product-card';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Store, Calendar, Star, Package, Filter, CheckCircle2 } from 'lucide-react';
import type { Category } from '@/types';
import { useVendorBySlug } from '@/hooks/use-vendors';

const ITEMS_PER_PAGE = 15;

export function VendorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslation();
  const { i18n } = useI18nTranslation();
  const language = i18n.language as 'ar' | 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Find Seller using hook to get updated data from localStorage
  const { data: sellerResponse, isLoading } = useVendorBySlug(slug || '');
  const seller = sellerResponse?.data;

  // Find Seller's Products
  const sellersProducts = useMemo(() => {
    if (!seller) return [];
    return mockProducts.filter(p => p.sellerId === seller.id && p.isActive);
  }, [seller]);

  // Derive Categories from Products
  const availableCategories: Category[] = useMemo(() => {
    const categoryIds = Array.from(new Set(sellersProducts.map(p => p.categoryId)));
    return mockCategories.filter(c => categoryIds.includes(c.id));
  }, [sellersProducts]);

  // Filter Products based on selection
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return sellersProducts;
    return sellersProducts.filter(p => p.categoryId === selectedCategory);
  }, [sellersProducts, selectedCategory]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' }); // Scroll to products grid
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset page on vendor or category change
    setTimeout(() => {
      setCurrentPage(1);
    }, 0);
  }, [slug, selectedCategory]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!seller) {
    return <Navigate to="/404" replace />;
  }

  const storeName = seller.storeName[language as 'ar' | 'en'] || seller.storeName.en;
  // Use bio if available, fallback to description
  const bio = seller.bio?.[language as 'ar' | 'en'] || seller.description?.[language as 'ar' | 'en'] || seller.description?.en;
  const banner = seller.coverImage;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
        {banner ? (
          <img
            src={banner}
            alt="Store Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header Info Section */}
      <div className="container mx-auto px-4 relative -mt-20 mb-8">
        <div className="bg-card border rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background shadow-md overflow-hidden bg-background flex-shrink-0">
              {seller.logo ? (
                <img
                  src={seller.logo}
                  alt={storeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <Store className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2 text-center md:text-start rtl:md:text-right">
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                      {storeName}
                      {seller.isVerified && (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                      )}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mt-1">
                      {bio}
                    </p>
                  </div>
                  
                  {/* Stats Pills */}
                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full border text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-bold">{seller.rating}</span>
                      <span className="text-muted-foreground">({seller.reviewCount} {t('common.reviews')})</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full border text-sm">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="font-bold">{seller.productCount}</span>
                      <span className="text-muted-foreground">{t('common.products')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full border text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {t('vendors.joined')}: {new Date(seller.createdAt).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-card border rounded-lg p-4 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t('products.categories')}
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? "default" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => setSelectedCategory('all')}
                >
                  {t('vendors.allProducts')}
                  <span className="ml-auto opacity-50 text-xs">{sellersProducts.length}</span>
                </Button>
                
                {availableCategories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start font-normal"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name[language as 'ar' | 'en']}
                    <span className="ml-auto opacity-50 text-xs">
                      {sellersProducts.filter(p => p.categoryId === category.id).length}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {selectedCategory === 'all' 
                    ? t('vendors.allProducts')
                    : availableCategories.find(c => c.id === selectedCategory)?.name[language as 'ar' | 'en']
                  }
                </h2>
                <span className="text-muted-foreground text-sm">
                  {filteredProducts.length} {t('common.products')}
                </span>
             </div>

             {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
             ) : (
               <div className="text-center py-20 bg-muted/20 rounded-lg">
                 <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                 <p className="text-muted-foreground">
                   {t('vendors.noProductsInCategory')}
                 </p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
