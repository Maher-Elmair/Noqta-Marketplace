/**
 * React Query hooks for products
 */

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/services/api/products'
import type { SearchFilters } from '@/types'
import { PAGINATION } from '@/lib/constants'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, filters?: SearchFilters) =>
    [...productKeys.lists(), page, pageSize, filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, filters?: SearchFilters) =>
    [...productKeys.all, 'search', query, filters] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
}

/**
 * Get products with pagination
 */
export function useProducts(
  page = 1,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
  filters?: SearchFilters
) {
  return useQuery({
    queryKey: productKeys.list(page, pageSize, filters),
    queryFn: () => productsApi.getProducts(page, pageSize, filters),
  })
}

/**
 * Get product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
  })
}

/**
 * Get product by slug
 */
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug,
  })
}

/**
 * Get products by IDs
 */
export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['products', 'ids', ids],
    queryFn: () => productsApi.getProductsByIds(ids),
    enabled: ids.length > 0,
  })
}

/**
 * Search products
 */
export function useSearchProducts(
  query: string,
  page = 1,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
  filters?: SearchFilters
) {
  return useQuery({
    queryKey: [...productKeys.search(query, filters), page, pageSize],
    queryFn: () => productsApi.searchProducts(query, page, pageSize, filters),
    enabled: query.trim().length > 0,
  })
}

/**
 * Get featured products
 */
export function useFeaturedProducts(limit = 10) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => productsApi.getFeaturedProducts(limit),
  })
}

/**
 * Get new arrivals
 */
export function useNewArrivals(limit = 10) {
  return useQuery({
    queryKey: [...productKeys.all, 'new-arrivals'],
    queryFn: () => productsApi.getNewArrivals(limit),
  })
}

/**
 * Create product mutation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product } from '../types'

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newProduct: Partial<Product>) => productsApi.createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

/**
 * Update product mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.data.id) })
    },
  })
}

/**
 * Delete product mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
