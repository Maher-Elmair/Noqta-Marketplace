/**
 * Product detail page
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/use-products";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useUserFavorites } from "@/hooks/use-user-favorites";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/use-toast";
import { Recommendations } from "@/components/common/recommendations";
import { ImageGallery } from "@/components/common/image-gallery";
import { ProductVariants } from "@/components/common/product-variants";
import { BackButton } from "@/components/common/back-button";

export function ProductDetailPage() {
  const { id, slug } = useParams<{
    id?: string;
    slug?: string;
  }>();
  // Use ID if available, otherwise fall back to slug for legacy routes
  const productId = id || slug || "";
  const { data: productResponse, isLoading, error } = useProduct(productId);
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useUserFavorites();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const t = useTranslation();
  const { i18n } = useI18nTranslation();
  const language = i18n.language as "ar" | "en";
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState count={1} />
      </div>
    );
  }

  if (error || !productResponse?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          title={t("errors.productNotFound")}
          message={t("errors.productNotFoundDescription")}
        />
      </div>
    );
  }

  const product = productResponse.data;
  const favorite = isFavorite(product.id);
  const displayName = language === "ar" ? product.name.ar : product.name.en;
  const displayDescription =
    language === "ar" ? product.description.ar : product.description.en;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: t("cart.loginRequired"),
        description: t("cart.loginRequiredDescription"),
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (product.sellerId) {
      // selectedVariants will be used in future cart implementation
      console.log("Selected variants:", selectedVariants);
      addItem(product, product.sellerId, 1);
      toast({
        title: t("cart.addedToCart"),
        description: t("cart.addedToCartDescription"),
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <BackButton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images Gallery */}
        <div>
          <ImageGallery
            images={
              product.images.length > 0
                ? product.images
                : ["/placeholder-product.jpg"]
            }
            productName={displayName}
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{displayName}</h1>

          {product.seller && (
            <p className="text-muted-foreground mb-4">
              {t("products.seller")}:{" "}
              {product.seller.storeName[language] || product.seller.storeName.en}
            </p>
          )}

          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({product.reviewCount || 0} {t("products.reviews")})
              </span>
            </div>
          )}

          <div className="mb-6">
            {product.compareAtPrice && (
              <p className="text-muted-foreground line-through mb-2 text-lg">
                ${product.compareAtPrice.toFixed(2)}
              </p>
            )}
            <p className="text-4xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <ProductVariants
                variants={product.variants}
                onSelectionChange={setSelectedVariants}
              />
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              {t("products.stock")}:{" "}
              <span className="font-semibold">{product.stock}</span>
            </p>
            {product.stock === 0 && (
              <p className="text-destructive text-sm font-semibold">
                {t("products.outOfStock")}
              </p>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("products.addToCart")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                if (!isAuthenticated) {
                  toast({
                    title: t("cart.loginRequiredFavorites"),
                    description: t("cart.loginRequiredFavoritesDescription"),
                    variant: "destructive",
                  });
                  navigate("/login");
                  return;
                }
                toggleFavorite(product.id);
              }}
            >
              <Heart
                className={`h-4 w-4 ${
                  favorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">
                {t("products.description")}
              </h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {displayDescription}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-12">
        <Recommendations type="similar" limit={6} />
      </div>
    </div>
  );
}
