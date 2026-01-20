import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

export const CURRENCIES = [
  { code: "USD", symbol: "$", translationKey: "currency.usd" },
  { code: "EGP", symbol: "EGP", translationKey: "currency.egp" },
  { code: "SAR", symbol: "SAR", translationKey: "currency.sar" },
  { code: "AED", symbol: "AED", translationKey: "currency.aed" },
  { code: "KWD", symbol: "KWD", translationKey: "currency.kwd" },
  { code: "EUR", symbol: "€", translationKey: "currency.eur" },
  { code: "GBP", symbol: "£", translationKey: "currency.gbp" },
];

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  const t = useTranslation();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={t("currency.title")} />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground w-8">
                {currency.code}
              </span>
              <span>{t(currency.translationKey)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
