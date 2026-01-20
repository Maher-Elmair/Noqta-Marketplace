import { useTranslation as useI18NextTranslation } from "react-i18next";

export function useTranslation() {
  const { t } = useI18NextTranslation();
  return t;
}
