import {
  Filter,
  ArrowUpDown,
  Layers,
  Check,
  DollarSign,
  Star,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category, SearchResult } from "@/types";
import { useTranslation } from "react-i18next";

interface FiltersSidebarProps {
  sortBy: string;
  setSortBy: (value: "newest" | "price_asc" | "price_desc" | "rating") => void;
  categories?: Category[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  totalProducts: number;
  searchResult?: SearchResult;
  priceRange: { min: number | undefined; max: number | undefined };
  setPriceRange: React.Dispatch<
    React.SetStateAction<{ min: number | undefined; max: number | undefined }>
  >;
  minRating: number | undefined;
  setMinRating: (rating: number | undefined) => void;
  className?: string;
}

export function FiltersSidebar({
  sortBy,
  setSortBy,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  totalProducts,
  searchResult,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  className,
}: FiltersSidebarProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("ar");
  return (
    <div className={cn("bg-card p-4 rounded-lg border shadow-sm space-y-6 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar", className)}>
      <div>
        <div className="flex items-center gap-2 pb-2 border-b mb-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">{t("filters.title")}</h2>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
            <ArrowUpDown className="h-4 w-4" />
            {t("filters.sortBy")}
          </h3>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "newest"
                  | "price_asc"
                  | "price_desc"
                  | "rating"
              )
            }
          >
            <option value="newest">{t("filters.newest")}</option>
            <option value="price_asc">{t("filters.priceLowToHigh")}</option>
            <option value="price_desc">{t("filters.priceHighToLow")}</option>
            <option value="rating">{t("filters.highestRated")}</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
          <Layers className="h-4 w-4" />
          {t("filters.category")}
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              selectedCategoryId === null
                ? "bg-primary text-primary-foreground font-medium shadow-md"
                : "hover:bg-muted text-muted-foreground hover:text-foreground hover:pl-4"
            )}
          >
            <span className="flex items-center gap-2">
              {selectedCategoryId === null && <Check className="h-3.5 w-3.5" />}
              {t("filters.all")}
            </span>
            {selectedCategoryId === null && (
              <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded text-[10px]">
                {totalProducts}
              </span>
            )}
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                selectedCategoryId === category.id
                  ? "bg-primary text-primary-foreground font-medium shadow-md"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground hover:pl-4"
              )}
            >
              <span className="flex items-center gap-2">
                {selectedCategoryId === category.id && (
                  <Check className="h-3.5 w-3.5" />
                )}
                {isRTL ? category.name.ar : category.name.en}
              </span>
              {category.productCount !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded",
                    selectedCategoryId === category.id
                      ? "bg-primary-foreground/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {category.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
          <DollarSign className="h-4 w-4" />
          {t("filters.price")}
        </h3>
        <div className="px-2 mb-4">
          <Slider
            defaultValue={[
              searchResult?.minPrice || 0,
              searchResult?.maxPrice || 1000,
            ]}
            max={searchResult?.maxPrice || 1000}
            min={searchResult?.minPrice || 0}
            step={1}
            minStepsBetweenThumbs={1}
            value={[
              priceRange.min !== undefined
                ? priceRange.min
                : searchResult?.minPrice || 0,
              priceRange.max !== undefined
                ? priceRange.max
                : searchResult?.maxPrice || 1000,
            ]}
            onValueChange={(value) =>
              setPriceRange({ min: value[0], max: value[1] })
            }
            className="my-4"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder={searchResult?.minPrice?.toString() || "Min"}
            className="h-8 text-sm"
            value={
              priceRange.min !== undefined
                ? priceRange.min
                : searchResult?.minPrice || ""
            }
            onChange={(e) =>
              setPriceRange((prev) => ({
                ...prev,
                min: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder={searchResult?.maxPrice?.toString() || "Max"}
            className="h-8 text-sm"
            value={
              priceRange.max !== undefined
                ? priceRange.max
                : searchResult?.maxPrice || ""
            }
            onChange={(e) =>
              setPriceRange((prev) => ({
                ...prev,
                max: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
          <Star className="h-4 w-4" />
          {t("filters.rating")}
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border",
                minRating === rating
                  ? "bg-primary/5 border-primary/20 shadow-sm"
                  : "border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted/20 text-muted/40"
                    )}
                  />
                ))}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  minRating === rating
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {t("filters.andUp")}
              </span>
            </button>
          ))}
          <button
            onClick={() => setMinRating(undefined)}
            className={cn(
              "w-full text-start px-3 py-2.5 rounded-lg text-sm transition-colors border",
              minRating === undefined
                ? "bg-secondary text-secondary-foreground border-transparent font-medium"
                : "border-transparent hover:bg-muted text-muted-foreground"
            )}
          >
            {t("filters.allRatings")}
          </button>
        </div>
      </div>
    </div>
  );
}
