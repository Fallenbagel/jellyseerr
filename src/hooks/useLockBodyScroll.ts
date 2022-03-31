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
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isLocked && !disabled) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (!disabled) {
        document.body.style.overflow = originalStyle;
      }
    };
  }, [isLocked, disabled]);
};
