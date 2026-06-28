'use client';

import { useReducer, useEffect, useState } from 'react';
import type {
  AppState,
  AppMode,
  DragState,
  Room,
  Floor,
  BoardingHouse,
} from '@/types';
import { defaultBoardingHouse } from '@/lib/defaults';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

type KosAction =
  | { type: 'HYDRATE'; payload: BoardingHouse }
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_ACTIVE_FLOOR'; payload: string }
  | { type: 'SELECT_ROOM'; payload: string }
  | { type: 'DESELECT_ROOM' }
  | { type: 'UPDATE_HOUSE_NAME'; payload: string }
  | { type: 'ADD_FLOOR'; payload: { id: string; name: string } }
  | { type: 'RENAME_FLOOR'; payload: { id: string; name: string } }
  | { type: 'DELETE_FLOOR'; payload: string }
  | { type: 'ADD_ROOM'; payload: { floorId: string; room: Room } }
  | { type: 'UPDATE_ROOM'; payload: { floorId: string; room: Room } }
  | { type: 'DELETE_ROOM'; payload: { floorId: string; roomId: string } }
  | { type: 'MOVE_ROOM'; payload: { floorId: string; roomId: string; x: number; y: number } }
  | { type: 'SET_DRAG_STATE'; payload: DragState | null };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: AppState = {
  boardingHouse: defaultBoardingHouse,
  mode: 'view',
  activeFloorId: defaultBoardingHouse.floors[0].id,
  selectedRoomId: null,
  dragState: null,
};

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

function cellsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function updateFloors(
  floors: Floor[],
  floorId: string,
  updater: (floor: Floor) => Floor,
): Floor[] {
  return floors.map(f => (f.id === floorId ? updater(f) : f));
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: AppState, action: KosAction): AppState {
  switch (action.type) {
    case 'HYDRATE': {
      const bh = action.payload;
      return {
        ...state,
        boardingHouse: bh,
        activeFloorId: bh.floors[0]?.id ?? state.activeFloorId,
      };
    }

    case 'SET_MODE':
      return { ...state, mode: action.payload, dragState: null };

    case 'SET_ACTIVE_FLOOR':
      return { ...state, activeFloorId: action.payload, selectedRoomId: null };

    case 'SELECT_ROOM':
      return { ...state, selectedRoomId: action.payload };

    case 'DESELECT_ROOM':
      return { ...state, selectedRoomId: null };

    case 'UPDATE_HOUSE_NAME':
      return {
        ...state,
        boardingHouse: { ...state.boardingHouse, name: action.payload },
      };

    case 'ADD_FLOOR': {
      const newFloor: Floor = {
        id: action.payload.id,
        name: action.payload.name,
        rooms: [],
      };
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: [...state.boardingHouse.floors, newFloor],
        },
        activeFloorId: newFloor.id,
      };
    }

    case 'RENAME_FLOOR':
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: state.boardingHouse.floors.map(f =>
            f.id === action.payload.id ? { ...f, name: action.payload.name } : f,
          ),
        },
      };

    case 'DELETE_FLOOR': {
      const remaining = state.boardingHouse.floors.filter(f => f.id !== action.payload);
      if (remaining.length === 0) return state; // always keep at least one floor
      const nextActiveId =
        state.activeFloorId === action.payload ? remaining[0].id : state.activeFloorId;
      return {
        ...state,
        boardingHouse: { ...state.boardingHouse, floors: remaining },
        activeFloorId: nextActiveId,
        selectedRoomId: null,
      };
    }

    case 'ADD_ROOM':
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(
            state.boardingHouse.floors,
            action.payload.floorId,
            f => ({ ...f, rooms: [...f.rooms, action.payload.room] }),
          ),
        },
      };

    case 'UPDATE_ROOM':
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(
            state.boardingHouse.floors,
            action.payload.floorId,
            f => ({
              ...f,
              rooms: f.rooms.map(r =>
                r.id === action.payload.room.id ? action.payload.room : r,
              ),
            }),
          ),
        },
      };

    case 'DELETE_ROOM':
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(
            state.boardingHouse.floors,
            action.payload.floorId,
            f => ({
              ...f,
              rooms: f.rooms.filter(r => r.id !== action.payload.roomId),
            }),
          ),
        },
        selectedRoomId:
          state.selectedRoomId === action.payload.roomId ? null : state.selectedRoomId,
      };

    case 'MOVE_ROOM': {
      const { floorId, roomId, x, y } = action.payload;
      const floor = state.boardingHouse.floors.find(f => f.id === floorId);
      if (!floor) return state;
      const room = floor.rooms.find(r => r.id === roomId);
      if (!room) return state;

      // Bounds check
      if (
        x < 0 ||
        y < 0 ||
        x + room.width > state.boardingHouse.gridCols ||
        y + room.height > state.boardingHouse.gridRows
      ) {
        return state;
      }

      // Collision check against every other room on the same floor
      const hasOverlap = floor.rooms.some(r => {
        if (r.id === roomId) return false;
        return cellsOverlap(x, y, room.width, room.height, r.x, r.y, r.width, r.height);
      });
      if (hasOverlap) return state;

      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(state.boardingHouse.floors, floorId, f => ({
            ...f,
            rooms: f.rooms.map(r => (r.id === roomId ? { ...r, x, y } : r)),
          })),
        },
      };
    }

    case 'SET_DRAG_STATE':
      return { ...state, dragState: action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useKosMap() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // isHydrated gates the save effect so that the initial render with
  // defaultBoardingHouse never overwrites stored data before it is loaded.
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'HYDRATE', payload: saved });
    }
    setIsHydrated(true);
  }, []);

  // Persist whenever boardingHouse changes, but only after hydration
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage(state.boardingHouse);
  }, [isHydrated, state.boardingHouse]);

  // ---------------------------------------------------------------------------
  // Convenience action dispatchers
  // ---------------------------------------------------------------------------

  const actions = {
    setMode: (mode: AppMode) =>
      dispatch({ type: 'SET_MODE', payload: mode }),

    setActiveFloor: (floorId: string) =>
      dispatch({ type: 'SET_ACTIVE_FLOOR', payload: floorId }),

    selectRoom: (roomId: string) =>
      dispatch({ type: 'SELECT_ROOM', payload: roomId }),

    deselectRoom: () =>
      dispatch({ type: 'DESELECT_ROOM' }),

    updateHouseName: (name: string) =>
      dispatch({ type: 'UPDATE_HOUSE_NAME', payload: name }),

    addFloor: (name: string) =>
      dispatch({ type: 'ADD_FLOOR', payload: { id: crypto.randomUUID(), name } }),

    renameFloor: (id: string, name: string) =>
      dispatch({ type: 'RENAME_FLOOR', payload: { id, name } }),

    deleteFloor: (id: string) =>
      dispatch({ type: 'DELETE_FLOOR', payload: id }),

    addRoom: (floorId: string, roomData: Omit<Room, 'id'>) =>
      dispatch({
        type: 'ADD_ROOM',
        payload: { floorId, room: { ...roomData, id: crypto.randomUUID() } },
      }),

    updateRoom: (floorId: string, room: Room) =>
      dispatch({ type: 'UPDATE_ROOM', payload: { floorId, room } }),

    deleteRoom: (floorId: string, roomId: string) =>
      dispatch({ type: 'DELETE_ROOM', payload: { floorId, roomId } }),

    moveRoom: (floorId: string, roomId: string, x: number, y: number) =>
      dispatch({ type: 'MOVE_ROOM', payload: { floorId, roomId, x, y } }),

    setDragState: (dragState: DragState | null) =>
      dispatch({ type: 'SET_DRAG_STATE', payload: dragState }),
  };

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const activeFloor =
    state.boardingHouse.floors.find(f => f.id === state.activeFloorId) ??
    state.boardingHouse.floors[0];

  const selectedRoom =
    activeFloor?.rooms.find(r => r.id === state.selectedRoomId) ?? null;

  return { state, actions, activeFloor, selectedRoom };
}
