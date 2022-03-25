import React from "react";

export function useLocalStorageState<T>(
  key: string,
  defaultState: T
): [T, (newState: T) => void] {
  const [state, setState] = React.useState(() => {
    if (typeof window === "undefined") {
      return;
    }
    let storedState = localStorage.getItem(key);
    if (storedState) {
      return JSON.parse(storedState);
    }
    return defaultState;
  });

  const setLocalStorageState = React.useCallback(
    (newState) => {
      if (typeof window === "undefined") {
        return;
      }
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
    [key, state]
  );

  return [state, setLocalStorageState];
}
