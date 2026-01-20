/**
 * Admin dashboard page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useTranslation } from '@/hooks/use-translation'

export function AdminDashboardPage() {
  const t = useTranslation()

  const stats = [
    {
      title: t('admin.totalUsers'),
      value: '12,345',
      icon: Users,
      change: '+15.2%',
    },
    {
      title: t('admin.totalOrders'),
      value: '8,901',
      icon: ShoppingBag,
      change: '+8.3%',
    },
    {
      title: t('admin.totalProducts'),
      value: '5,678',
      icon: Package,
      change: '+12.1%',
    },
    {
      title: t('seller.growth'),
      value: '18.5%',
      icon: TrendingUp,
      change: '+3.2%',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t('admin.dashboard')}
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
                <p className="text-xs text-muted-foreground">
                  {stat.change} {t('seller.fromLastMonth')}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.overview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('admin.platformOverview')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('admin.totalSellers')}:
                </span>
                <span className="font-semibold">234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('admin.activeProducts')}:
                </span>
                <span className="font-semibold">5,678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('admin.pendingOrders')}:
                </span>
                <span className="font-semibold">89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('admin.noNewNotifications')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-base">
              {t('admin.manageCategories')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('admin.manageCategoriesDesc')}
            </p>
          </CardContent>
        </Card>
        <Link to={ROUTES.ADMIN.USERS}>
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-base">
                {t('admin.manageUsers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('admin.manageUsersDesc')}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-base">
              {t('admin.viewReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('admin.viewReportsDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

