/**
 * Product Variants Selector Component
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { ProductVariant } from '@/types'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface ProductVariantsProps {
  variants?: ProductVariant[]
  onSelectionChange?: (selections: Record<string, string>) => void
}

export function ProductVariants({
  variants,
  onSelectionChange,
}: ProductVariantsProps) {
  const { i18n } = useI18nTranslation()
  const t = useTranslation()
  const [selections, setSelections] = useState<Record<string, string>>({})
  const language = i18n.language as 'ar' | 'en'

  if (!variants || variants.length === 0) {
    return null
  }

  // Group variants by type
  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.type]) {
      acc[variant.type] = []
    }
    acc[variant.type].push(variant)
    return acc
  }, {} as Record<string, ProductVariant[]>)

  const handleSelection = (type: string, value: string) => {
    const newSelections = { ...selections, [type]: value }
    setSelections(newSelections)
    onSelectionChange?.(newSelections)
  }

  const getVariantTypeLabel = (type: string) => {
    const translationKeys: Record<string, string> = {
      color: 'variants.color',
      size: 'variants.size',
      material: 'variants.material',
      other: 'variants.other',
    }
    return translationKeys[type] ? t(translationKeys[type]) : type
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('variants.options')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedVariants).map(([type, typeVariants]) => (
          <div key={type} className="space-y-3">
            <Label className="text-base font-semibold">
              {getVariantTypeLabel(type)}:
            </Label>
            <div className="flex flex-wrap gap-2">
              {typeVariants.map((variant) => {
                const isSelected = selections[type] === variant.value
                const displayName =
                  language === 'ar' ? variant.name.ar : variant.name.en

                // Special styling for color variants
                if (type === 'color') {
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleSelection(type, variant.value)}
                      className={cn(
                        'w-12 h-12 rounded-full border-2 transition-all',
                        isSelected
                          ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110'
                          : 'border-muted hover:border-primary/50'
                      )}
                      style={{ backgroundColor: variant.value }}
                      title={displayName}
                    />
                  )
                }

                return (
                  <Button
                    key={variant.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSelection(type, variant.value)}
                    className={cn(
                      isSelected && 'ring-2 ring-primary ring-offset-2'
                    )}
                  >
                    {displayName}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

