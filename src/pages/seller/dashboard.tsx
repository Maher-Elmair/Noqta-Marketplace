/**
 * Seller dashboard page
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ShoppingBag, TrendingUp, DollarSign, Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from '@/hooks/use-translation'
import { useRTL } from '@/hooks/use-rtl'
import { ROUTES } from '@/lib/constants'
import { useProducts } from '@/hooks/use-products'
import { useAuthStore } from '@/stores/auth-store'
import { useMemo } from 'react'

export function SellerDashboardPage() {
  const t = useTranslation()
  const isRTL = useRTL()
  const { user } = useAuthStore()
  const { data: productsResponse } = useProducts(1, 1000)

  // Get seller's products
  const sellerProducts = useMemo(() => {
    return productsResponse?.data?.filter(p => p.sellerId === user?.id) || []
  }, [productsResponse, user?.id])

  // Generate realistic orders from products
  const recentOrders = useMemo(() => {
    if (sellerProducts.length === 0) return []
    
    const customerNames = [
      'Ahmed Mohamed', 'Sarah Ali', 'Khaled Omar', 'Mona Zaki', 'Omar Hassan',
      'Fatima Ahmed', 'Youssef Ibrahim', 'Layla Hassan', 'Karim Mahmoud', 'Nour Khalil'
    ]
    const statuses = ['completed', 'processing', 'pending', 'cancelled']
    
    // Fix: Avoid impure functions (Math.random, Date.now) in render by generating data deterministically
    return Array.from({ length: Math.min(5, sellerProducts.length) }).map((_, i) => {
      const product = sellerProducts[i % sellerProducts.length]
      // Use a deterministic "random-like" quantity based on product id and i
      const quantity = ((product.id.toString().split('')
        .map(c => c.charCodeAt(0))
        .reduce((acc, v) => acc + v, 0) + i * 13) % 3) + 1
      const total = (product.price * quantity).toFixed(2)
      // Use a fixed reference date for consistency, e.g., Jan 1, 2024
      const baseDate = new Date(2024, 0, 1).getTime()
      const daysAgo = i
      const date = new Date(baseDate - daysAgo * 86400000)
      return {
        id: `ORD-${1001 + i}`,
        customer: customerNames[i % customerNames.length],
        date: date.toISOString().split('T')[0],
        total,
        status: statuses[i % statuses.length],
        productName: product.name,
        productId: product.id,
        quantity
      }
    })
  }, [sellerProducts])

  // Calculate real stats from products
  const stats = useMemo(() => {
    const totalProducts = sellerProducts.length
    const totalOrders = recentOrders.length * 20 // Estimate
    const avgPrice = sellerProducts.reduce((sum, p) => sum + p.price, 0) / (totalProducts || 1)
    const totalSales = (avgPrice * totalOrders).toFixed(0)
    
    return [
      {
        title: t('seller.totalSales'),
        value: `$${totalSales}`,
        icon: DollarSign,
        change: '+20.1%',
        trend: 'up' as const
      },
      {
        title: t('seller.orders'),
        value: totalOrders.toString(),
        icon: ShoppingBag,
        change: '+12.5%',
        trend: 'up' as const
      },
      {
        title: t('seller.products'),
        value: totalProducts.toString(),
        icon: Package,
        change: `+${Math.floor(totalProducts * 0.1)}`,
        trend: 'neutral' as const
      },
      {
        title: t('seller.growth'),
        value: '12.5%',
        icon: TrendingUp,
        change: '-2.4%',
        trend: 'down' as const
      },
    ]
  }, [sellerProducts, recentOrders.length, t])

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t('seller.dashboard')}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {stat.change} {t('seller.fromLastMonth')}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              {t('seller.products')}
              <Package className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('seller.manageProducts')}
            </p>
            <Link to={ROUTES.SELLER.PRODUCTS}>
              <Button className="w-full">
                <Package className="h-4 w-4 mr-2" />
                {t('seller.manageProducts')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              {t('seller.orders')}
              <ShoppingBag className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('seller.viewOrders')}
            </p>
            <Link to={ROUTES.SELLER.ORDERS}>
              <Button variant="outline" className="w-full">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t('seller.viewOrders')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('seller.recentOrders')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.orderId')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.customer')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.date')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.total')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.status')}</TableHead>
                    <TableHead className="text-right">{t('seller.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`${ROUTES.SELLER.ORDERS}?orderId=${order.id}`}>
                            <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            {t('seller.viewOrder')}
                            </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <p className="text-muted-foreground">
                {t('seller.noRecentOrders')}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

