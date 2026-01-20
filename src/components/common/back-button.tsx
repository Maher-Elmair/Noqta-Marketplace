/**
 * Reusable Back Button Component
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useRTL } from "@/hooks/use-rtl";

interface BackButtonProps {
  className?: string;
  variant?:
    | "default"
    | "ghost"
    | "outline"
    | "secondary"
    | "destructive"
    | "link";
}

export function BackButton({
  className = "mb-6",
  variant = "ghost",
}: BackButtonProps) {
  const navigate = useNavigate();
  const t = useTranslation();
  const isRTL = useRTL();

  return (
    <Button
      variant={variant}
      onClick={() => navigate(-1)}
      className={className}
    >
      {isRTL ? (
        <ArrowRight className="h-4 w-4 mr-2" />
      ) : (
        <ArrowLeft className="h-4 w-4 mr-2" />
      )}
      {t("common.back")}
    </Button>
  );
}
