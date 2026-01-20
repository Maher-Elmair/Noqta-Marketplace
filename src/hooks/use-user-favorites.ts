import { useAuthStore } from '@/stores/auth-store'
import { useFavoritesStore } from '@/stores/favorites-store'

export function useUserFavorites() {
  const { user } = useAuthStore()
  const store = useFavoritesStore()
  const userId = user?.id || 'guest'

  return {
    favorites: store.favoritesMap[userId] || [],
    addFavorite: (productId: string) => store.addFavorite(userId, productId),
    removeFavorite: (productId: string) => store.removeFavorite(userId, productId),
    toggleFavorite: (productId: string) => store.toggleFavorite(userId, productId),
    isFavorite: (productId: string) => store.isFavorite(userId, productId),
    count: store.getCount(userId),
    clearFavorites: () => store.clearFavorites(userId)
  }
}
