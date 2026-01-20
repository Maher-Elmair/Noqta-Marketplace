/**
 * Header component
 */

import { Link } from "react-router-dom";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { ROUTES } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { useRTL } from "@/hooks/use-rtl";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { i18n } = useI18nTranslation();
  const t = useTranslation();
  const isRTL = useRTL();
  const cartCount = getItemCount();

  const toggleLanguage = () => {
    const newLang = isRTL ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">
              {t("common.appName")}
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {(!isAuthenticated || user?.role === "buyer") && (
              <>
                <Link
                  to={ROUTES.HOME}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {t("nav.home")}
                </Link>
                <Link
                  to="/vendors"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {t("nav.vendors")}
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                {user?.role === "buyer" && (
                  <>
                    <Link
                      to={ROUTES.BUYER.SEARCH}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t("nav.search")}
                    </Link>
                    <Link
                      to={`${ROUTES.CATEGORY}/all`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t("nav.categories")}
                    </Link>
                    <Link
                      to={ROUTES.BUYER.FAVORITES}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t("nav.favorites")}
                    </Link>
                    <Link
                      to={ROUTES.BUYER.ORDERS}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t("orders.title")}
                    </Link>
                  </>
                )}
                {user?.role === "seller" && (
                  <Link
                    to={ROUTES.SELLER.DASHBOARD}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {t("seller.dashboard")}
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to={ROUTES.ADMIN.DASHBOARD}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {t("admin.dashboard")}
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.BUYER.SEARCH}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {t("nav.search")}
                </Link>
                <Link
                  to={`${ROUTES.CATEGORY}/all`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {t("nav.categories")}
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              aria-label={t("language.toggle")}
              title={t("language.toggle")}
            >
              {isRTL ? t("language.en") : t("language.ar")}
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart - Only show for buyers */}
            {isAuthenticated && user?.role === "buyer" && (
              <Link to={ROUTES.BUYER.CART}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={
                    user?.role === "buyer"
                      ? ROUTES.BUYER.PROFILE
                      : user?.role === "seller"
                      ? ROUTES.SELLER.PROFILE
                      : ROUTES.ADMIN.PROFILE
                  }
                >
                  <Button variant="ghost" size="icon" title={t("nav.profile")}>
                    <User />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">{t("nav.login")}</Button>
                </Link>
                <Link to="/register">
                  <Button>{t("nav.register")}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
