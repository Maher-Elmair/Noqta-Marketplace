
/**
 * Checkout page
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Wallet } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/stores/auth-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/use-toast'
import { ROUTES, COUNTRIES } from '@/lib/constants'
import { PaymentMethods, type PaymentData } from '@/components/checkout/payment-methods'
import type { Address } from '@/types'

export function BuyerCheckoutPage() {
  const { cart, clearCart } = useCartStore()
  const { i18n } = useI18nTranslation()
  const language = i18n.language as 'ar' | 'en'
  const { user } = useAuthStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const t = useTranslation()

  const [shippingAddress, setShippingAddress] = useState<Address>({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: COUNTRIES.find(c => c.code === 'SA')?.name || 'Saudi Arabia',
    isDefault: true,
  })

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const shipping = 10.0 // Fixed shipping cost
  const tax = cart.total * 0.15 // 15% tax
  const total = cart.total + shipping + tax

  // Validate payment data
  const isPaymentValid = () => {
    if (!paymentData) return false
    
    // Cash on delivery is always valid
    if (paymentData.method === 'cash') return true
    
    // For card payment
    if (paymentData.method === 'card') {
      const card = paymentData.card
      if (!card) return false
      return card.number.length >= 16 && 
             card.name.trim() !== '' && 
             card.expiry.match(/^\d{2}\/\d{2}$/) !== null &&
             card.cvv.length >= 3
    }
    
    // For wallet payment
    if (paymentData.method === 'wallet') {
      const wallet = paymentData.wallet
      if (!wallet) return false
      return wallet.mobile.length >= 10
    }
    
    // For PayPal payment
    if (paymentData.method === 'paypal') {
      const paypal = paymentData.paypal
      if (!paypal) return false
      return paypal.email.includes('@') && paypal.email.includes('.')
    }
    
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create order (in real app, this would call an API)

    const order = {
      id: `ORD-${Date.now()}`,
      orderNumber: `ORD-${Date.now()}`,
      userId: user?.id || 'guest', // Add User ID
      items: cart.items,
      total,
      shippingAddress,
      paymentMethod: paymentData?.method || 'cash',
      paymentDetails: paymentData,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    // Save Payment Info if requested
    if (paymentData?.saveInfo && user) {
      const savedMethods = JSON.parse(localStorage.getItem(`noqta-saved-payments-${user.id}`) || '[]')
      // Simple duplicate check
      const newMethod = {
        id: Date.now(),
        type: paymentData.method,
        details: paymentData.method === 'card' ? { ...paymentData.card, number: `**** ${paymentData.card?.number.slice(-4)}` } : 
                 paymentData.method === 'wallet' ? paymentData.wallet : 
                 paymentData.paypal
      }
      savedMethods.push(newMethod)
      localStorage.setItem(`noqta-saved-payments-${user.id}`, JSON.stringify(savedMethods))
    }

    // Save order to localStorage (in real app, this would be saved to backend)
    const existingOrders = JSON.parse(localStorage.getItem('noqta-orders') || '[]')
    existingOrders.push(order)
    localStorage.setItem('noqta-orders', JSON.stringify(existingOrders))

    // Clear cart
    clearCart()

    toast({
      title: t('common.success'),
      description: t('orders.orderPlacedSuccessfully'),
    })

    // Redirect to orders page
    navigate(ROUTES.BUYER.ORDERS)
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {t('cart.cartEmpty')}
            </p>
            <Button onClick={() => navigate(ROUTES.BUYER.SEARCH)}>
              {t('cart.browseProducts')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t('checkout.title')}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {t('checkout.shippingAddress')}
                </CardTitle>
                
                 {/* Saved Addresses Selector */}
                 {(() => {
                    const savedAddresses = JSON.parse(localStorage.getItem(`noqta-saved-addresses-${user?.id}`) || '[]') as (Address & { id: number })[]
                    if (savedAddresses.length > 0) {
                        return (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {t('checkout.selectSavedAddress')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{t('checkout.savedAddresses')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        {savedAddresses.map((addr: Address & { id: number }) => ( // Cast addr to include id for key
                                            <div 
                                                key={addr.id} 
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setShippingAddress({
                                                        name: addr.name || '', // Assuming name is part of saved address
                                                        phone: addr.phone || '', // Assuming phone is part of saved address
                                                        street: addr.street,
                                                        city: addr.city,
                                                        state: addr.state || '', // Not in saved Addr, default to empty
                                                        postalCode: addr.postalCode,
                                                        country: addr.country,
                                                        isDefault: false, // When selecting, it's not necessarily default
                                                    })
                                                    // Close dialog (hacky way since we are inside conditional render, better to control open state but this works for quick win)
                                                    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))
                                                }}
                                            >
                                                <div>
                                                    <p className="font-semibold">{addr.name}</p>
                                                    <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}</p>
                                                </div>
                                                <Button size="sm" variant="ghost">
                                                    {t('checkout.select')}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )
                    }
                    return null
                 })()}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.name')}</Label>
                  <Input
                    id="name"
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('auth.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">
                    {t('checkout.streetAddress')}
                  </Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      {t('checkout.city')}
                    </Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">
                      {t('checkout.stateRegion')}
                    </Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">
                      {t('checkout.postalCode')}
                    </Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          postalCode: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      {t('checkout.country')}
                    </Label>
                    <div className="relative">
                      <select
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            country: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        required
                      >
                        <option value="">
                          {t('profile.selectCountry')}
                        </option>
                        {COUNTRIES.map((country) => (
                          <option key={country.code} value={country.name}>
                            {t(`countries.${country.code}`)}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                 {/* Save Address Option */}
                <div className="flex items-center space-x-2 pt-2">
                   <Checkbox 
                        id="saveAddress" 
                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                             if (checked) {
                                // Save immediately logic or store in state to save on submit?
                                // Storing in localStorage immediately for simplicity as "Quick Save"
                                const savedAddresses = JSON.parse(localStorage.getItem(`noqta-saved-addresses-${user?.id}`) || '[]') as Array<Address & { id: number }>
                                const newAddr: Address & { id: number } = { // Ensure type matches Address
                                    id: Date.now() as never, // Cast to never to satisfy type constraint
                                    name: shippingAddress.name || t('checkout.newAddress'), // Use current name or default
                                    street: shippingAddress.street,
                                    city: shippingAddress.city,
                                    state: shippingAddress.state,
                                    postalCode: shippingAddress.postalCode,
                                    country: shippingAddress.country,
                                    phone: shippingAddress.phone || '', // Use current phone or default
                                    isDefault: false, // New saved address is not default by default
                                }
                                savedAddresses.push(newAddr)
                                localStorage.setItem(`noqta-saved-addresses-${user?.id}`, JSON.stringify(savedAddresses))
                                toast({
                                    title: t('common.success'),
                                    description: t('checkout.addressSaved'),
                                })
                             }
                        }}
                    />
                   <label
                     htmlFor="saveAddress"
                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 px-2"
                   >
                     {t('checkout.saveAddressForFuture')}
                   </label>
                 </div>

              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {t('checkout.paymentMethod')}
                </CardTitle>
                
                 {/* Saved Payments Selector */}
                 {(() => {
                    const savedPayments = JSON.parse(localStorage.getItem(`noqta-saved-payments-${user?.id}`) || '[]')
                    if (savedPayments.length > 0) {
                        return (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Wallet className="h-4 w-4" />
                                        {t('checkout.selectSavedPayment')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{t('checkout.savedPaymentMethods')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {savedPayments.map((payment: any) => (
                                            <div 
                                                key={payment.id} 
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    const paymentData: PaymentData = {
                                                        method: payment.type,
                                                        card: payment.type === 'card' ? payment.details : undefined,
                                                        wallet: payment.type === 'wallet' ? payment.details : undefined,
                                                        paypal: payment.type === 'paypal' ? payment.details : undefined,
                                                        saveInfo: false
                                                    }
                                                    setSelectedPayment(paymentData)
                                                    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))
                                                }}
                                            >
                                                <div>
                                                    <p className="font-semibold">
                                                        {payment.type === 'card' ? t('payment.creditCard') :
                                                         payment.type === 'wallet' ? t('payment.digitalWallet') : 'PayPal'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {payment.type === 'card' ? `**** ${payment.details.number.slice(-4)}` :
                                                         payment.type === 'wallet' ? payment.details.mobile :
                                                         payment.details.email}
                                                    </p>
                                                </div>
                                                <Button size="sm" variant="ghost">
                                                    {t('checkout.select')}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )
                    }
                    return null
                 })()}
              </CardHeader>
              <PaymentMethods onPaymentChange={setPaymentData} selectedMethod={selectedPayment} />
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('cart.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="line-clamp-1">
                        {item.product.name[language] || item.product.name.en}{' '}
                        x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('cart.subtotal')}
                    </span>
                    <span className="font-semibold">
                      ${cart.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('cart.shipping')}
                    </span>
                    <span className="font-semibold">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('cart.tax')}</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('cart.total')}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing || !isPaymentValid()}
                >
                  {isProcessing
                    ? t('common.loading')
                    : t('checkout.placeOrder')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

