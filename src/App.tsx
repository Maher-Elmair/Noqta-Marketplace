/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactQueryProvider } from "@/lib/react-query";
import { MainLayout } from "@/components/layouts/main-layout";
import { BuyerLayout } from "@/components/layouts/buyer-layout";
import { SellerLayout } from "@/components/layouts/seller-layout";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useEffect } from "react";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import { ScrollToTopButton } from "@/components/common/scroll-to-top-button";

// Pages
import { HomePage } from "@/pages/home";
import { BuyerSearchPage } from "@/pages/buyer/search";
import { BuyerCartPage } from "@/pages/buyer/cart";
import { ProductDetailPage } from "@/pages/product-detail";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { SellerDashboardPage } from "@/pages/seller/dashboard";
import { SellerProductsPage } from "@/pages/seller/products";
import { SellerOrdersPage } from "@/pages/seller/orders";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminUsersPage } from "@/pages/admin/users";
import { BuyerFavoritesPage } from "@/pages/buyer/favorites";
import { BuyerProfilePage } from "@/pages/buyer/profile";
import { BuyerCheckoutPage } from "@/pages/buyer/checkout";
import { BuyerOrdersPage } from "@/pages/buyer/orders";
import { CategoriesPage } from "@/pages/categories";

import { NotFoundPage } from "@/pages/not-found";
import { VendorsPage } from "@/pages/vendors";
import { VendorProfilePage } from "@/pages/vendors/profile";

// Protected Route Component
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { theme } = useUIStore();
  const { t } = useI18nTranslation();

  useEffect(() => {
    // Apply theme
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      // Update page title based on language
      document.title = t('common.appName');

      // Update favicon based on theme
      const favicon = document.querySelector("link[rel*='icon']");
      if (favicon) {
        favicon.setAttribute(
          "href",
          theme === "dark" 
            ? "/assets/icons/dot-black.svg"
            : "/assets/icons/dot-white.svg" 
        );
      }
    }
  }, [theme, t]);

  return (
    <ReactQueryProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ScrollToTopButton />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/product/:category/:slug/:id"
            element={
              <MainLayout>
                <ProductDetailPage />
              </MainLayout>
            }
          />
          <Route
            path="/product/:slug/:id"
            element={
              <MainLayout>
                <ProductDetailPage />
              </MainLayout>
            }
          />
          <Route
            path="/category/:slug"
            element={
              <MainLayout>
                <CategoriesPage />
              </MainLayout>
            }
          />
          <Route
            path="/vendors"
            element={
              <MainLayout>
                <VendorsPage />
              </MainLayout>
            }
          />
          <Route
            path="/store/:slug"
            element={
              <MainLayout>
                <VendorProfilePage />
              </MainLayout>
            }
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            }
          />

          {/* Buyer Routes */}
          <Route
            path="/buyer/search"
            element={
              <MainLayout>
                <BuyerSearchPage />
              </MainLayout>
            }
          />
          <Route
            path="/buyer/cart"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerLayout>
                  <BuyerCartPage />
                </BuyerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/favorites"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerLayout>
                  <BuyerFavoritesPage />
                </BuyerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/profile"
            element={
              <ProtectedRoute>
                <BuyerLayout>
                  <BuyerProfilePage />
                </BuyerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/checkout"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerLayout>
                  <BuyerCheckoutPage />
                </BuyerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerLayout>
                  <BuyerOrdersPage />
                </BuyerLayout>
              </ProtectedRoute>
            }
          />

          {/* Seller Routes */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerLayout>
                  <SellerDashboardPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerLayout>
                  <SellerProductsPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerLayout>
                  <SellerOrdersPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/profile"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerLayout>
                  <BuyerProfilePage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <BuyerProfilePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ReactQueryProvider>
  );
}

export default App;
