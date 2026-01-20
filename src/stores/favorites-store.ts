import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesStore {
  favoritesMap: Record<string, string[]> // Map userId -> Product IDs
  addFavorite: (userId: string, productId: string) => void
  removeFavorite: (userId: string, productId: string) => void
  toggleFavorite: (userId: string, productId: string) => void
  isFavorite: (userId: string, productId: string) => boolean
  getCount: (userId: string) => number
  clearFavorites: (userId: string) => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoritesMap: {},

      addFavorite: (userId: string, productId: string) => {
        const { favoritesMap } = get()
        const userFavorites = favoritesMap[userId] || []
        if (!userFavorites.includes(productId)) {
          set({ 
            favoritesMap: {
                ...favoritesMap,
                [userId]: [...userFavorites, productId]
            }
          })
        }
      },

      removeFavorite: (userId: string, productId: string) => {
        const { favoritesMap } = get()
        const userFavorites = favoritesMap[userId] || []
        set({
           favoritesMap: {
                ...favoritesMap,
                [userId]: userFavorites.filter((id) => id !== productId)
           }
        })
      },

      toggleFavorite: (userId: string, productId: string) => {
        const { isFavorite, addFavorite, removeFavorite } = get()
        if (isFavorite(userId, productId)) {
          removeFavorite(userId, productId)
        } else {
          addFavorite(userId, productId)
        }
      },

      isFavorite: (userId: string, productId: string) => {
        const userFavorites = get().favoritesMap[userId] || []
        return userFavorites.includes(productId)
      },

      getCount: (userId: string) => {
        return (get().favoritesMap[userId] || []).length
      },

      clearFavorites: (userId: string) => {
        const { favoritesMap } = get()
        set({ 
            favoritesMap: {
                ...favoritesMap,
                [userId]: []
            }
        })
      },
    }),
    {
      name: 'noqta-favorites',
    }
  )
)

