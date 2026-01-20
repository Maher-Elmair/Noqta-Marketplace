/**
 * Seller-specific layout
 */

import type { ReactNode } from 'react'
import { MainLayout } from '@/components/layouts//main-layout'

interface SellerLayoutProps {
  children: ReactNode
}

export function SellerLayout({ children }: SellerLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}

