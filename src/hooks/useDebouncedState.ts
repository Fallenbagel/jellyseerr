import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

/**
 * A hook to help with debouncing state
 *
 * This hook basically acts the same as useState except it is also
 * returning a deobuncedValue that can be used for things like
 * debouncing input into a search field
 *
 * @param initialValue Initial state value
 * @param debounceTime Debounce time in ms
 */
const useDebouncedState = <S>(
  initialValue: S,
  debounceTime = 300
): [S, S, Dispatch<SetStateAction<S>>] => {
  const [value, setValue] = useState(initialValue);
  const [finalValue, setFinalValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFinalValue(value);
    }, debounceTime);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, debounceTime]);

  return [value, finalValue, setValue];
};

export default useDebouncedState;
