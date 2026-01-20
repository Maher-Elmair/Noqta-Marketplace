/**
 * React Query hooks for categories
 */

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/services/api/categories'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  bySlug: (slug: string) => [...categoryKeys.details(), 'slug', slug] as const,
}

/**
 * Get all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await categoriesApi.getCategories()
      return response.data
    },
  })
}

/**
 * Get category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await categoriesApi.getCategoryById(id)
      return response.data
    },
    enabled: !!id,
  })
}

/**
 * Get category by slug
 */
export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: categoryKeys.bySlug(slug),
    queryFn: async () => {
      const response = await categoriesApi.getCategoryBySlug(slug)
      return response.data
    },
    enabled: !!slug,
  })
}

