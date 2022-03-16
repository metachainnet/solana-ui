import { useCallback, useState } from "react";

export default function useLocalStorageState<T>(
  key: string,
  defaultState: T
): [T, (T: T) => void] {
  const [state, setState] = useState(() => {
    let storedState = null;

    if (typeof window !== "undefined") {
      storedState = localStorage.getItem(key);
    }

    if (storedState) {
      return JSON.parse(storedState);
    }
    return defaultState;
  });

  const setLocalStorageState = useCallback(
    (newState) => {
      let changed = state !== newState;
      if (!changed) {
        return;
      }
      setState(newState);

      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newState));
      }
    },
    [state, key]
  );

  return [state, setLocalStorageState];
}
