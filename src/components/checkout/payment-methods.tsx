import { useState, useEffect } from "react";
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  Wallet,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

export type PaymentMethodType = "card" | "wallet" | "paypal" | "cash";

export interface PaymentData {
  method: PaymentMethodType;
  card?: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
  wallet?: {
    mobile: string;
  };
  paypal?: {
    email: string;
  };
  saveInfo: boolean;
}

interface PaymentMethodsProps {
  onPaymentChange: (data: PaymentData) => void;
  isValid?: boolean;
  selectedMethod?: PaymentData | null;
}

export function PaymentMethods({
  onPaymentChange,
  selectedMethod,
}: PaymentMethodsProps) {
  const t = useTranslation();

  const [method, setMethod] = useState<PaymentMethodType>(selectedMethod?.method || "card");
  const [saveInfo, setSaveInfo] = useState(false);

  // Form States
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [walletData, setWalletData] = useState({ mobile: "" });
  const [paypalData, setPaypalData] = useState({ email: "" });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track previous selectedMethod to handle external updates
  const [prevSelectedMethod, setPrevSelectedMethod] = useState(selectedMethod);

  if (selectedMethod !== prevSelectedMethod) {
    setPrevSelectedMethod(selectedMethod);
    if (selectedMethod) {
      setMethod(selectedMethod.method);
      if (selectedMethod.method === "card" && selectedMethod.card) {
        setCardData(selectedMethod.card);
      } else if (selectedMethod.method === "wallet" && selectedMethod.wallet) {
        setWalletData(selectedMethod.wallet);
      } else if (selectedMethod.method === "paypal" && selectedMethod.paypal) {
        setPaypalData(selectedMethod.paypal);
      }
    }
  }

  // Update parent whenever local state changes
  useEffect(() => {
    onPaymentChange({
      method,
      card: method === "card" ? cardData : undefined,
      wallet: method === "wallet" ? walletData : undefined,
      paypal: method === "paypal" ? paypalData : undefined,
      saveInfo,
    });
  }, [method, cardData, walletData, paypalData, saveInfo, onPaymentChange]);



  // Basic Validation Logic (triggered on blur or change)
  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "cardNumber":
        if (value.length < 16) error = t("payment.invalidCardNumber");
        break;
      case "expiry":
        if (!value.match(/^\d{2}\/\d{2}$/))
          error = t("payment.invalidExpiryFormat");
        break;
      case "cvv":
        if (value.length < 3) error = t("payment.invalidCvv");
        break;
      case "mobile":
        if (value.length < 9) error = t("payment.invalidMobile");
        break;
      case "email":
        if (!value.includes("@")) error = t("payment.invalidEmail");
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credit Card Option */}
        <div
          className={`
            relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:bg-accent/50
            ${
              method === "card"
                ? "border-primary bg-primary/5"
                : "border-muted bg-card"
            }
          `}
          onClick={() => setMethod("card")}
        >
          {method === "card" && (
            <div className="absolute top-3 right-3 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}
          <CreditCard
            className={`h-8 w-8 mb-3 ${
              method === "card" ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span className="font-semibold text-lg">
            {t("payment.creditCard")}
          </span>
        </div>

        {/* Digital Wallet Option */}
        <div
          className={`
            relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:bg-accent/50
            ${
              method === "wallet"
                ? "border-primary bg-primary/5"
                : "border-muted bg-card"
            }
          `}
          onClick={() => setMethod("wallet")}
        >
          {method === "wallet" && (
            <div className="absolute top-3 right-3 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}
          <Wallet
            className={`h-8 w-8 mb-3 ${
              method === "wallet" ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span className="font-semibold text-lg">
            {t("payment.digitalWallet")}
          </span>
        </div>

        {/* PayPal Option */}
        <div
          className={`
            relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:bg-accent/50
            ${
              method === "paypal"
                ? "border-primary bg-primary/5"
                : "border-muted bg-card"
            }
          `}
          onClick={() => setMethod("paypal")}
        >
          {method === "paypal" && (
            <div className="absolute top-3 right-3 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}
          <Globe
            className={`h-8 w-8 mb-3 ${
              method === "paypal" ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span className="font-semibold text-lg">PayPal</span>
        </div>

        {/* Cash on Delivery Option */}
        <div
          className={`
            relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:bg-accent/50
            ${
              method === "cash"
                ? "border-primary bg-primary/5"
                : "border-muted bg-card"
            }
          `}
          onClick={() => setMethod("cash")}
        >
          {method === "cash" && (
            <div className="absolute top-3 right-3 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}
          <Banknote
            className={`h-8 w-8 mb-3 ${
              method === "cash" ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span className="font-semibold text-lg">
            {t("payment.cashOnDelivery")}
          </span>
        </div>
      </div>

      {/* Input Forms */}
      <div className="border-t pt-6 animation-fade-in">
        {method === "card" && (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">{t("payment.cardNumber")}</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={cardData.number}
                onChange={(e) =>
                  setCardData({ ...cardData, number: e.target.value })
                }
                onBlur={(e) => validateField("cardNumber", e.target.value)}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm">{errors.cardNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">{t("payment.cardholderName")}</Label>
              <Input
                id="cardName"
                placeholder={t("payment.cardholderNamePlaceholder")}
                value={cardData.name}
                onChange={(e) =>
                  setCardData({ ...cardData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">{t("payment.expiryDate")}</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={cardData.expiry}
                  onChange={(e) =>
                    setCardData({ ...cardData, expiry: e.target.value })
                  }
                  onBlur={(e) => validateField("expiry", e.target.value)}
                />
                {errors.expiry && (
                  <p className="text-red-500 text-sm">{errors.expiry}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  value={cardData.cvv}
                  onChange={(e) =>
                    setCardData({ ...cardData, cvv: e.target.value })
                  }
                  onBlur={(e) => validateField("cvv", e.target.value)}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-sm">{errors.cvv}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {method === "wallet" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">{t("payment.mobileNumber")}</Label>
              <Input
                id="mobile"
                placeholder="+966..."
                value={walletData.mobile}
                onChange={(e) =>
                  setWalletData({ ...walletData, mobile: e.target.value })
                }
                onBlur={(e) => validateField("mobile", e.target.value)}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm">{errors.mobile}</p>
              )}
            </div>
          </div>
        )}

        {method === "paypal" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">{t("payment.paypalEmail")}</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder="user@example.com"
                value={paypalData.email}
                onChange={(e) =>
                  setPaypalData({ ...paypalData, email: e.target.value })
                }
                onBlur={(e) => validateField("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {method !== "cash" && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
          <Checkbox
            id="saveInfo"
            checked={saveInfo}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              setSaveInfo(checked === true)
            }
          />
          <label
            htmlFor="saveInfo"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 px-2"
          >
            {t("payment.saveInfo")}
          </label>
        </div>
      )}
    </CardContent>
  );
}
