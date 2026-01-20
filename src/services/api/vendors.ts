import { delay, mockSellers, mockProducts } from '@/services/mock-data';
import type { Seller, ApiResponse, PaginatedResponse } from '@/types';

// Storage key for consistent updates during session
const SELLERS_STORAGE_KEY = 'noqta_sellers_v2';

// Helper: Get sellers including local updates and DYNAMIC product counts
const getStoredSellers = (): Seller[] => {
  const stored = localStorage.getItem(SELLERS_STORAGE_KEY);
  let sellers: Seller[] = stored ? JSON.parse(stored) : [...mockSellers];

  // Recalculate product counts dynamically from products (mock or stored)
  const productStorage = localStorage.getItem('noqta_products_v2');
  const products = productStorage ? JSON.parse(productStorage) : mockProducts;

  sellers = sellers.map(seller => {
    const count = products.filter((p: { sellerId: string; isActive: boolean }) => p.sellerId === seller.id && p.isActive).length;
    return { ...seller, productCount: count };
  });

  // Save back to ensure consistency if we initialized
  if (!stored) {
    localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(sellers));
  }

  return sellers;
};

const saveSellers = (sellers: Seller[]) => {
  localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(sellers));
};

export const vendorsApi = {
  async getVendors(page = 1, pageSize = 12): Promise<PaginatedResponse<Seller>> {
    await delay(500);
    const allSellers = getStoredSellers();
    const activeSellers = allSellers.filter(s => s.isActive && (s.productCount || 0) > 0);
    
    const start = (page - 1) * pageSize;
    const paginated = activeSellers.slice(start, start + pageSize);

    return {
      data: paginated,
      pagination: {
        page,
        pageSize,
        total: activeSellers.length,
        totalPages: Math.ceil(activeSellers.length / pageSize)
      }
    };
  },

  async getFeaturedVendors(limit = 4): Promise<ApiResponse<Seller[]>> {
    await delay(400);
    const allSellers = getStoredSellers();
    // Logic: Verified and highest rated
    const featured = allSellers
      .filter(s => s.isActive && s.isVerified && (s.productCount || 0) > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);

    return { success: true, data: featured };
  },

  async getBestSellingVendors(limit = 4): Promise<ApiResponse<Seller[]>> {
     await delay(400);
     const allSellers = getStoredSellers();
     // Logic: Highest order count
     const bestSelling = allSellers
       .filter(s => s.isActive)
       .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
       .slice(0, limit);
     
     return { success: true, data: bestSelling };
  },

  async getVendorByUserId(userId: string): Promise<ApiResponse<Seller>> {
    await delay(300);
    const allSellers = getStoredSellers();
    const seller = allSellers.find(s => s.userId === userId);
    if (!seller) throw new Error('Vendor not found');
    return { success: true, data: seller };
  },

  async getVendorBySlug(slug: string): Promise<ApiResponse<Seller>> {
    await delay(300);
    const allSellers = getStoredSellers();
    const seller = allSellers.find(s => s.slug === slug);
    if (!seller) throw new Error('Vendor not found');
    return { success: true, data: seller };
  },

  async updateVendor(id: string, updates: Partial<Seller>): Promise<ApiResponse<Seller>> {
    await delay(600);
    const allSellers = getStoredSellers();
    const index = allSellers.findIndex(s => s.id === id);
    
    console.log('[VENDOR API] Updating vendor:', { id, index, updates });
    
    if (index === -1) {
      console.error('[VENDOR API] Vendor not found:', id);
      throw new Error('Vendor not found');
    }

    const updatedSeller = { ...allSellers[index], ...updates, updatedAt: new Date().toISOString() };
    allSellers[index] = updatedSeller;
    saveSellers(allSellers);
    
    console.log('[VENDOR API] Vendor updated successfully:', updatedSeller);

    return { success: true, data: updatedSeller };
  }
};
