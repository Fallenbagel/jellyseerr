import { useEffect, useState } from 'react';

export const INTERACTION_TYPE = {
  MOUSE: 'mouse',
  PEN: 'pen',
  TOUCH: 'touch',
};

const UPDATE_INTERVAL = 1000; // Throttle updates to the type to prevent flip flopping

const useInteraction = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasTapEvent = 'ontouchstart' in window;
    setIsTouch(hasTapEvent);

    let localTouch = hasTapEvent;
    let lastTouchUpdate = Date.now();

    const shouldUpdate = (): boolean =>
      lastTouchUpdate + UPDATE_INTERVAL < Date.now();

    const onMouseMove = (): void => {
      if (localTouch && shouldUpdate()) {
        setTimeout(() => {
          if (shouldUpdate()) {
            setIsTouch(false);
            localTouch = false;
          }
        }, UPDATE_INTERVAL);
      }
    };

    const onTouchStart = (): void => {
      lastTouchUpdate = Date.now();

      if (!localTouch) {
        setIsTouch(true);
        localTouch = true;
      }
    };

    const onPointerMove = (e: PointerEvent): void => {
      const { pointerType } = e;

      switch (pointerType) {
        case INTERACTION_TYPE.TOUCH:
        case INTERACTION_TYPE.PEN:
          return onTouchStart();
        default:
          return onMouseMove();
      }
    };

    if (hasTapEvent) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchstart', onTouchStart);
    } else {
      window.addEventListener('pointerdown', onPointerMove);
      window.addEventListener('pointermove', onPointerMove);
    }

    return () => {
      if (hasTapEvent) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchstart', onTouchStart);
      } else {
        window.removeEventListener('pointerdown', onPointerMove);
        window.removeEventListener('pointermove', onPointerMove);
      }
    };
  }, []);

  return isTouch;
};

export default useInteraction;
