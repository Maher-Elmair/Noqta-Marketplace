/**
 * Categories API service (Mock)
 */

import { delay, mockCategories } from '@/services/mock-data'
import type { Category, ApiResponse } from '@/types'

export const categoriesApi = {
  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    await delay(400)

    return {
      success: true,
      data: mockCategories,
    }
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    await delay(300)

    const category = mockCategories.find((c) => c.id === id)

    if (!category) {
      throw new Error('Category not found')
    }

    return {
      success: true,
      data: category,
    }
  },

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    await delay(300)

    const category = mockCategories.find((c) => c.slug === slug)

    if (!category) {
      throw new Error('Category not found')
    }

    return {
      success: true,
      data: category,
    }
  },
}

