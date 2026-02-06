/**
 * i18n Configuration
 *
 * Internationalization setup for English and Turkish languages.
 * Uses i18next with browser language detection.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation resources
import en from "./locales/en";
import tr from "./locales/tr";

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "tr", // Default to Turkish
    supportedLngs: ["en", "tr"],

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ["localStorage", "navigator", "htmlTag"],
      // Cache user language preference
      caches: ["localStorage"],
      lookupLocalStorage: "language",
    },

    // React specific options
    react: {
      useSuspense: true,
    },
  });

export default i18n;

// Helper to get current language
export const getCurrentLanguage = () => i18n.language;

// Helper to change language
export const changeLanguage = (lng) => i18n.changeLanguage(lng);

// Available languages
export const languages = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
];
