import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Initialize the i18n library
i18n
  .use(HttpBackend) // load translation files
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass i18n instance to react-i18next
  .init({
    fallbackLng: "ar", // default language
    debug: false, // disable debug mode for production
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    // Fix for Select component showing empty on first load
    // Browser returns regional language codes (en-US) but our app expects base codes (en)
    detection: {
      // Normalize language codes by taking only the primary part
      // This converts codes like 'en-US' to 'en' and 'ar-SA' to 'ar'
      convertDetectedLanguage: (lng) => {
        return lng.split("-")[0];
      },
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // path to translation files
    },
    react: {
      useSuspense: true, // Enable suspense to hold rendering until translations are loaded
    },
  });

// Handle RTL direction change when language changes
i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    const isRTL = lng === "ar";
    const dir = isRTL ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lng);
  }
});

// Set initial direction
if (typeof document !== "undefined") {
  const initialLang = i18n.language || "ar";
  const isRTL = initialLang === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", initialLang);
}

export default i18n;
