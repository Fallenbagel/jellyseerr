import React from 'react';
import useInteraction from '../hooks/useInteraction';

interface InteractionContextProps {
  isTouch: boolean;
}

export const InteractionContext = React.createContext<InteractionContextProps>({
  isTouch: false,
});

export const InteractionProvider: React.FC = ({ children }) => {
  const isTouch = useInteraction();

  return (
    <InteractionContext.Provider value={{ isTouch }}>
      {children}
    </InteractionContext.Provider>
  );
};
