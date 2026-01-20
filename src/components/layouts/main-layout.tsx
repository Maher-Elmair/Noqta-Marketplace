/**
 * Main layout component with header, navigation, and footer
 */

import type { ReactNode } from "react";
import { useRTL } from "@/hooks/use-rtl";
import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts//footer";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isRTL = useRTL();

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
