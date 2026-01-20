/**
 * Buyer cart page with seller grouping
 */

import { useCartStore } from '@/stores/cart-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/states/empty-state'
import { Trash2, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslation as useI18nTranslation } from 'react-i18next'

export function BuyerCartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore()
  const t = useTranslation()
  const { i18n } = useI18nTranslation()
  const language = i18n.language as 'ar' | 'en'

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title={t('cart.empty')}
          description={t('cart.emptyDescription')}
          action={{
            label: t('cart.browseProducts'),
            onClick: () => {
              window.location.href = ROUTES.BUYER.SEARCH
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {t('cart.title')}
        </h1>
        <Button variant="outline" onClick={clearCart}>
          {t('cart.clearCart')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(cart.sellerGroups).map(([sellerId, items]) => (
            <Card key={sellerId}>
              <CardHeader>
                <CardTitle>
                  {items[0]?.seller?.storeName
                    ? items[0].seller.storeName[language] || items[0].seller.storeName.en
                    : 'Seller'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-0"
                  >
                    <img
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name[language] || item.product.name.en}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {item.product.name[language] || item.product.name.en}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 text-center"
                        min={1}
                        max={99}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {t('cart.orderSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('cart.subtotal')}
                </span>
                <span className="font-semibold">
                  ${cart.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('cart.shipping')}
                </span>
                <span className="font-semibold">
                  {t('cart.shippingCalculated')}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('cart.total')}</span>
                  <span>
                    ${cart.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Link to={ROUTES.BUYER.CHECKOUT} className="block">
                <Button className="w-full" size="lg">
                  {t('cart.proceedToCheckout')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

