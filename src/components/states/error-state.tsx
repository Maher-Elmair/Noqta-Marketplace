/**
 * Error state component
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const t = useTranslation();

  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-center">
          {title || t("common.errorTitle")}
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
          {message || t("common.errorMessage")}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {t("common.retry")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
