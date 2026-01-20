/**
 * Seller Products Management Page
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Store, List, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { useRTL } from '@/hooks/use-rtl'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/components/ui/use-toast'
import * as useProductsHooks from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { LoadingState } from '@/components/states/loading-state'
import { EmptyState } from '@/components/states/empty-state'
import { ImageUpload } from '@/components/common/image-upload'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'
import { Loader } from '../../components/ui/loader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pagination } from '@/components/common/pagination'

import { CurrencySelect } from '@/components/common/currency-select'
import { BackButton } from '@/components/common/back-button'
import type { Product, ProductVariant } from '@/types'

export function SellerProductsPage() {
  const t = useTranslation()
  const { i18n } = useI18nTranslation()
  const language = i18n.language as 'ar' | 'en'
  const isRTL = useRTL()
  const { user } = useAuthStore()
  const { toast } = useToast()
  // Fetching a large number to handle client-side filtering and pagination effectively
  // In a real app with large data, this should be server-side filtering/pagination
  const { data: productsResponse, isLoading } = useProductsHooks.useProducts(1, 1000)
  const { data: categories } = useCategories()
  
  // State for Filters & View
  const [viewMode, setViewMode] = useState<'grid' | 'store'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Helper to calculate pricing (handles both new and legacy models)
  const calculatePricing = (product: Product) => {
    let basePrice = product.price;
    let discountPercentage = 0;
    let salePrice = product.price;
    let isDiscounted = false;

    // Check for standard price/compareAtPrice model first (most reliable)
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
        basePrice = product.compareAtPrice;
        salePrice = product.price;
        discountPercentage = Math.round(((basePrice - salePrice) / basePrice) * 100);
        isDiscounted = true;
    } 
    // Fallback: Check if discount exists but compareAt was missing (migration case)
    else if (product.discount && product.discount > 0) {
        // In this specific legacy migration case, we treat 'price' as base
         basePrice = product.price;
         discountPercentage = product.discount;
         salePrice = product.price - (product.price * (product.discount / 100));
         isDiscounted = true;
    }

    return {
        basePrice, // The original/high price
        salePrice, // The actual selling price
        discountPercentage,
        isDiscounted,
        currency: product.currency || 'USD'
    };
  }

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterCategory, filterStatus])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form State
  const [productImages, setProductImages] = useState<string[]>([])
  const [productNameAr, setProductNameAr] = useState('')
  const [productNameEn, setProductNameEn] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productDiscount, setProductDiscount] = useState('')
  const [productCurrency, setProductCurrency] = useState('USD')
  const [productStock, setProductStock] = useState('')
  const [productCategoryId, setProductCategoryId] = useState('')
  // Removed unused 'newCategoryName' state

  const [productColors, setProductColors] = useState<Array<{ name: { ar: string; en: string }; value: string; stock: number }>>([])
  const [productSizes, setProductSizes] = useState<Array<{ name: { ar: string; en: string }; value: string; stock: number }>>([])

  // Auto-calculate stock based on variants

  useEffect(() => {
    const colorStock = productColors.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
    const sizeStock = productSizes.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
    
    // If we have variants with stock, update the main product stock to reflect sum
    // Logic: If user is adding variants, the total stock should probably match.
    // However, sometimes variants are independent (e.g. Color Red, Size L is one separate SKU).
    // The current implementation treats Color and Size as independent lists (not a matrix).
    // Assuming additive logic as per user request to "solve the issue".
    const totalVariantStock = colorStock + sizeStock
    if (totalVariantStock > 0) {
        setProductStock(totalVariantStock.toString())
    }
  }, [productColors, productSizes])
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  type ConfirmationDialogAction = 'add' | 'edit' | 'delete' | 'deleteAll' | 'toggleVisibility'
  const [confirmAction, setConfirmAction] = useState<ConfirmationDialogAction>('add')
  const [productToActOn, setProductToActOn] = useState<Product | null>(null)


  const { mutate: createProduct, isPending: isCreating } = useProductsHooks.useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useProductsHooks.useUpdateProduct()
  const { mutate: deleteProduct, isPending: isDeleting } = useProductsHooks.useDeleteProduct()

  // Filter products by seller and local filters
  const sellerProducts = productsResponse?.data?.filter(
    (product) => product.sellerId === user?.id
  ) || []

  const filteredProducts = sellerProducts.filter((product) => {
    const name = product.name[language] || product.name.en
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? product.isActive : !product.isActive)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    
    // Use helper to migrate legacy data to form format
    const pricing = calculatePricing(product);

    setProductImages(product.images || [])
    setProductNameAr(product.name.ar)
    setProductNameEn(product.name.en)
    setProductPrice(pricing.basePrice.toString())
    setProductDiscount(pricing.discountPercentage > 0 ? pricing.discountPercentage.toString() : '')
    setProductCurrency(pricing.currency)
    setProductStock(product.stock.toString())
    setProductCategoryId(product.categoryId)
    
    const colors = product.variants?.filter(v => v.type === 'color').map(v => ({
      name: v.name,
      value: v.value,
      stock: product.stock,
    })) || []
    const sizes = product.variants?.filter(v => v.type === 'size').map(v => ({
      name: v.name,
      value: v.value,
      stock: product.stock,
    })) || []
    setProductColors(colors)
    setProductSizes(sizes)
    
    setIsDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setProductToActOn(product)
    setConfirmAction('delete')
    setShowConfirmDialog(true)
  }

  const handleDeleteAll = () => {
    setConfirmAction('deleteAll')
    setShowConfirmDialog(true)
  }

  const handleToggleVisibility = (product: Product) => {
    setProductToActOn(product)
    setConfirmAction('toggleVisibility')
    setShowConfirmDialog(true)
  }

  const confirmDelete = () => {
    if (productToActOn) {
      deleteProduct(productToActOn.id, {
        onSuccess: () => {
          toast({
            title: t('common.success'),
            description: t('seller.productDeleted'),
          })
          setShowConfirmDialog(false)
          setProductToActOn(null)
        }
      })
    }
  }

  const confirmDeleteAll = () => {
    toast({
        title: t('common.success'),
        description: t('seller.allProductsDeleted'),
    })
    setShowConfirmDialog(false)
  }

  const confirmToggleVisibility = () => {
    if (productToActOn) {
        updateProduct({ id: productToActOn.id, data: { isActive: !productToActOn.isActive } }, {
            onSuccess: () => {
                toast({
                    title: t('common.success'),
                    description: t('seller.productStatusUpdated'),
                })
                setShowConfirmDialog(false)
                setProductToActOn(null)
            }
        })
    }
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setProductImages([])
    setProductNameAr('')
    setProductNameEn('')
    setProductPrice('')
    setProductDiscount('')
    setProductCurrency('USD')
    setProductStock('')
    setProductCategoryId('')
    setProductColors([])
    setProductSizes([])
    setIsDialogOpen(true)
  }

  const addColor = () => {
    setProductColors([
      ...productColors,
      { name: { ar: '', en: '' }, value: '#000000', stock: 0 },
    ])
  }

  const removeColor = (index: number) => {
    setProductColors(productColors.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, field: string, value: string | number) => {
    const updated = [...productColors]
    if (field === 'value' || field === 'stock') {
      updated[index] = { ...updated[index], [field]: value }
    } else if (field === 'nameAr' || field === 'nameEn') {
      updated[index] = {
        ...updated[index],
        name: {
          ...updated[index].name,
          [field === 'nameAr' ? 'ar' : 'en']: value as string,
        },
      }
    }
    setProductColors(updated)
  }

  const addSize = () => {
    setProductSizes([
      ...productSizes,
      { name: { ar: '', en: '' }, value: '', stock: 0 },
    ])
  }

  const removeSize = (index: number) => {
    setProductSizes(productSizes.filter((_, i) => i !== index))
  }

  const updateSize = (index: number, field: string, value: string | number) => {
    const updated = [...productSizes]
    if (field === 'value' || field === 'stock') {
      updated[index] = { ...updated[index], [field]: value }
    } else if (field === 'nameAr' || field === 'nameEn') {
      updated[index] = {
        ...updated[index],
        name: {
          ...updated[index].name,
          [field === 'nameAr' ? 'ar' : 'en']: value as string,
        },
      }
    }
    setProductSizes(updated)
  }

  const handleSaveProduct = () => {
    // Basic Validation
    if (!productNameAr.trim() || !productNameEn.trim()) return

    setConfirmAction(editingProduct ? 'edit' : 'add')
    setShowConfirmDialog(true)
  }

  const confirmSave = () => {
    const variants: ProductVariant[] = [
      ...productColors.map((color, index) => ({
        id: `color-${index}`,
        name: color.name,
        value: color.value,
        type: 'color' as const,
      })),
      ...productSizes.map((size, index) => ({
        id: `size-${index}`,
        name: size.name,
        value: size.value,
        type: 'size' as const,
      })),
    ]

    // Calculate Pricing Logic
    const basePrice = parseFloat(productPrice);
    const discountPct = parseFloat(productDiscount) || 0;
    
    let finalPrice = basePrice;
    let compareAt = undefined;

    if (discountPct > 0) {
        finalPrice = basePrice - (basePrice * (discountPct / 100));
        compareAt = basePrice;
    }

    const productData = {
      name: { ar: productNameAr, en: productNameEn },
      description: { ar: '', en: '' },
      price: finalPrice, // The actual selling price
      compareAtPrice: compareAt, // The original price (if discounted)
      discount: discountPct, // Stored for UI convenience
      currency: productCurrency,
      stock: parseInt(productStock),
      images: productImages,
      categoryId: productCategoryId, // If new category implemented, logic goes here
      variants,
      sellerId: user?.id,
      isActive: editingProduct ? editingProduct.isActive : true, // Default active
      rating: editingProduct ? editingProduct.rating : 1, // Default 1 star for new
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
    }
    
    if (editingProduct) {
      updateProduct({ id: editingProduct.id, data: productData }, {
          onSuccess: () => {
            setIsDialogOpen(false)
            setShowConfirmDialog(false)
            toast({ title: t('common.success'), description: 'Saved' })
          }
      })
    } else {
      createProduct(productData, {
          onSuccess: () => {
            setIsDialogOpen(false)
            setShowConfirmDialog(false)
            toast({ title: t('common.success'), description: 'Created' })
          }
      })
    }
  }

  const handleConfirm = () => {
    switch (confirmAction) {
        case 'delete': confirmDelete(); break;
        case 'deleteAll': confirmDeleteAll(); break;
        case 'toggleVisibility': confirmToggleVisibility(); break;
        default: confirmSave(); break;
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold">
            {t('seller.productsManagement')}
            </h1>
            <p className="text-muted-foreground mt-1">
                {t('seller.totalProducts')}: {sellerProducts.length}
            </p>
        </div>
        <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDeleteAll} disabled={sellerProducts.length === 0}>
                {t('seller.deleteAll')}
            </Button>
            <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t('seller.addNewProduct')}
            </Button>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-muted/10 p-4 rounded-lg border mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 md:justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('seller.searchProductsPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
            
            <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
            >
                <option value="all">{t('seller.allCategories')}</option>
                {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name[language] || c.name.en}</option>
                ))}
            </select>

            <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            >
                <option value="all">{t('seller.allStatus')}</option>
                <option value="active">{t('seller.active')}</option>
                <option value="inactive">{t('seller.inactive')}</option>
            </select>
        </div>

        <div className="flex items-center gap-2 border-l pl-4">
            <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                title={t('seller.listView')}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === 'store' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('store')}
                title={t('seller.storeView')}
            >
                <Store className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Products Grid / Store View */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title={t('seller.noProducts')}
          description={t('seller.noProductsDescription')}
        />
      ) : viewMode === 'store' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <Card key={product.id} className="relative group overflow-hidden">
                {/* Image Section */}
                <div className="aspect-square w-full rounded-t-lg overflow-hidden bg-muted relative">
                    {product.images?.[0] ? (
                        <img 
                            src={product.images[0]} 
                            alt={product.name[language] || product.name.en} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                            <ImageOff className="h-10 w-10 mb-2 opacity-50" />
                            <span className="text-xs">{t('seller.noImage')}</span>
                        </div>
                    )}

                    {/* Discount Badge on Image - Enhanced Visibility */}
                    {(() => {
                        const pricing = calculatePricing(product);
                        return pricing.isDiscounted ? (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-50 shadow-md">
                                {pricing.discountPercentage}% {t('seller.discount')}
                            </div>
                        ) : null;
                    })()}
                    
                    {/* Store View - Overlay Actions */}
                     <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold truncate pr-2">
                                {product.name[language] || product.name.en}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {categories?.find(c => c.id === product.categoryId)?.name[language] || categories?.find(c => c.id === product.categoryId)?.name.en}
                            </p>
                        </div>
                    </div>

                     <div className="flex items-center justify-between mt-2">
                         <div className="font-bold text-lg flex flex-col items-start leading-tight">
                            {(() => {
                                const pricing = calculatePricing(product);
                                return pricing.isDiscounted ? (
                                    <>
                                        <span className="text-red-600">
                                            {pricing.salePrice.toFixed(2)} 
                                            <span className="text-xs font-normal text-muted-foreground ml-1">{pricing.currency}</span>
                                        </span>
                                        <span className="text-sm font-normal text-muted-foreground line-through decoration-red-500/50">
                                            {pricing.basePrice} {pricing.currency}
                                        </span>
                                    </>
                                ) : (
                                    <span>
                                        {pricing.basePrice} <span className="text-xs font-normal text-muted-foreground">{pricing.currency}</span>
                                    </span>
                                );
                            })()}
                         </div>
                         <div className="text-sm">
                            {t('products.stock')}: <span className={product.stock < 10 ? "text-red-500 font-bold" : ""}>{product.stock}</span>
                         </div>
                    </div>
                </div>
                 
                 {/* Store View - Footer Actions */}
                 <div className="p-4 pt-0 flex gap-2">
                     <Button 
                        variant={product.isActive ? "outline" : "secondary"} 
                        className={cn("w-full h-8 text-xs", product.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                        onClick={() => handleToggleVisibility(product)}
                    >
                        {product.isActive ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        {product.isActive ? t('seller.publishedVisible') : t('seller.draftHidden')}
                     </Button>
                 </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>#</TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.image')}</TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.name')}</TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.category')}</TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.price')}</TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.discount')}</TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.stock')}</TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('seller.status')}</TableHead>
                <TableHead className="text-right">{t('seller.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProducts.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                        {product.images?.[0] ? (
                            <img 
                                src={product.images[0]} 
                                alt={product.name[language] || product.name.en} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageOff className="h-4 w-4 text-muted-foreground opacity-50" />
                            </div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name[language] || product.name.en}
                  </TableCell>
                  <TableCell>
                    {categories?.find(c => c.id === product.categoryId)?.name[language] || categories?.find(c => c.id === product.categoryId)?.name.en}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        {(() => {
                            const pricing = calculatePricing(product);
                            return pricing.isDiscounted ? (
                                <>
                                    <span className="font-bold text-red-600 flex items-center gap-1">
                                        {pricing.salePrice.toFixed(2)} {pricing.currency}
                                    </span>
                                    <span className="text-xs text-muted-foreground line-through">
                                        {pricing.basePrice} {pricing.currency}
                                    </span>
                                </>
                            ) : (
                                <span>{pricing.basePrice} {pricing.currency}</span>
                            );
                        })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                        const pricing = calculatePricing(product);
                        return pricing.isDiscounted ? (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                               {pricing.discountPercentage}%
                            </div>
                        ) : (
                            <span className="text-muted-foreground">-</span>
                        );
                    })()}
                  </TableCell>
                  <TableCell>
                     <span className={product.stock < 10 ? "text-red-500 font-bold" : ""}>{product.stock}</span>
                  </TableCell>
                  <TableCell>
                    <div 
                        className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer select-none",
                            product.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        )}
                        onClick={() => handleToggleVisibility(product)}
                    >
                        {product.isActive ? t('seller.active') : t('seller.inactive')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredProducts.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct
                ? t('seller.editProduct')
                : t('seller.addNewProductTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Product Images */}
            <div className="space-y-2">
              <Label>{t('seller.productImages')}</Label>
              <ImageUpload
                images={productImages}
                onImagesChange={setProductImages}
                maxImages={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-ar">{t('seller.nameArabic')}</Label>
                <Input id="name-ar" value={productNameAr} onChange={(e) => setProductNameAr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-en">{t('seller.nameEnglish')}</Label>
                <Input id="name-en" value={productNameEn} onChange={(e) => setProductNameEn(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('products.price')}</Label>
                  <div className="flex gap-2">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="flex-1"
                      />
                      <CurrencySelect value={productCurrency} onChange={setProductCurrency} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">{t('seller.discountPercent')}</Label>
                    <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={productDiscount}
                        onChange={(e) => setProductDiscount(e.target.value)}
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Category and Stock grouped side-by-side */}
            <div className="grid grid-cols-2 gap-4">
                 {/* Category Selector */}
                <div className="space-y-2">
                    <Label htmlFor="category">{t('seller.category')}</Label>
                    <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                        <SelectTrigger>
                        <SelectValue placeholder={t('seller.selectCategory')} />
                        </SelectTrigger>
                        <SelectContent>
                        {categories?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name[language] || c.name.en}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">{t('products.stock')}</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                  />
                </div>
            </div>

            {/* Category Selector with Custom Input */}


            {/* Colors & Sizes Sections */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>{t('seller.colors')}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addColor}><Plus className="h-4 w-4 mr-1" />{t('seller.add')}</Button>
                </div>
                {productColors.map((color, index) => (
                    <div key={index} className="flex gap-2 mb-2"><input type="color" value={color.value} onChange={(e) => updateColor(index, 'value', e.target.value)} className="w-8 h-8 rounded shrink-0" /><Input value={color.name.ar} onChange={(e) => updateColor(index, 'nameAr', e.target.value)} placeholder="Ar" /><Input value={color.name.en} onChange={(e) => updateColor(index, 'nameEn', e.target.value)} placeholder="En" /><Input type="number" value={color.stock} onChange={(e) => updateColor(index, 'stock', e.target.value)} placeholder="Stock" className="w-20" /><Button type="button" variant="ghost" size="icon" onClick={() => removeColor(index)}><Trash2 className="h-4 w-4" /></Button></div>
                ))}
            </div>
            
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>{t('seller.sizes')}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSize}><Plus className="h-4 w-4 mr-1" />{t('seller.add')}</Button>
                </div>
                {productSizes.map((size, index) => (
                    <div key={index} className="flex gap-2 mb-2"><Input value={size.value} onChange={(e) => updateSize(index, 'value', e.target.value)} placeholder="Value" className="w-20" /><Input value={size.name.ar} onChange={(e) => updateSize(index, 'nameAr', e.target.value)} placeholder="Ar" /><Input value={size.name.en} onChange={(e) => updateSize(index, 'nameEn', e.target.value)} placeholder="En" /><Input type="number" value={size.stock} onChange={(e) => updateSize(index, 'stock', e.target.value)} placeholder="Stock" className="w-20" /><Button type="button" variant="ghost" size="icon" onClick={() => removeSize(index)}><Trash2 className="h-4 w-4" /></Button></div>
                ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">{t('common.cancel')}</Button>
              <Button onClick={handleSaveProduct} className="flex-1" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                    <>
                     <Loader size="sm" className="mr-2" />
                     {t('seller.saving')}
                   </>
                ) : (editingProduct ? t('seller.save') : t('seller.addButton'))}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirm}
        title={
            confirmAction === 'delete' ? t('seller.confirmDelete') :
            confirmAction === 'deleteAll' ? t('seller.confirmDeleteAll') :
            confirmAction === 'toggleVisibility' ? t('seller.changeStatus') :
            t('seller.confirmAction')
        }
        description={
            confirmAction === 'delete' ? t('seller.confirmDeleteDescription') :
            confirmAction === 'deleteAll' ? t('seller.confirmDeleteAllDescription') :
            confirmAction === 'toggleVisibility' ? t('seller.confirmToggleVisibilityDescription') :
            t('seller.confirmActionDescription')
        }
        isLoading={isCreating || isUpdating || isDeleting}
        variant={confirmAction.includes('delete') ? 'destructive' : 'default'}
      />
    </div>
  )
}
