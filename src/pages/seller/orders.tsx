import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { useRTL } from '@/hooks/use-rtl'
import { EmptyState } from '@/components/states/empty-state'
import { useProducts } from '@/hooks/use-products'
import { useAuthStore } from '@/stores/auth-store'
import { BackButton } from '@/components/common/back-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SellerOrdersPage() {
  const t = useTranslation()
  const { i18n } = useI18nTranslation()
  const language = i18n.language as 'ar' | 'en'
  const isRTL = useRTL()
  const { user } = useAuthStore()
  const { data: productsResponse } = useProducts(1, 1000)
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null)
  
  // Advanced Filters & Sort
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  
  const orderRefs = useRef<Record<string, HTMLTableRowElement | null>>({})
  const itemsPerPage = 15

  // Get seller's products
  const sellerProducts = useMemo(() => {
    return productsResponse?.data?.filter(p => p.sellerId === user?.id) || []
  }, [productsResponse, user?.id])

  // Order item interface
  interface OrderItem {
    id: string;
    customerName: string;
    date: string;
    total: string;
    status: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any; // Can be number (fake) or array (real orders)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productName: any; // Can be string or localized object
    paymentMethod: string;
    isReal: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingAddress?: any; // Only exists in real orders
    createdAt?: string; // Only exists in real orders
  }

  // Generate realistic orders from products with mutable status
  const [allOrders, setAllOrders] = useState<OrderItem[]>([])
  
  useEffect(() => {
    // 1. Generate fake demo orders (as before)
    if (sellerProducts.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllOrders([])
      return
    }
    
    const customerNames = [
      'Ahmed Mohamed', 'Sarah Ali', 'Khaled Omar', 'Mona Zaki', 'Omar Hassan',
      'Fatima Ahmed', 'Youssef Ibrahim', 'Layla Hassan', 'Karim Mahmoud', 'Nour Khalil',
      'Amira Saeed', 'Hassan Ali', 'Dina Mostafa', 'Tarek Fathy', 'Heba Nabil'
    ]
    const statuses = ['completed', 'processing', 'pending', 'cancelled']
    
    // Generate 25 orders from products
    const fakeOrders = Array.from({ length: Math.min(25, sellerProducts.length * 3) }).map((_, i) => {
      const product = sellerProducts[i % sellerProducts.length]
      const quantity = Math.floor(Math.random() * 3) + 1
      const total = (product.price * quantity).toFixed(2)
      const daysAgo = i
      // Generate random time between 9 AM and 9 PM
      const hours = Math.floor(Math.random() * 12) + 9
      const minutes = Math.floor(Math.random() * 60)
      const date = new Date(Date.now() - daysAgo * 86400000)
      date.setHours(hours, minutes, 0, 0)
      
      return {
        id: `ORD-${1000 + i}`,
        customerName: customerNames[i % customerNames.length],
        date: date.toISOString(), // Includes time now
        total,
        status: statuses[i % statuses.length],
        items: quantity,
        productName: product.name,
        paymentMethod: ['card', 'wallet', 'paypal', 'cash'][Math.floor(Math.random() * 4)],
        isReal: false // Flag to distinguish fake orders
      }
    })
    
    // 2. Load REAL orders from loadStorage (Buyer's orders)
    const realOrdersData = JSON.parse(localStorage.getItem('noqta-orders') || '[]')
    
    // Filter real orders that contain ANY product from this seller
    // In a real backend, this would be handled by DB query
    // Here we check if any item in the order belongs to this seller (by checking if product ID exists in sellerProducts)
    const sellerProductIds = new Set(sellerProducts.map(p => p.id))
    
    const realOrders = realOrdersData.filter((order: OrderItem) => {
        // Check if any item in the order corresponds to a product owned by this seller
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return order.items.some((item: any) => sellerProductIds.has(item.product.id))
    }).map((order: OrderItem) => {
        // Map real order structure to dashboard order structure
        // We only show items relevant to this seller or summary
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const relevantItems = order.items.filter((item: any) => sellerProductIds.has(item.product.id))
        // Calculate total for this seller only
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sellerTotal = relevantItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
        
        return {
            id: order.id,
            customerName: order.shippingAddress.name, // Real customer name
            date: order.createdAt, // Should be ISO string with time
            total: sellerTotal.toFixed(2),
            status: order.status,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: relevantItems.reduce((acc: number, item: any) => acc + item.quantity, 0),
            productName: relevantItems[0]?.product.name || 'Multiple Items', // Show first product name
            paymentMethod: order.paymentMethod,
            isReal: true // Flag to distinguish real orders
        }
    })

    // Combine fake and real orders
    // Place real orders first
    const combinedOrders = [...realOrders, ...fakeOrders]

    // 3. Load saved status changes from localStorage (Overrides)
    const savedStatuses = localStorage.getItem('orderStatuses')
    if (savedStatuses) {
      try {
        const statusMap = JSON.parse(savedStatuses)
        // Apply saved statuses to orders
        combinedOrders.forEach(order => {
          if (statusMap[order.id]) {
            order.status = statusMap[order.id]
          }
        })
      } catch (e) {
        console.error('Failed to parse saved order statuses', e)
      }
    }
    
    setAllOrders(combinedOrders)
  }, [sellerProducts])

  // Filter orders
  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    // Search Query
    const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status Filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    // Date Filter
    // Note: Date input gives YYYY-MM-DD, order.date might be ISO string or YYYY-MM-DD
    const orderDatePart = new Date(order.date).toISOString().split('T')[0]
    const matchesDate = !dateFilter || orderDatePart === dateFilter

    // Payment Filter
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter

    return matchesSearch && matchesStatus && matchesDate && matchesPayment
  }).sort((a, b) => {
    // Sort Order
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
     const statusKeys: Record<string, string> = {
         'completed': 'orders.completed',
         'processing': 'orders.processing',
         'pending': 'orders.pending',
         'cancelled': 'orders.cancelled'
     }
     return t(statusKeys[status] || status)
  }

  const getPaymentMethodLabel = (method: string) => {
    const methodKeys: Record<string, string> = {
      card: 'payment.creditCard',
      wallet: 'payment.digitalWallet',
      paypal: 'PayPal',
      cash: 'payment.cashOnDelivery',
    }
    return methodKeys[method] ? t(methodKeys[method]) : method
  }

  // Function to update order status
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    // Update the order in the allOrders array
    setAllOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    
    // Save to localStorage
    try {
      const savedStatuses = localStorage.getItem('orderStatuses')
      const statusMap = savedStatuses ? JSON.parse(savedStatuses) : {}
      statusMap[orderId] = newStatus
      localStorage.setItem('orderStatuses', JSON.stringify(statusMap))
    } catch (e) {
      console.error('Failed to save order status', e)
    }
    
    // In a real app, this would call an API to update the order status
    console.log(`Updated order ${orderId} to status: ${newStatus}`)
    
    // IMPORTANT: If this is a real order, we should ideally also update 'noqta-orders'
    // But since 'orderStatuses' acts as an override layer, updating 'orderStatuses' is sufficient 
    // for sync as Buyer page will also read 'orderStatuses'.
  }

  // Get current status for an order
  const getCurrentStatus = (orderId: string) => {
    const order = allOrders.find(o => o.id === orderId)
    return order?.status || 'pending'
  }

  // Handle order highlighting from URL parameter
  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlightedOrderId(orderId)
      // Set search query to find the order
      setSearchQuery(orderId)
      // Replace URL to remove parameter (prevents back button loop)
      setSearchParams({}, { replace: true })
      // Scroll to order after a short delay
      setTimeout(() => {
        const orderElement = orderRefs.current[orderId]
        if (orderElement) {
          orderElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        // Clear search to show all orders after scrolling
        setTimeout(() => {
          setSearchQuery('')
        }, 500)
      }, 300)
    }
  }, [searchParams, setSearchParams])

  // Clear highlight on any user interaction
  const handleClearHighlight = () => {
    if (highlightedOrderId) {
      setHighlightedOrderId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <BackButton />

      <h1 className="text-3xl font-bold mb-6">
        {t('seller.ordersManagement')}
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('seller.myOrders')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 mb-6 items-start xl:items-center justify-between bg-muted/20 p-4 rounded-lg">
                {/* Left: Search */}
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('seller.searchOrderPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background"
                    />
                </div>
            
                {/* Right: Filters & Sort */}
                <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center">
                    {/* Status */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-background">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                             <span className="text-muted-foreground truncate">{t('seller.statusLabel')}</span>
                             <span className="font-medium truncate">
                                {statusFilter === 'all' 
                                    ? t('orders.all')
                                    : getStatusLabel(statusFilter)}
                             </span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('seller.allStatuses')}</SelectItem>
                        <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                        <SelectItem value="processing">{t('orders.processing')}</SelectItem>
                        <SelectItem value="completed">{t('orders.completed')}</SelectItem>
                        <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
                    </SelectContent>
                    </Select>

                    {/* Payment */}
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-[150px] bg-background">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                             <span className="text-muted-foreground truncate">{t('seller.payLabel')}</span>
                             <span className="font-medium truncate">
                                {paymentFilter === 'all' 
                                    ? t('orders.all')
                                    : getPaymentMethodLabel(paymentFilter)}
                             </span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('orders.all')}</SelectItem>
                        <SelectItem value="card">{t('payment.creditCard')}</SelectItem>
                        <SelectItem value="wallet">{t('payment.digitalWallet')}</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="cash">{t('payment.cashOnDelivery')}</SelectItem>
                    </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={sortOrder} onValueChange={(v: 'newest' | 'oldest') => setSortOrder(v)}>
                    <SelectTrigger className="w-[150px] bg-background">
                         <div className="flex items-center gap-1.5 overflow-hidden">
                             <span className="text-muted-foreground truncate">{t('seller.sortLabel')}</span>
                             <span className="font-medium truncate">
                                {sortOrder === 'newest' 
                                    ? t('seller.newest')
                                    : t('seller.oldest')}
                             </span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">{t('seller.newestFirst')}</SelectItem>
                        <SelectItem value="oldest">{t('seller.oldestFirst')}</SelectItem>
                    </SelectContent>
                    </Select>

                    {/* Date Input (Compact) */}
                    <div className="relative">
                        <Input 
                            type="date" 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-[140px] bg-background text-sm"
                        />
                    </div>
                </div>
            </div>

          {displayedOrders.length > 0 ? (
            <div className="rounded-md border" onClick={handleClearHighlight}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.orderId')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.customer')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.dateTime')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.items')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.payment')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.total')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.status')}</TableHead>
                    <TableHead className="text-right">{t('seller.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedOrders.map((order, index) => (
                    <TableRow 
                      key={order.id}
                      ref={(el) => { orderRefs.current[order.id] = el }}
                      className={highlightedOrderId === order.id ? 'border-2 border-blue-500' : ''}
                    >
                      <TableCell className="font-medium text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                            <span className="font-medium">{new Date(order.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                            <span className="text-muted-foreground">{new Date(order.date).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell className="text-sm">{getPaymentMethodLabel(order.paymentMethod)}</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(getCurrentStatus(order.id))}`}>
                          {getStatusLabel(getCurrentStatus(order.id))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={getCurrentStatus(order.id)}
                          onValueChange={(value) => handleUpdateStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                {t('orders.pending')}
                              </div>
                            </SelectItem>
                            <SelectItem value="processing">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {t('orders.processing')}
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {t('orders.completed')}
                              </div>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                {t('orders.cancelled')}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title={t('seller.noOrdersFound')}
              description={t('seller.noOrdersFoundDescription')}
            />
          )}

          {/* Pagination */}
          {filteredOrders.length > itemsPerPage && (
            <div className="mt-4">
               <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
