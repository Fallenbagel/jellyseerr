import type { LanguageContextProps } from '@app/context/LanguageContext';
import { LanguageContext } from '@app/context/LanguageContext';
import { useContext } from 'react';

const useLocale = (): Omit<LanguageContextProps, 'children'> => {
  const languageContext = useContext(LanguageContext);

  return languageContext;
};

export default useLocale;
