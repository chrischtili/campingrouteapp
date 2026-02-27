import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from './locales/de.json';
import en from './locales/en.json';
import nl from './locales/nl.json';
import fr from './locales/fr.json';
import it from './locales/it.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
      nl: { translation: nl },
      fr: { translation: fr },
      it: { translation: it }
    },
    supportedLngs: ['de', 'en', 'nl', 'fr', 'it'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['querystring', 'localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage']
    },
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
