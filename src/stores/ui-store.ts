import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: false,

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
        // Apply theme to document
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          root.classList.toggle('dark', theme === 'dark')
        }
      },

      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen })
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },
    }),
    {
      name: 'noqta-ui',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply saved theme to document
          if (typeof document !== 'undefined') {
            if (state.theme === 'dark') {
              document.documentElement.classList.add('dark')
            }
          }
        }
      },
    }
  )
)

