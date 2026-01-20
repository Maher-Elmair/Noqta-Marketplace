/**
 * Admin-specific layout
 */

import type { ReactNode } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}

