/**
 * Auth-specific layout (login/register)
 */

import type { ReactNode } from "react";
import { useRTL } from "@/hooks/use-rtl";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const isRTL = useRTL();

  return (
    <div
      className="min-h-screen flex flex-col bg-muted/30"
      dir={isRTL ? "rtl" : "ltr"}
    >

      <main className="flex-1">{children}</main>
    </div>
  );
}
