import { useTranslation } from 'react-i18next';

/**
 * Hook to determine if the current language is RTL
 * Uses i18n.language to check if it's Arabic
 */
export function useRTL() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  return isRTL;
}

