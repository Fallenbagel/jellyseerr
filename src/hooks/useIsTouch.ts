import { useContext } from 'react';
import { InteractionContext } from '../context/InteractionContext';

export const useIsTouch = (): boolean => {
  const { isTouch } = useContext(InteractionContext);
  return isTouch;
};
