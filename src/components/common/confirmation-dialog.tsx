/**
 * Reusable Confirmation Dialog Component
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useRTL } from "@/hooks/use-rtl";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  cancelText?: string;
  confirmText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false,
  cancelText,
  confirmText,
  variant = "default",
}: ConfirmationDialogProps) {
  const t = useTranslation();
  const isRTL = useRTL();
  const defaultCancelText = t("common.cancel");
  const defaultConfirmText = t("common.confirm");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(isRTL ? "sm:text-right" : "sm:text-left")}>
        <DialogHeader className={cn(isRTL ? "sm:text-right" : "sm:text-left")}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter
          className={cn(
            "gap-2 sm:gap-0",
            isRTL ? "sm:flex-row-reverse sm:justify-start" : ""
          )}
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText || defaultCancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader size="sm" className="mr-2" />
                {t("common.processing")}
              </>
            ) : (
              confirmText || defaultConfirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
