import useInteraction from '@app/hooks/useInteraction';
import React from 'react';

interface InteractionContextProps {
  isTouch?: boolean;
  children?: React.ReactNode;
}

export const InteractionContext = React.createContext<InteractionContextProps>({
  isTouch: false,
});

export const InteractionProvider = ({ children }: InteractionContextProps) => {
  const isTouch = useInteraction();

  return (
    <InteractionContext.Provider value={{ isTouch }}>
      {children}
    </InteractionContext.Provider>
  );
};
