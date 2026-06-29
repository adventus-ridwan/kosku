'use client';

import { useReducer, useEffect } from 'react';
import type { BoardingHouse, Room } from '@/types';
import { isRoom } from '@/types';
import { defaultBoardingHouse } from '@/lib/defaults';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

export interface FlatRoom {
  room:      Room;
  floorId:   string;
  floorName: string;
}

// Profile fields only — prevents passing operational fields through the profile save path
type RoomProfilePatch = Partial<Pick<Room, 'description' | 'size' | 'capacity' | 'publishStatus' | 'roomAmenities' | 'roomTypeId' | 'priceOverride'>>;

interface RoomsState {
  boardingHouse: BoardingHouse;
  isLoading:     boolean;
}

type RoomsAction =
  | { type: 'HYDRATE'; payload: BoardingHouse }
  | { type: 'SAVE';    payload: BoardingHouse };

function roomsReducer(state: RoomsState, action: RoomsAction): RoomsState {
  switch (action.type) {
    case 'HYDRATE':
      return { boardingHouse: action.payload, isLoading: false };
    case 'SAVE':
      return { ...state, boardingHouse: action.payload };
    default:
      return state;
  }
}

function flattenRooms(bh: BoardingHouse): FlatRoom[] {
  return bh.floors.flatMap(floor =>
    floor.objects.filter(isRoom).map(room => ({ room, floorId: floor.id, floorName: floor.name }))
  );
}

export function useRooms() {
  const [{ boardingHouse, isLoading }, dispatch] = useReducer(roomsReducer, {
    boardingHouse: defaultBoardingHouse,
    isLoading: true,
  });

  useEffect(() => {
    const saved = loadFromStorage();
    dispatch({ type: 'HYDRATE', payload: saved ?? defaultBoardingHouse });
  }, []);

  const allRooms = flattenRooms(boardingHouse);

  function updateRoom(roomId: string, patch: RoomProfilePatch) {
    const current = loadFromStorage() ?? boardingHouse;
    const updated: BoardingHouse = {
      ...current,
      floors: current.floors.map(floor => ({
        ...floor,
        objects: floor.objects.map(obj =>
          isRoom(obj) && obj.id === roomId ? { ...obj, ...patch } : obj
        ),
      })),
    };
    saveToStorage(updated);
    dispatch({ type: 'SAVE', payload: updated });
  }

  const roomTypes = boardingHouse.roomTypes ?? [];

  return { allRooms, isLoading, updateRoom, roomTypes };
}
