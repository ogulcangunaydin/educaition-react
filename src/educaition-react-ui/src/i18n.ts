import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { SupportedLanguages } from "./interfaces";

export const SUPPORTED_LANGUAGES: SupportedLanguages[] = ["en", "tr"];
export const DEFAULT_LANG = "en";

export async function initializeI18n() {
  await i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      debug: true,
      ns: ["translation", "routes"],
      defaultNS: "translation",
      interpolation: {
        escapeValue: false, // React already does escaping
      },
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      supportedLngs: SUPPORTED_LANGUAGES,
    });
}

export default i18n;
