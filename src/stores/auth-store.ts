import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'
import { USER_ROLES, type UserRole } from '@/lib/constants'

interface AuthStore extends AuthState {
  originalRole?: UserRole | null
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  switchRole: (role: UserRole) => void
  hasRole: (role: UserRole) => boolean
  isBuyer: () => boolean
  isSeller: () => boolean
  isAdmin: () => boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  originalRole: null, // Track original role for reverting
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          originalRole: user.role, // Set original role on login
        })
      },

      logout: () => {
        set(initialState)
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          })
        }
      },

      switchRole: (role: UserRole) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, role },
            // If originalRole is not set, set it to current (safety)
            originalRole: get().originalRole || currentUser.role 
          })
        }
      },

      hasRole: (role: UserRole) => {
        return get().user?.role === role
      },

      isBuyer: () => {
        return get().user?.role === USER_ROLES.BUYER
      },

      isSeller: () => {
        return get().user?.role === USER_ROLES.SELLER
      },

      isAdmin: () => {
        return get().user?.role === USER_ROLES.ADMIN
      },
    }),
    {
      name: 'noqta-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

