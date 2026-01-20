import i18n from '@/i18n';

interface GlobalLoaderProps {
  text?: string;
}

export function GlobalLoader({ text }: GlobalLoaderProps) {
  // Use synchronous language detection (i18n.t() won't work during Suspense)
  const currentLang = i18n.language || 'ar';
  const isArabic = currentLang.startsWith('ar');
  
  // Hardcoded values matching translation files (common.loading)
  const displayText = text || (isArabic ? "جاري التحميل..." : "Loading...");

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <span className="text-muted-foreground font-medium animate-pulse">{displayText}</span>
    </div>
  )
}
