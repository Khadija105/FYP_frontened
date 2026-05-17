import { useLanguageStore } from "../store";
import { translations, TranslationKey, Language } from "../locales/translations";

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language) as Language;

  const t = (key: TranslationKey): string => {
    const lang = (language as Language) || "en";
    return translations[lang]?.[key as keyof typeof translations[keyof typeof translations]] || translations["en"]?.[key as keyof typeof translations["en"]] || key;
  };

  return { t, language };
};
