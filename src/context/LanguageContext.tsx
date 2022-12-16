import React from 'react';

export type AvailableLocale =
  | 'ar'
  | 'ca'
  | 'cs'
  | 'da'
  | 'de'
  | 'en'
  | 'el'
  | 'es'
  | 'fr'
  | 'hr'
  | 'hu'
  | 'it'
  | 'ja'
  | 'lt'
  | 'nb-NO'
  | 'nl'
  | 'pl'
  | 'pt-BR'
  | 'pt-PT'
  | 'ru'
  | 'sq'
  | 'sr'
  | 'sv'
  | 'zh-CN'
  | 'zh-TW';

type AvailableLanguageObject = Record<
  string,
  { code: AvailableLocale; display: string }
>;

export const availableLanguages: AvailableLanguageObject = {
  ca: {
    code: 'ca',
    display: 'Català',
  },
  cs: {
    code: 'cs',
    display: 'Čeština',
  },
  da: {
    code: 'da',
    display: 'Dansk',
  },
  de: {
    code: 'de',
    display: 'Deutsch',
  },
  en: {
    code: 'en',
    display: 'English',
  },
  es: {
    code: 'es',
    display: 'Español',
  },
  fr: {
    code: 'fr',
    display: 'Français',
  },
  hr: {
    code: 'hr',
    display: 'Hrvatski',
  },
  it: {
    code: 'it',
    display: 'Italiano',
  },
  lt: {
    code: 'lt',
    display: 'Lietuvių',
  },
  hu: {
    code: 'hu',
    display: 'Magyar',
  },
  nl: {
    code: 'nl',
    display: 'Nederlands',
  },
  'nb-NO': {
    code: 'nb-NO',
    display: 'Norsk Bokmål',
  },
  pl: {
    code: 'pl',
    display: 'Polski',
  },
  'pt-BR': {
    code: 'pt-BR',
    display: 'Português (Brasil)',
  },
  'pt-PT': {
    code: 'pt-PT',
    display: 'Português (Portugal)',
  },
  sq: {
    code: 'sq',
    display: 'Shqip',
  },
  sv: {
    code: 'sv',
    display: 'Svenska',
  },
  el: {
    code: 'el',
    display: 'Ελληνικά',
  },
  ru: {
    code: 'ru',
    display: 'pусский',
  },
  sr: {
    code: 'sr',
    display: 'српски језик',
  },
  ar: {
    code: 'ar',
    display: 'العربية',
  },
  ja: {
    code: 'ja',
    display: '日本語',
  },
  'zh-TW': {
    code: 'zh-TW',
    display: '繁體中文',
  },
  'zh-CN': {
    code: 'zh-CN',
    display: '简体中文',
  },
};

export interface LanguageContextProps {
  locale: AvailableLocale;
  children: (locale: string) => React.ReactNode;
  setLocale?: React.Dispatch<React.SetStateAction<AvailableLocale>>;
}

export const LanguageContext = React.createContext<
  Omit<LanguageContextProps, 'children'>
>({
  locale: 'en',
});
