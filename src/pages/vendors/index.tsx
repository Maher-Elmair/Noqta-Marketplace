import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { VendorCard } from '@/components/vendors/vendor-card';
import { Pagination } from '@/components/common/pagination';
import { Store } from 'lucide-react';
import { useVendors } from '@/hooks/use-vendors';
import { LoadingState } from '@/components/states/loading-state';

const ITEMS_PER_PAGE = 12;

export function VendorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const t = useTranslation();

  const { data: vendorsData, isLoading: isVendorsLoading } = useVendors(currentPage, ITEMS_PER_PAGE);

  const allVendors = vendorsData?.data || [];
  const pagination = vendorsData?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Store className="w-8 h-8" />
          {t('vendors.browseStores')}
        </h1>
        <p className="text-muted-foreground">
          {t('vendors.browseStoresDescription')}
        </p>
      </div>

      {/* All Vendors Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {t('vendors.allVendors')}
        </h2>

        {isVendorsLoading ? (
          <LoadingState count={8} />
        ) : allVendors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {allVendors.map((seller) => (
                <VendorCard key={seller.id} seller={seller} />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {t('vendors.noVendorsFound')}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
