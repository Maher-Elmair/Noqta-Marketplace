import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cart, CartItem, Product } from '@/types'
import { CART } from '@/lib/constants'

interface CartStore {
  cart: Cart
  addItem: (product: Product, sellerId: string, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTotal: () => number
  getSellerGroups: () => Record<string, CartItem[]>
  isInCart: (productId: string) => boolean
}

const generateCartItemId = (productId: string, variantId?: string) => {
  return variantId ? `${productId}-${variantId}` : productId
}

const initialState: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
  sellerGroups: {},
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: initialState,

      addItem: (product: Product, sellerId: string, quantity = 1) => {
        const { cart } = get()
        const itemId = generateCartItemId(product.id)
        const existingItem = cart.items.find((item) => item.id === itemId)

        let newItems: CartItem[]

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            CART.MAX_QUANTITY
          )
          newItems = cart.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: newQuantity }
              : item
          )
        } else {
          const newItem: CartItem = {
            id: itemId,
            productId: product.id,
            product,
            quantity: Math.min(quantity, CART.MAX_QUANTITY),
            price: product.price,
            sellerId,
            addedAt: new Date().toISOString(),
          }
          newItems = [...cart.items, newItem]
        }

        const sellerGroups = newItems.reduce(
          (acc, item) => {
            if (!acc[item.sellerId]) {
              acc[item.sellerId] = []
            }
            acc[item.sellerId].push(item)
            return acc
          },
          {} as Record<string, CartItem[]>
        )

        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )

        set({
          cart: {
            items: newItems,
            total,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            sellerGroups,
          },
        })
      },

      removeItem: (itemId: string) => {
        const { cart } = get()
        const newItems = cart.items.filter((item) => item.id !== itemId)

        const sellerGroups = newItems.reduce(
          (acc, item) => {
            if (!acc[item.sellerId]) {
              acc[item.sellerId] = []
            }
            acc[item.sellerId].push(item)
            return acc
          },
          {} as Record<string, CartItem[]>
        )

        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )

        set({
          cart: {
            items: newItems,
            total,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            sellerGroups,
          },
        })
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < CART.MIN_QUANTITY) {
          get().removeItem(itemId)
          return
        }

        if (quantity > CART.MAX_QUANTITY) {
          quantity = CART.MAX_QUANTITY
        }

        const { cart } = get()
        const newItems = cart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )

        const sellerGroups = newItems.reduce(
          (acc, item) => {
            if (!acc[item.sellerId]) {
              acc[item.sellerId] = []
            }
            acc[item.sellerId].push(item)
            return acc
          },
          {} as Record<string, CartItem[]>
        )

        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )

        set({
          cart: {
            items: newItems,
            total,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            sellerGroups,
          },
        })
      },

      clearCart: () => {
        set({ cart: initialState })
      },

      getItemCount: () => {
        return get().cart.itemCount
      },

      getTotal: () => {
        return get().cart.total
      },

      getSellerGroups: () => {
        return get().cart.sellerGroups
      },

      isInCart: (productId: string) => {
        return get().cart.items.some((item) => item.productId === productId)
      },
    }),
    {
      name: 'noqta-cart',
    }
  )
)

