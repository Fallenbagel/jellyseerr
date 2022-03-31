import { useContext } from 'react';
import {
  SettingsContext,
  SettingsContextProps,
} from '../context/SettingsContext';

const useSettings = (): SettingsContextProps => {
  const settings = useContext(SettingsContext);

  return settings;
};

export default useSettings;
