import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEN from '@/i18n/locales/en/common.json';
import commonDE from '@/i18n/locales/de/common.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: commonEN,
  },
  de: {
    common: commonDE,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['de', 'en'],
    fallbackLng: 'en',
    debug: true,
    resources,
    defaultNS,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
