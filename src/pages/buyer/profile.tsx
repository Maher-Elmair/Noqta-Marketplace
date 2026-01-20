/**
 * Buyer Profile Page
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/use-toast'
import { User, ShoppingBag, Settings, Store, Heart, LogOut } from 'lucide-react'
import { ErrorState } from '@/components/states/error-state'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES, COUNTRIES } from '@/lib/constants'
import type { Order, Address } from '@/types'

import { Camera, Trash2, CreditCard, Wallet, MapPin, Plus, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useUserFavorites } from '@/hooks/use-user-favorites'
import { cn } from '@/lib/utils'
import { useProductsByIds } from '@/hooks/use-products'
import { useVendorByUserId, useUpdateVendor } from '@/hooks/use-vendors'

export function BuyerProfilePage() {
  const { user, updateUser, switchRole, logout, originalRole } = useAuthStore()
  const t = useTranslation()
  const { i18n } = useI18nTranslation()
  const language = i18n.language as 'ar' | 'en'
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email] = useState(user?.email || '')
  
  // New Fields
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [age, setAge] = useState(user?.age?.toString() || '')
  const [gender, setGender] = useState<'male' | 'female' | ''>(user?.gender || '')
  const [country, setCountry] = useState(user?.country || '')
  
  // Address Dialog State
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  })
  
  // Store Settings State
  const { data: sellerResponse } = useVendorByUserId(user?.id)
  const seller = sellerResponse?.data
  const { mutate: updateVendor } = useUpdateVendor()
  
  // Favorites hooks - moved from IIFE to component level
  const { favorites: favoriteIds } = useUserFavorites()
  const { data: productsResponse, isLoading: isFavoritesLoading } = useProductsByIds(favoriteIds)
  
  // Local state for editing - initialized directly from seller data
  const [localProfileBanner, setLocalProfileBanner] = useState(seller?.coverImage || '')
  const [localBioAr, setLocalBioAr] = useState(seller?.bio?.ar || '')
  const [localBioEn, setLocalBioEn] = useState(seller?.bio?.en || '')


  const handleSaveAddress = () => {
    if (!newAddress.street || !newAddress.city) {
        toast({
            title: t('common.error'),
            description: t('profile.pleaseFillRequiredFields'),
            variant: "destructive"
        })
        return
    }

      
    const savedAddresses = JSON.parse(localStorage.getItem(`noqta-saved-addresses-${user?.id}`) || '[]')
    
    if (editingAddressId) {
        // Update existing address
        const index = savedAddresses.findIndex((a: Address & { id: number }) => a.id === editingAddressId)
        if (index !== -1) {
            savedAddresses[index] = { id: editingAddressId, ...newAddress }
        }
    } else {
        // Add new address
        const address = {
            id: Date.now(),
            ...newAddress
        }
        savedAddresses.push(address)
    }
    localStorage.setItem(`noqta-saved-addresses-${user?.id}`, JSON.stringify(savedAddresses))
    
    setShowAddressDialog(false)
    setEditingAddressId(null)
    setNewAddress({ name: '', street: '', city: '', state: '', postalCode: '', country: '', phone: '' })
    window.location.reload()
  }

  const handleEditAddress = (address: Address & { id: number }) => {
    setNewAddress({
        name: address.name || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        phone: address.phone || ''
    })
    setEditingAddressId(address.id)
    setShowAddressDialog(true)
  }

  // Payment Method State
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null)
  const [paymentType, setPaymentType] = useState<'card' | 'wallet' | 'paypal'>('card')
  
  interface PaymentMethod {
    id: number
    type: 'card' | 'wallet' | 'paypal'
    details: {
      number?: string
      name?: string
      expiry?: string
      cvc?: string
      mobile?: string
      email?: string
    }
  }
  
  const [newPayment, setNewPayment] = useState({
    card: { number: '', name: '', expiry: '', cvc: '' },
    wallet: { mobile: '' },
    paypal: { email: '' }
  })

  const handleSavePayment = () => {
    const savedPayments = JSON.parse(localStorage.getItem(`noqta-saved-payments-${user?.id}`) || '[]')
    
    // ... (rest of logic)

    const paymentData = {
        type: paymentType,
        details: paymentType === 'card' ? newPayment.card : 
                 paymentType === 'wallet' ? newPayment.wallet : newPayment.paypal
    }

    if (editingPaymentId) {
        const index = savedPayments.findIndex((p: PaymentMethod) => p.id === editingPaymentId)
        if (index !== -1) {
            savedPayments[index] = { id: editingPaymentId, ...paymentData }
        }
    } else {
        savedPayments.push({
            id: Date.now(),
            ...paymentData
        })
    }
    localStorage.setItem(`noqta-saved-payments-${user?.id}`, JSON.stringify(savedPayments))
    setShowPaymentDialog(false)
    setEditingPaymentId(null)
    setNewPayment({
        card: { number: '', name: '', expiry: '', cvc: '' },
        wallet: { mobile: '' },
        paypal: { email: '' }
    })
    window.location.reload()
  }

  const handleEditPayment = (method: PaymentMethod) => {
    setPaymentType(method.type)
    setNewPayment({
        card: method.type === 'card' ? {
          number: method.details.number || '',
          name: method.details.name || '',
          expiry: method.details.expiry || '',
          cvc: method.details.cvc || ''
        } : { number: '', name: '', expiry: '', cvc: '' },
        wallet: method.type === 'wallet' ? {
          mobile: method.details.mobile || ''
        } : { mobile: '' },
        paypal: method.type === 'paypal' ? {
          email: method.details.email || ''
        } : { email: '' }
    })
    setEditingPaymentId(method.id)
    setShowPaymentDialog(true)
  }

  const handleUpdateProfile = () => {
    if (user) {
      updateUser({ 
        name, 
        phone, 
        // email is not updated
        avatar,
        age: age ? parseInt(age) : undefined,
        gender: gender as 'male' | 'female' | undefined,
        country
      })
      
      // Sync with vendor data if seller exists (regardless of role)
      if (seller) {
        console.log('[VENDOR SYNC] Syncing vendor data:', {
          sellerId: seller.id,
          avatar,
          profileBanner: localProfileBanner,
          bioAr: localBioAr,
          bioEn: localBioEn,
          sellerBio: seller.bio
        })
        
        updateVendor({
          id: seller.id,
          data: {
            logo: avatar,
            coverImage: localProfileBanner,
            bio: {
              ar: localBioAr,
              en: localBioEn
            }
          }
        })
      } else {
        console.log('[VENDOR SYNC] No seller data found for user:', user.id)
      }
      
      setIsEditing(false) // Exit edit mode after saving
      toast({
        title: t('common.success'),
        description: t('profile.profileUpdated'),
      })
    }
  }

  const handleSwitchToSeller = () => {
    if (user) {
      switchRole('seller')
      toast({
        title: t('common.success'),
        description: t('profile.switchToSeller'),
      })
    }
  }

  const handleSwitchToBuyer = () => {
    if (user) {
      switchRole('buyer')
      toast({
        title: t('common.success'),
        description: t('profile.switchToBuyer'),
      })
    }
  }

  
  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
    toast({
        title: t('common.success'),
        description: t('profile.loggedOutSuccessfully'),
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          title={t('errors.notFound')}
          message={t('errors.genericErrorDescription')}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t('profile.title')}
      </h1>

      <Tabs defaultValue="info" className="space-y-8">
        <div className="flex justify-center w-full">
          <TabsList className="flex flex-wrap h-auto items-center justify-center gap-2 bg-muted/50 backdrop-blur-sm p-2 rounded-2xl md:rounded-full w-fit max-w-full">
            <TabsTrigger 
              value="info" 
              className="rounded-full border-0 bg-transparent data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2 transition-all flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              {t('profile.aboutMe')}
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="rounded-full border-0 bg-transparent data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2 transition-all flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              {t('nav.favorites')}
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="rounded-full border-0 bg-transparent data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              {t('nav.orders')}
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="rounded-full border-0 bg-transparent data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2 transition-all flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {t('profile.payments')}
            </TabsTrigger>
            <TabsTrigger 
              value="addresses" 
              className="rounded-full border-0 bg-transparent data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2 transition-all flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              {t('profile.addresses')}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-full border-0 bg-transparent data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2 transition-all flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {t('nav.settings')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* About Me Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('profile.aboutMe')}</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  {t('profile.editData')}
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t('common.cancel')}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Banner & Profile Image Section */}
              <div className="relative -mx-6 -mt-6 mb-8">
                {/* Banner */}
                <div className="relative h-48 md:h-56 bg-muted overflow-hidden rounded-t-lg">
                  {localProfileBanner ? (
                    <img
                      src={localProfileBanner}
                      alt="Profile Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5" />
                  )}
                  
                  {/* Banner Edit Overlay */}
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-10 w-10 text-white" />
                      <span className="text-sm font-medium text-white mt-2">
                        {t('profile.changeBanner')}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => setLocalProfileBanner(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  )}
                  
                  {/* Delete Banner Button */}
                  {isEditing && localProfileBanner && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-4 right-4 z-10"
                      onClick={() => setLocalProfileBanner('')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('profile.removeBanner')}
                    </Button>
                  )}
                </div>

                {/* Profile Picture - Overlapping Banner */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                  <div className="relative inline-block group">
                    <div className={cn(
                      "w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden relative transition-all shadow-lg",
                      isEditing ? "cursor-pointer hover:border-primary/50" : ""
                    )}>
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <User className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Avatar Edit Overlay */}
                      {isEditing && (
                        <label 
                          htmlFor="avatar-upload" 
                          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                        >
                          <Camera className="h-8 w-8 text-white" />
                          <span className="text-xs font-medium text-white mt-1">
                            {t('profile.change')}
                          </span>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => setAvatar(reader.result as string)
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Delete Avatar Button */}
                    {isEditing && avatar && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute bottom-1 right-1 h-8 w-8 rounded-full shadow-md z-20"
                        onClick={() => setAvatar('')}
                        title={t('profile.removePhoto')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Spacer for overlapping avatar */}
              <div className="h-20 md:h-24" />

              {/* Bio Section - Bilingual */}
              <div className="w-full max-w-4xl mx-auto space-y-8 px-4">
                {/* Arabic Bio - Show if Editing OR (Not Editing AND Language is AR) */}
                {(isEditing || language === 'ar') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      <Label htmlFor="bioAr" className="text-base font-semibold text-foreground px-3">
                        {t('profile.bioInArabic')}
                      </Label>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    {isEditing ? (
                      <div className="relative">
                        <textarea
                          id="bioAr"
                          value={localBioAr}
                          maxLength={500}
                          onChange={(e) => setLocalBioAr(e.target.value)}
                          className="flex min-h-[140px] w-full rounded-2xl border-2 border-muted-foreground/20 bg-gradient-to-br from-muted/50 to-muted/30 px-5 py-4 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all hover:border-muted-foreground/30 text-right shadow-sm"
                          placeholder={t('profile.bioPlaceholderAr')}
                          dir="rtl"
                        />
                        <div className="flex justify-between items-center mt-2 px-2">
                          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                            {t('profile.visibleOnProfile')}
                          </span>
                          <span className={cn(
                            "text-xs font-mono px-2 py-0.5 rounded-full",
                            localBioAr.length >= 500 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                          )}>
                            {localBioAr.length}/500
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative mt-2">
                        {localBioAr ? (
                          <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl px-8 py-6 border border-primary/20 shadow-sm hover:shadow-md transition-shadow text-right backdrop-blur-sm" dir="rtl">
                            <div className="absolute top-3 right-3 w-12 h-12 bg-primary/5 rounded-full blur-2xl"></div>
                            <p className="text-base text-foreground leading-relaxed font-medium whitespace-pre-wrap break-words relative z-10">
                              {localBioAr}
                            </p>
                          </div>
                        ) : (
                          <div className="py-12 border-2 border-dashed border-muted/60 rounded-2xl bg-muted/30 hover:bg-muted/40 transition-colors">
                            <p className="text-muted-foreground text-sm italic text-center">
                              {t('profile.noArabicBio')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* English Bio - Show if Editing OR (Not Editing AND Language is EN) */}
                {(isEditing || language === 'en') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      <Label htmlFor="bioEn" className="text-base font-semibold text-foreground px-3">
                        {t('profile.bioInEnglish')}
                      </Label>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    {isEditing ? (
                      <div className="relative">
                        <textarea
                          id="bioEn"
                          value={localBioEn}
                          maxLength={500}
                          onChange={(e) => setLocalBioEn(e.target.value)}
                          className="flex min-h-[140px] w-full rounded-2xl border-2 border-muted-foreground/20 bg-gradient-to-br from-muted/50 to-muted/30 px-5 py-4 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all hover:border-muted-foreground/30 text-left shadow-sm"
                          placeholder="Write a brief and engaging bio about yourself in English... Tell others who you are and what you offer"
                          dir="ltr"
                        />
                        <div className="flex justify-between items-center mt-2 px-2">
                          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                            {t('profile.visibleOnProfile')}
                          </span>
                          <span className={cn(
                            "text-xs font-mono px-2 py-0.5 rounded-full",
                            localBioEn.length >= 500 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                          )}>
                            {localBioEn.length}/500
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative mt-2">
                        {localBioEn ? (
                          <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl px-8 py-6 border border-primary/20 shadow-sm hover:shadow-md transition-shadow text-left backdrop-blur-sm" dir="ltr">
                            <div className="absolute top-3 left-3 w-12 h-12 bg-primary/5 rounded-full blur-2xl"></div>
                            <p className="text-base text-foreground leading-relaxed font-medium whitespace-pre-wrap break-words relative z-10">
                              {localBioEn}
                            </p>
                          </div>
                        ) : (
                          <div className="py-12 border-2 border-dashed border-muted/60 rounded-2xl bg-muted/30 hover:bg-muted/40 transition-colors">
                            <p className="text-muted-foreground text-sm italic text-center">
                              {t('profile.noEnglishBio')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.name')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled={true} 
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('auth.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">{t('profile.age')}</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{t('profile.gender')}</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">{t('profile.selectGender')}</option>
                    <option value="male">{t('profile.male')}</option>
                    <option value="female">{t('profile.female')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t('profile.countryOfResidence')}</Label>
                  {isEditing ? (
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">{t('profile.selectCountry')}</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {t(`countries.${c.code}`)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                        id="country"
                        value={
                             country 
                                ? (COUNTRIES.find(c => c.name === country)?.code ? t(`countries.${COUNTRIES.find(c => c.name === country)?.code}`) : country)
                                : ''
                        }
                        disabled={true}
                    />
                  )}
                </div>
              </div>

              {/* Bio was here, now moved up */}

              {isEditing && (
                <Button onClick={handleUpdateProfile} className="w-full mt-4">
                  {t('common.save')}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>{t('favorites.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // Get favorites from response
                const favorites = productsResponse?.data || []
                const limitedFavorites = favorites.slice(0, 3) // Show only 3 most recent
                
                if (isFavoritesLoading) {
                    return <div className="text-center py-8">Loading...</div>
                }

                if (favorites.length === 0) {
                  return (
                    <div className="space-y-4">
                        <div className="text-center py-8 text-muted-foreground">
                        {t('profile.noFavoriteProducts')}
                        </div>
                         {/* Always show View All link even if empty, per request? Usually if empty no need, but request implies button missing. 
                            However, usually if empty we just show empty state. 
                            If the user specifically asked for "View All" because they couldn't see "all favorites" when there ARE favorites, I should focus on that. 
                            But I'll add the button just in case or keep it outside the empty check if list > 0. 
                            Actually, if 0, nothing to view. But wait, maybe API pagination missed some? 
                            Let's keep the button if length > 0.
                         */}
                    </div>
                  )
                }
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {limitedFavorites.map((product) => (
                        <Link key={product.id} to={`/product/${product.category?.slug || 'generic'}/${product.slug || 'product'}/${product.id}`} className="block">
                            <div className="border rounded-lg p-3 flex gap-3 hover:bg-muted/50 transition-colors">
                            <img 
                                src={product.images?.[0] || '/placeholder.png'} 
                                alt={product.name?.ar || product.name?.en || 'Product'}
                                className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-1">
                                {(product.name?.[language] || product.name?.en) || 'Product'}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                {(product.description?.[language] || product.description?.en) || ''}
                                </p>
                                <p className="font-bold text-primary mt-1">${(product.price || 0).toFixed(2)}</p>
                            </div>
                            </div>
                        </Link>
                      ))}
                    </div>
                    
                    <Link to={ROUTES.BUYER.FAVORITES} className="block w-full"> 
                      <Button variant="outline" className="w-full">
                        {t('profile.viewAllFavorites')} ({favorites.length})
                      </Button>
                    </Link>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const ordersData = JSON.parse(localStorage.getItem('noqta-orders') || '[]')
                // Handle both array and object formats
                let orders = Array.isArray(ordersData) ? ordersData : Object.values(ordersData || {})
                
                // Filter by User ID
                if (user) {
                    orders = orders.filter((o: Order) => o.userId === user.id)
                }
                
                // Sort by date descending (newest first)
                orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                
                const limitedOrders = orders.slice(0, 3) // Show only 3 most recent
                
                if (orders.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('orders.noOrders')}
                    </div>
                  )
                }
                
                return (
                  <div className="space-y-3">
                    {limitedOrders.map((order: Order) => (
                      <Link key={order.id} to={`${ROUTES.BUYER.ORDERS}?orderId=${order.id}`} className="block">
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">
                                {t('orders.orderNumber')}: {order.orderNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.items.length} {t('profile.items')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="mt-4">
                        <Link to={ROUTES.BUYER.ORDERS} className="block w-full">
                        <Button variant="outline" className="w-full">
                            {t('profile.viewAllOrders')} ({orders.length})
                            </Button>
                        </Link>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('profile.savedPaymentMethods')}</CardTitle>
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {t('profile.addPaymentMethod')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPaymentId 
                                ? t('profile.editPaymentMethod')
                                : t('profile.addNewPaymentMethod')
                            }
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label>{t('profile.paymentType')}</Label>
                             <select
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value as 'card' | 'wallet' | 'paypal')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                             >
                                <option value="card">{t('payment.creditCard')}</option>
                                <option value="wallet">{t('payment.digitalWallet')}</option>
                                <option value="paypal">PayPal</option>
                             </select>
                        </div>
                        
                        {paymentType === 'card' && (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>{t('payment.cardNumber')}</Label>
                                    <Input 
                                        value={newPayment.card.number} 
                                        onChange={(e) => setNewPayment({...newPayment, card: {...newPayment.card, number: e.target.value}})}
                                        placeholder="0000 0000 0000 0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('payment.cardholderName')}</Label>
                                    <Input 
                                        value={newPayment.card.name} 
                                        onChange={(e) => setNewPayment({...newPayment, card: {...newPayment.card, name: e.target.value}})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('payment.expiryDate')}</Label>
                                        <Input 
                                            value={newPayment.card.expiry} 
                                            onChange={(e) => setNewPayment({...newPayment, card: {...newPayment.card, expiry: e.target.value}})}
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CVC</Label>
                                        <Input 
                                            value={newPayment.card.cvc} 
                                            onChange={(e) => setNewPayment({...newPayment, card: {...newPayment.card, cvc: e.target.value}})}
                                            placeholder="123"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentType === 'wallet' && (
                            <div className="space-y-2">
                                <Label>{t('profile.walletNumber')}</Label>
                                <Input 
                                    value={newPayment.wallet.mobile} 
                                    onChange={(e) => setNewPayment({...newPayment, wallet: {...newPayment.wallet, mobile: e.target.value}})}
                                    placeholder="+20..."
                                />
                            </div>
                        )}

                        {paymentType === 'paypal' && (
                            <div className="space-y-2">
                                <Label>{t('profile.emailAddress')}</Label>
                                <Input 
                                    value={newPayment.paypal.email} 
                                    onChange={(e) => setNewPayment({...newPayment, paypal: {...newPayment.paypal, email: e.target.value}})}
                                    placeholder="email@example.com"
                                />
                            </div>
                        )}

                        <Button onClick={handleSavePayment} className="w-full mt-4">
                            {t('common.save')}
                        </Button>
                    </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {(() => {
                 const savedMethods = JSON.parse(localStorage.getItem(`noqta-saved-payments-${user?.id}`) || '[]')
                 const handleDelete = (id: number) => {
                    const updated = savedMethods.filter((m: PaymentMethod) => m.id !== id)
                    localStorage.setItem(`noqta-saved-payments-${user?.id}`, JSON.stringify(updated))
                    window.location.reload()
                 }

                 if (savedMethods.length === 0) {
                    return (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('profile.noSavedPaymentMethods')}
                        </div>
                    )
                 }

                 return (
                    <div className="space-y-4">
                        {savedMethods.map((method: PaymentMethod) => (
                            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    {method.type === 'card' && <CreditCard className="h-6 w-6 text-primary" />}
                                    {method.type === 'wallet' && <Wallet className="h-6 w-6 text-primary" />}
                                    {method.type === 'paypal' && <ShoppingBag className="h-6 w-6 text-primary" />}

                                    <div>
                                        <p className="font-semibold">
                                            {method.type === 'card' ? t('payment.creditCard') :
                                             method.type === 'wallet' ? t('payment.digitalWallet') : 'PayPal'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {method.type === 'card' ? `**** ${method.details.number?.slice(-4) || '****'}` :
                                             method.type === 'wallet' ? method.details.mobile || '' :
                                             method.details.email || ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditPayment(method)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(method.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('profile.savedAddresses')}</CardTitle>
              
              <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {t('profile.addAddress')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddressId 
                                ? t('profile.editAddress')
                                : t('profile.addNewAddress')
                            }
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('profile.addressName')}</Label>
                            <Input 
                                value={newAddress.name} 
                                onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                                placeholder={t('profile.home')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('profile.streetAddress')}</Label>
                            <Input 
                                value={newAddress.street} 
                                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('profile.city')}</Label>
                                <Input 
                                    value={newAddress.city} 
                                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('profile.stateRegion')}</Label>
                                <Input 
                                    value={newAddress.state} 
                                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('profile.postalCode')}</Label>
                                <Input 
                                    value={newAddress.postalCode} 
                                    onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>{t('profile.country')}</Label>
                            <select
                              value={newAddress.country}
                              onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">{t('profile.selectCountry')}</option>
                              {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.name}>
                                  {t(`countries.${c.code}`)}
                                </option>
                              ))}
                            </select>
                        </div>
                         <div className="space-y-2">
                            <Label>{t('profile.phone')}</Label>
                            <Input 
                                value={newAddress.phone} 
                                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            />
                        </div>
                        <Button onClick={handleSaveAddress} className="w-full">
                            {t('common.save')}
                        </Button>
                    </div>
                </DialogContent>
              </Dialog>

            </CardHeader>
            <CardContent>
              {(() => {
                 const savedAddresses = JSON.parse(localStorage.getItem(`noqta-saved-addresses-${user?.id}`) || '[]')
                 const handleDelete = (id: number) => {
                    const updated = savedAddresses.filter((a: Address & { id: number }) => a.id !== id)
                    localStorage.setItem(`noqta-saved-addresses-${user?.id}`, JSON.stringify(updated))
                    window.location.reload()
                 }

                 if (savedAddresses.length === 0) {
                    return (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('profile.noSavedAddresses')}
                        </div>
                    )
                 }

                 return (
                    <div className="space-y-4">
                        {savedAddresses.map((address: Address & { id: number }) => (
                            <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-semibold">{address.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {address.street}, {address.city}, {address.country}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{address.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditAddress(address)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(address.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.accountSettings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    {t('profile.accountType')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('profile.currentAccount')}: {user.role === 'buyer' ? t('profile.buyer') : user.role === 'seller' ? t('profile.seller') : t('profile.admin')}
                  </p>
                  
                  {/* Admin Role Switcher (Visible if current role is admin OR original role was admin) */}
                  {(user.role === 'admin' || originalRole === 'admin') ? (
                    <div className="grid grid-cols-1 gap-2">
                        {user.role !== 'admin' && (
                            <Button variant="outline" onClick={() => switchRole('admin')} className="justify-start">
                                <User className="h-4 w-4 mr-2" />
                                {t('profile.returnToAdmin')}
                            </Button>
                        )}
                        {user.role !== 'buyer' && (
                            <Button variant="outline" onClick={() => switchRole('buyer')} className="justify-start">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                {t('profile.viewAsBuyer')}
                            </Button>
                        )}
                        {user.role !== 'seller' && (
                            <Button variant="outline" onClick={() => switchRole('seller')} className="justify-start">
                                <Store className="h-4 w-4 mr-2" />
                                {t('profile.viewAsSeller')}
                            </Button>
                        )}
                    </div>
                  ) : (
                    /* Regular Toggle for non-admins */
                    user.role === 'buyer' ? (
                        <Button
                        variant="outline"
                        onClick={handleSwitchToSeller}
                        className="w-full"
                        >
                        <Store className="h-4 w-4 mr-2" />
                        {t('profile.switchToSeller')}
                        </Button>
                    ) : (
                        <Button
                        variant="outline"
                        onClick={handleSwitchToBuyer}
                        className="w-full"
                        >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {t('profile.switchToBuyer')}
                        </Button>
                    )
                  )}
                </div>

                <div className="pt-4 border-t">
                    <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('profile.logOut')}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

