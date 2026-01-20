/**
 * Application-wide constants
 */

export const APP_NAME = 'Noqta'

// User roles
export const USER_ROLES = {
  GUEST: 'guest',
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BUYER: {
    HOME: '/buyer',
    SEARCH: '/buyer/search',
    CART: '/buyer/cart',
    CHECKOUT: '/buyer/checkout',
    FAVORITES: '/buyer/favorites',
    ORDERS: '/buyer/orders',
    PROFILE: '/buyer/profile',
  },
  SELLER: {
    DASHBOARD: '/seller',
    PRODUCTS: '/seller/products',
    ORDERS: '/seller/orders',
    ANALYTICS: '/seller/analytics',
    SETTINGS: '/seller/settings',
    PROFILE: '/seller/profile',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    CATEGORIES: '/admin/categories',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    REPORTS: '/admin/reports',
    PROFILE: '/admin/profile',
  },
  PRODUCT: '/product',
  CATEGORY: '/category',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// Cart
export const CART = {
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
} as const

// Product
export const PRODUCT = {
  MAX_IMAGES: 10,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
} as const

// Countries
export const COUNTRIES = [
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'QA', name: 'Qatar' },
  { code: 'OM', name: 'Oman' },
  { code: 'JO', name: 'Jordan' },
  { code: 'MA', name: 'Morocco' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'YE', name: 'Yemen' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'PS', name: 'Palestine' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'LY', name: 'Libya' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SY', name: 'Syria' },
  { code: 'OTHER', name: 'Other' },
] as const
