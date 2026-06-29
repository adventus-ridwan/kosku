'use client';

import { useReducer, useEffect, useMemo } from 'react';
import type { BoardingHouse, RoomType } from '@/types';
import { isRoom } from '@/types';
import { defaultBoardingHouse } from '@/lib/defaults';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface RoomTypesState {
  boardingHouse: BoardingHouse;
  isLoading:     boolean;
}

type RoomTypesAction =
  | { type: 'HYDRATE'; payload: BoardingHouse }
  | { type: 'SAVE';    payload: BoardingHouse };

function roomTypesReducer(state: RoomTypesState, action: RoomTypesAction): RoomTypesState {
  switch (action.type) {
    case 'HYDRATE': return { boardingHouse: action.payload, isLoading: false };
    case 'SAVE':    return { ...state, boardingHouse: action.payload };
    default:        return state;
  }
}

export function useRoomTypes() {
  const [{ boardingHouse, isLoading }, dispatch] = useReducer(roomTypesReducer, {
    boardingHouse: defaultBoardingHouse,
    isLoading: true,
  });

  useEffect(() => {
    const saved = loadFromStorage();
    dispatch({ type: 'HYDRATE', payload: saved ?? defaultBoardingHouse });
  }, []);

  const roomTypes = boardingHouse.roomTypes ?? [];

  // Count rooms assigned to each type (for display and AC-13 deletion guard)
  const roomCountByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const floor of boardingHouse.floors) {
      for (const obj of floor.objects) {
        if (isRoom(obj) && obj.roomTypeId) {
          counts[obj.roomTypeId] = (counts[obj.roomTypeId] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [boardingHouse]);

  function addRoomType(data: Omit<RoomType, 'id'>): void {
    const current = loadFromStorage() ?? boardingHouse;
    const newType: RoomType = { ...data, id: crypto.randomUUID() };
    const updated: BoardingHouse = {
      ...current,
      roomTypes: [...(current.roomTypes ?? []), newType],
    };
    saveToStorage(updated);
    dispatch({ type: 'SAVE', payload: updated });
  }

  function updateRoomType(roomType: RoomType): void {
    const current = loadFromStorage() ?? boardingHouse;
    const updated: BoardingHouse = {
      ...current,
      roomTypes: (current.roomTypes ?? []).map(t => t.id === roomType.id ? roomType : t),
    };
    saveToStorage(updated);
    dispatch({ type: 'SAVE', payload: updated });
  }

  function deleteRoomType(id: string): boolean {
    if ((roomCountByType[id] ?? 0) > 0) return false; // AC-13: blocked while rooms reference this type
    const current = loadFromStorage() ?? boardingHouse;
    const updated: BoardingHouse = {
      ...current,
      roomTypes: (current.roomTypes ?? []).filter(t => t.id !== id),
    };
    saveToStorage(updated);
    dispatch({ type: 'SAVE', payload: updated });
    return true;
  }

  return { roomTypes, isLoading, addRoomType, updateRoomType, deleteRoomType, roomCountByType };
}
