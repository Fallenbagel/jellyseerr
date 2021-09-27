import { useContext } from 'react';
import {
  LanguageContext,
  LanguageContextProps,
} from '../context/LanguageContext';

const useLocale = (): Omit<LanguageContextProps, 'children'> => {
  const languageContext = useContext(LanguageContext);

  return languageContext;
};

export default useLocale;
