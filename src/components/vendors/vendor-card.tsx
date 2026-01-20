import { Link } from "react-router-dom";
import type { Seller } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { Store, Star, Package } from "lucide-react";

interface VendorCardProps {
  seller: Seller;
}

export function VendorCard({ seller }: VendorCardProps) {
  const t = useTranslation();
  const { i18n } = useI18nTranslation();
  const language = i18n.language as "ar" | "en";

  const storeName = seller.storeName[language] || seller.storeName.en;
  const bio =
    seller.bio?.[language] ||
    seller.description?.[language] ||
    seller.description?.en;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group h-full flex flex-col">
      <div className="relative h-32 bg-secondary/20">
        {seller.coverImage ? (
          <img
            src={seller.coverImage}
            alt={storeName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Store className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute -bottom-8 rtl:right-4 ltr:left-4">
          <div className="w-16 h-16 rounded-full border-4 border-background bg-background overflow-hidden shadow-sm">
            {seller.logo ? (
              <img
                src={seller.logo}
                alt={storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <Store className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      </div>

      <CardHeader className="pt-10 pb-2 flex-grow-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
              <Link to={`/store/${seller.slug}`}>{storeName}</Link>
            </h3>
            <div className="flex items-center gap-1 text-sm text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{seller.rating || 0}</span>
              <span className="text-muted-foreground text-xs">
                ({seller.reviewCount || 0})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {bio || t("common.noDescription")}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md w-fit">
          <Package className="w-4 h-4" />
          <span>
            {seller.productCount} {t("common.products")}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Link to={`/store/${seller.slug}`} className="w-full">
          <Button
            variant="outline"
            className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
          >
            {t("common.viewStore")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
