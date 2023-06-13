import { useEffect } from 'react';

/**
 * Hook to lock the body scroll whenever a component is mounted or
 * whenever isLocked is set to true.
 *
 * You can pass in true always to cause a lock on mount/dismount of the component
 * using this hook.
 *
 * @param isLocked Toggle the scroll lock
 * @param disabled Disables the entire hook (allows conditional skipping of the lock)
 */
export const useLockBodyScroll = (
  isLocked: boolean,
  disabled?: boolean
): void => {
  useEffect(() => {
    const originalOverflowStyle = window.getComputedStyle(
      document.body
    ).overflow;
    const originalTouchActionStyle = window.getComputedStyle(
      document.body
    ).touchAction;
    if (isLocked && !disabled) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
    return () => {
      if (!disabled) {
        document.body.style.overflow = originalOverflowStyle;
        document.body.style.touchAction = originalTouchActionStyle;
      }
    };
  }, [isLocked, disabled]);
};
