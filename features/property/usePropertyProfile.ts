'use client';

import { useReducer, useEffect } from 'react';
import type { BoardingHouse } from '@/types';
import { defaultBoardingHouse } from '@/lib/defaults';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface PropertyState {
  boardingHouse: BoardingHouse;
  isLoading: boolean;
}

type PropertyAction =
  | { type: 'HYDRATE'; payload: BoardingHouse }
  | { type: 'SAVE';    payload: BoardingHouse };

function propertyReducer(state: PropertyState, action: PropertyAction): PropertyState {
  switch (action.type) {
    case 'HYDRATE':
      return { boardingHouse: action.payload, isLoading: false };
    case 'SAVE':
      return { ...state, boardingHouse: action.payload };
    default:
      return state;
  }
}

export function usePropertyProfile() {
  // Initial state matches server render — localStorage is read only after mount via
  // HYDRATE dispatch. useReducer dispatch is safe inside useEffect (not flagged by
  // react-hooks/set-state-in-effect).
  const [{ boardingHouse, isLoading }, dispatch] = useReducer(propertyReducer, {
    boardingHouse: defaultBoardingHouse,
    isLoading: true,
  });

  useEffect(() => {
    const saved = loadFromStorage();
    dispatch({ type: 'HYDRATE', payload: saved ?? defaultBoardingHouse });
  }, []);

  function saveProfile(draft: BoardingHouse) {
    saveToStorage(draft);
    dispatch({ type: 'SAVE', payload: draft });
  }

  return { boardingHouse, isLoading, saveProfile };
}
