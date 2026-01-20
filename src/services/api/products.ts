/**
 * Products API service (Mock)
 */

import { delay, mockProducts, mockCategories, mockSellers } from '@/services/mock-data'
import type {
  Product,
  SearchResult,
  SearchFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types'
import { PAGINATION } from '@/lib/constants'

// Initialize products from Local Storage or use mock data
const STORAGE_KEY = 'noqta_products_v2'

// Helper to get products (from storage or mock)
const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  // Initialize storage with mock data if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts))
  return [...mockProducts] // Return a copy
}

// Helper to save products to storage
const saveProductsToStorage = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export const productsApi = {
  /**
   * Get all products with pagination
   */
  async getProducts(
    page = 1,
    pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
    filters?: SearchFilters
  ): Promise<PaginatedResponse<Product>> {
    await delay(600)

    const allProducts = getStoredProducts()
    let filteredProducts = [...allProducts]

    // Apply filters
    if (filters) {
      if (filters.category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.categoryId === filters.category
        )
      }

      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= filters.minPrice!
        )
      }

      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price <= filters.maxPrice!
        )
      }

      if (filters.rating !== undefined) {
        filteredProducts = filteredProducts.filter(
          (p) => (p.rating || 0) >= filters.rating!
        )
      }

      if (filters.sellerId) {
        filteredProducts = filteredProducts.filter(
          (p) => p.sellerId === filters.sellerId
        )
      }

      if (filters.inStock) {
        filteredProducts = filteredProducts.filter((p) => p.stock > 0)
      }

      // Sort
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price)
            break
          case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price)
            break
          case 'rating':
            filteredProducts.sort(
              (a, b) => (b.rating || 0) - (a.rating || 0)
            )
            break
          case 'newest':
            filteredProducts.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            break
        }
      }
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedProducts = filteredProducts.slice(start, end)

    // Enrich with category and seller data
    const enrichedProducts = paginatedProducts.map((product) => ({
      ...product,
      category: mockCategories.find((c) => c.id === product.categoryId),
      seller: mockSellers.find((s) => s.id === product.sellerId),
    }))

    return {
      data: enrichedProducts,
      pagination: {
        page,
        pageSize,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / pageSize),
      },
    }
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    await delay(400)

    const allProducts = getStoredProducts()
    const product = allProducts.find((p) => p.id === id)

    if (!product) {
      throw new Error('Product not found')
    }

    const enrichedProduct: Product = {
      ...product,
      category: mockCategories.find((c) => c.id === product.categoryId),
      seller: mockSellers.find((s) => s.id === product.sellerId),
    }

    return {
      success: true,
      data: enrichedProduct,
    }
  },

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    await delay(400)

    const allProducts = getStoredProducts()
    const product = allProducts.find((p) => p.slug === slug)

    if (!product) {
      throw new Error('Product not found')
    }

    const enrichedProduct: Product = {
      ...product,
      category: mockCategories.find((c) => c.id === product.categoryId),
      seller: mockSellers.find((s) => s.id === product.sellerId),
    }

    return {
      success: true,
      data: enrichedProduct,
    }
  },

  /**
   * Get products by IDs
   */
  async getProductsByIds(ids: string[]): Promise<ApiResponse<Product[]>> {
    await delay(400)

    const allProducts = getStoredProducts()
    const products = allProducts.filter((p) => ids.includes(p.id))

    const enrichedProducts = products.map((product) => ({
        ...product,
        category: mockCategories.find((c) => c.id === product.categoryId),
        seller: mockSellers.find((s) => s.id === product.sellerId),
    }))

    return {
      success: true,
      data: enrichedProducts,
    }
  },

  /**
   * Search products
   */
  async searchProducts(
    query: string,
    page = 1,
    pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
    filters?: SearchFilters
  ): Promise<SearchResult> {
    await delay(700)

    const allProducts = getStoredProducts()
    let results = [...allProducts]

    // Simple text search (in production, this would be more sophisticated)
    if (query.trim()) {
      const searchLower = query.toLowerCase()
      results = results.filter((product) => {
        const nameAr = product.name.ar.toLowerCase()
        const nameEn = product.name.en.toLowerCase()
        const descAr = product.description.ar.toLowerCase()
        const descEn = product.description.en.toLowerCase()
        return (
          nameAr.includes(searchLower) ||
          nameEn.includes(searchLower) ||
          descAr.includes(searchLower) ||
          descEn.includes(searchLower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        )
      })
    }

    // Apply additional filters
    if (filters) {
      if (filters.category) {
        results = results.filter((p) => p.categoryId === filters.category)
      }
      if (filters.minPrice !== undefined) {
        results = results.filter((p) => p.price >= filters.minPrice!)
      }
      if (filters.maxPrice !== undefined) {
        results = results.filter((p) => p.price <= filters.maxPrice!)
      }
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedResults = results.slice(start, end)

    // Generate suggestions (mock)
    const suggestions = query.trim()
      ? ['smartphone', 'electronics', 'clothing'].filter((s) =>
          s.includes(query.toLowerCase())
        )
      : []

    // Calculate statistics from the results (before pagination but after filtering)
    // We want the price range to reflect available products in the current category/search context
    // Ignoring price filter for stats to give the user the full range of available prices
    let statsResults = [...allProducts]
    if (query.trim()) {
        const searchLower = query.toLowerCase()
        statsResults = statsResults.filter((product) => {
            const nameAr = product.name.ar.toLowerCase()
            const nameEn = product.name.en.toLowerCase()
            return (
              nameAr.includes(searchLower) ||
              nameEn.includes(searchLower) ||
              product.tags.some((tag) => tag.toLowerCase().includes(searchLower))
            )
        })
    }
    if (filters?.category) {
        statsResults = statsResults.filter((p) => p.categoryId === filters.category)
    }

    const prices = statsResults.map(p => p.price)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000

    return {
      products: paginatedResults.map((product) => ({
        ...product,
        category: mockCategories.find((c) => c.id === product.categoryId),
        seller: mockSellers.find((s) => s.id === product.sellerId),
      })),
      total: results.length,
      page,
      pageSize,
      filters: filters || {},
      suggestions,
      minPrice,
      maxPrice
    }
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<ApiResponse<Product[]>> {
    await delay(500)

    const allProducts = getStoredProducts()
    const featured = allProducts
      .filter((p) => p.isFeatured)
      .slice(0, limit)
      .map((product) => ({
        ...product,
        category: mockCategories.find((c) => c.id === product.categoryId),
        seller: mockSellers.find((s) => s.id === product.sellerId),
      }))

    return {
      success: true,
      data: featured,
    }
  },

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit = 10): Promise<ApiResponse<Product[]>> {
    await delay(500)

    const allProducts = getStoredProducts()
    const newArrivals = [...allProducts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((product) => ({
        ...product,
        category: mockCategories.find((c) => c.id === product.categoryId),
        seller: mockSellers.find((s) => s.id === product.sellerId),
      }))

    return {
      success: true,
      data: newArrivals,
    }
  },

  /**
   * Create new product
   */
  async createProduct(productData: Partial<Product>): Promise<ApiResponse<Product>> {
    await delay(800)

    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      slug: productData.name?.en.toLowerCase().replace(/\s+/g, '-') || 'new-product',
      name: productData.name || { ar: '', en: '' },
      description: productData.description || { ar: '', en: '' },
      price: productData.price || 0,
      stock: productData.stock || 0,
      categoryId: productData.categoryId || '',
      sellerId: productData.sellerId || '',
      currency: 'SAR', // Default currency
      sku: Math.random().toString(36).substr(2, 6).toUpperCase(), // Generate random SKU
      images: productData.images || [],
      variants: productData.variants || [],
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      rating: 0,
      reviewCount: 0,
      ...productData,
    }

    const allProducts = getStoredProducts()
    allProducts.unshift(newProduct)
    saveProductsToStorage(allProducts)

    return {
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    }
  },

  /**
   * Update existing product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    await delay(800)

    const allProducts = getStoredProducts()
    const index = allProducts.findIndex((p) => p.id === id)
    
    if (index === -1) {
      throw new Error('Product not found')
    }

    const updatedProduct = {
      ...allProducts[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    }

    allProducts[index] = updatedProduct
    saveProductsToStorage(allProducts)

    return {
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    await delay(600)

    const allProducts = getStoredProducts()
    const index = allProducts.findIndex((p) => p.id === id)
    
    if (index === -1) {
      throw new Error('Product not found')
    }

    allProducts.splice(index, 1)
    saveProductsToStorage(allProducts)

    return {
      success: true,
      data: undefined as unknown as void,
      message: 'Product deleted successfully',
    }
  },
}
