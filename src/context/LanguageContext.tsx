import React, { ReactNode } from 'react';

export type AvailableLocales =
  | 'de'
  | 'en'
  | 'es'
  | 'it'
  | 'ja'
  | 'fr'
  | 'hu'
  | 'nb-NO'
  | 'nl'
  | 'pt-BR'
  | 'pt-PT'
  | 'ru'
  | 'sr'
  | 'sv'
  | 'zh-TW';

interface LanguageContextProps {
  locale: AvailableLocales;
  children: (locale: string) => ReactNode;
  setLocale?: React.Dispatch<React.SetStateAction<AvailableLocales>>;
}

export const LanguageContext = React.createContext<
  Omit<LanguageContextProps, 'children'>
>({
  locale: 'en',
});
