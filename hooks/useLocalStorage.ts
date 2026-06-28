'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        setStored(JSON.parse(raw) as T);
      }
    } catch {
      // Malformed JSON — keep initialValue
    }
  }, [key]);

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
