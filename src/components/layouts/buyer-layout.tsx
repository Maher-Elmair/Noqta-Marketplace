/**
 * Buyer-specific layout
 */

import type { ReactNode } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'

interface BuyerLayoutProps {
  children: ReactNode
}

export function BuyerLayout({ children }: BuyerLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}

