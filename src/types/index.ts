/**
 * Core TypeScript types and interfaces for Noqta platform
 */

import { type UserRole } from '../lib/constants'

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  age?: number
  gender?: 'male' | 'female'
  country?: string
  bio?: string
  role: UserRole
  createdAt: string
  updatedAt: string
  isActive: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  language: 'ar' | 'en'
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  originalRole?: UserRole | null
}

// ============================================================================
// Products & Categories
// ============================================================================

export interface Category {
  id: string
  name: {
    ar: string
    en: string
  }
  slug: string
  description?: {
    ar: string
    en: string
  }
  image?: string
  parentId?: string | null
  children?: Category[]
  productCount?: number
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: {
    ar: string
    en: string
  }
  value: string
  type: 'color' | 'size' | 'material' | 'other'
}

export interface Product {
  id: string
  name: {
    ar: string
    en: string
  }
  slug: string
  description: {
    ar: string
    en: string
  }
  shortDescription?: {
    ar: string
    en: string
  }
  price: number
  discount?: number
  compareAtPrice?: number
  currency: string
  sku: string
  images: string[]
  categoryId: string
  category?: Category
  sellerId: string
  seller?: Seller
  stock: number
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  specifications?: Record<string, string>
  variants?: ProductVariant[]
  rating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Seller
// ============================================================================

export interface Seller {
  id: string
  userId: string
  user?: User
  storeName: {
    ar: string
    en: string
  }
  slug: string
  description?: {
    ar: string
    en: string
  }
  bio?: {
    ar: string
    en: string
  }
  logo?: string
  coverImage?: string
  rating?: number
  reviewCount?: number
  productCount?: number
  orderCount?: number
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SellerStats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  averageRating: number
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    thisYear: number
  }
  orders: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
}

// ============================================================================
// Cart & Checkout
// ============================================================================

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
  sellerId: string
  seller?: Seller
  variantId?: string
  selectedVariants?: Record<string, string>
  addedAt: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
  sellerGroups: Record<string, CartItem[]>
}

// ============================================================================
// Orders
// ============================================================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
  total: number
  variantId?: string
  selectedVariants?: Record<string, string>
}

export interface OrderPaymentDetails {
  card?: {
    number: string
    name: string
    expiry: string
    cvc?: string
  }
  wallet?: {
    mobile: string
  }
  paypal?: {
    email: string
  }
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: User
  items: OrderItem[]
  sellerId?: string
  seller?: Seller
  status: OrderStatus
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  trackingNumber?: string
  notes?: string
  paymentDetails?: OrderPaymentDetails
  createdAt: string
  updatedAt: string
}

export interface Address {
  id?: string
  name: string
  phone: string
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault?: boolean
}

// ============================================================================
// Reviews & Ratings
// ============================================================================

export interface Review {
  id: string
  productId: string
  product?: Product
  userId: string
  user?: User
  orderId?: string
  rating: number
  title?: string
  comment?: string
  images?: string[]
  isVerified: boolean
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Coupons & Discounts
// ============================================================================

export type CouponType = 'percentage' | 'fixed'
export type CouponScope = 'global' | 'category' | 'product' | 'seller'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  scope: CouponScope
  scopeIds?: string[]
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  validFrom: string
  validUntil: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Search & Recommendations
// ============================================================================

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  sellerId?: string
  tags?: string[]
  inStock?: boolean
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

export interface SearchResult {
  products: Product[]
  total: number
  page: number
  pageSize: number
  filters: SearchFilters
  suggestions?: string[]
  minPrice?: number
  maxPrice?: number
}

export interface Recommendation {
  type: 'similar' | 'frequently_bought_together' | 'trending' | 'personalized'
  products: Product[]
  reason?: {
    ar: string
    en: string
  }
}

// ============================================================================
// Notifications
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  priority: NotificationPriority
  title: {
    ar: string
    en: string
  }
  message: {
    ar: string
    en: string
  }
  actionUrl?: string
  actionLabel?: {
    ar: string
    en: string
  }
  isRead: boolean
  createdAt: string
}

// ============================================================================
// Analytics & Reports
// ============================================================================

export interface AnalyticsPeriod {
  start: string
  end: string
}

export interface SalesReport {
  period: AnalyticsPeriod
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Array<{
    product: Product
    quantity: number
    revenue: number
  }>
  topCategories: Array<{
    category: Category
    revenue: number
    orderCount: number
  }>
  dailyBreakdown: Array<{
    date: string
    sales: number
    orders: number
  }>
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, unknown>
}
