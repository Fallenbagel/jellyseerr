import type { SettingsContextProps } from '@app/context/SettingsContext';
import { SettingsContext } from '@app/context/SettingsContext';
import { useContext } from 'react';

const useSettings = (): SettingsContextProps => {
  const settings = useContext(SettingsContext);

  return settings;
};

export default useSettings;
