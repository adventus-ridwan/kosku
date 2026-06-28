'use client';

import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Re-read from storage when the key changes (during-render update avoids cascading effect).
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    let next = initialValue;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) next = JSON.parse(raw) as T;
      } catch {
        // Malformed JSON — keep initialValue
      }
    }
    setStored(next);
  }

  function setValue(value: T | ((prev: T) => T)) {
    setStored(prev => {
      const next = typeof value === 'function'
        ? (value as (prev: T) => T)(prev)
        : value;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(next));
        }
      } catch {
        // Silently ignore QuotaExceededError
      }
      return next;
    });
  }

  return [stored, setValue];
}
