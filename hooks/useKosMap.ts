'use client';

import { useReducer, useEffect, useRef } from 'react';
import type {
  AppState,
  AppMode,
  DragState,
  Room,
  Floor,
  Facility,
  MapObject,
  BoardingHouse,
} from '@/types';
import { isRoom, isFacility } from '@/types';
import { defaultBoardingHouse } from '@/lib/defaults';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { loadWorkspaceSession, saveWorkspaceSession } from '@/lib/workspaceSession';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

type KosAction =
  | { type: 'HYDRATE'; payload: BoardingHouse }
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_ACTIVE_FLOOR'; payload: string }
  | { type: 'SELECT_OBJECT'; payload: string }
  | { type: 'DESELECT_OBJECT' }
  | { type: 'UPDATE_HOUSE_NAME'; payload: string }
  | { type: 'ADD_FLOOR'; payload: { id: string; name: string } }
  | { type: 'RENAME_FLOOR'; payload: { id: string; name: string } }
  | { type: 'DELETE_FLOOR'; payload: string }
  | { type: 'ADD_ROOM'; payload: { floorId: string; room: Room } }
  | { type: 'UPDATE_ROOM'; payload: { floorId: string; room: Room } }
  | { type: 'DELETE_ROOM'; payload: { floorId: string; roomId: string } }
  | { type: 'MOVE_ROOM'; payload: { floorId: string; roomId: string; x: number; y: number } }
  | { type: 'ADD_FACILITY'; payload: { floorId: string; facility: Facility } }
  | { type: 'UPDATE_FACILITY'; payload: { floorId: string; facility: Facility } }
  | { type: 'DELETE_FACILITY'; payload: { floorId: string; facilityId: string } }
  | { type: 'SET_DRAG_STATE'; payload: DragState | null };

// ---------------------------------------------------------------------------
// State initializer — reads workspace session so mode + floor survive refresh
// ---------------------------------------------------------------------------

function initAppState(): AppState {
  const session = loadWorkspaceSession();
  return {
    boardingHouse: defaultBoardingHouse,
    mode: session?.mode ?? 'edit',
    activeFloorId: session?.activeFloorId ?? defaultBoardingHouse.floors[0].id,
    selectedObjectId: session?.selectedObjectId ?? null,
    dragState: null,
  };
}

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
      // Preserve the session's activeFloorId if that floor still exists in the loaded data;
      // fall back to the first floor only if the floor was deleted since last session.
      const floorExists = bh.floors.some(f => f.id === state.activeFloorId);
      return {
        ...state,
        boardingHouse: bh,
        activeFloorId: floorExists ? state.activeFloorId : (bh.floors[0]?.id ?? state.activeFloorId),
      };
    }

    case 'SET_MODE':
      return { ...state, mode: action.payload, dragState: null };

    case 'SET_ACTIVE_FLOOR':
      return {
        ...state,
        activeFloorId: action.payload,
        selectedObjectId: null,
      };

    case 'SELECT_OBJECT':
      return { ...state, selectedObjectId: action.payload };

    case 'DESELECT_OBJECT':
      return { ...state, selectedObjectId: null };

    case 'UPDATE_HOUSE_NAME':
      return {
        ...state,
        boardingHouse: { ...state.boardingHouse, name: action.payload },
      };

    case 'ADD_FLOOR': {
      const newFloor: Floor = {
        id: action.payload.id,
        name: action.payload.name,
        objects: [],
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
      if (remaining.length === 0) return state;
      const nextActiveId =
        state.activeFloorId === action.payload ? remaining[0].id : state.activeFloorId;
      return {
        ...state,
        boardingHouse: { ...state.boardingHouse, floors: remaining },
        activeFloorId: nextActiveId,
        selectedObjectId: null,
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
            f => ({ ...f, objects: [...f.objects, action.payload.room] }),
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
              objects: f.objects.map((obj): MapObject =>
                isRoom(obj) && obj.id === action.payload.room.id ? action.payload.room : obj,
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
              objects: f.objects.filter(
                obj => !(isRoom(obj) && obj.id === action.payload.roomId),
              ),
            }),
          ),
        },
        selectedObjectId:
          state.selectedObjectId === action.payload.roomId ? null : state.selectedObjectId,
      };

    case 'MOVE_ROOM': {
      const { floorId, roomId, x, y } = action.payload;
      const floor = state.boardingHouse.floors.find(f => f.id === floorId);
      if (!floor) return state;
      const room = floor.objects.filter(isRoom).find(r => r.id === roomId);
      if (!room) return state;

      if (
        x < 0 || y < 0 ||
        x + room.width > state.boardingHouse.gridCols ||
        y + room.height > state.boardingHouse.gridRows
      ) return state;

      const hasOverlap = floor.objects.some(obj => {
        if (isRoom(obj) && obj.id === roomId) return false;
        return cellsOverlap(x, y, room.width, room.height, obj.x, obj.y, obj.width, obj.height);
      });
      if (hasOverlap) return state;

      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(state.boardingHouse.floors, floorId, f => ({
            ...f,
            objects: f.objects.map((obj): MapObject =>
              isRoom(obj) && obj.id === roomId ? { ...obj, x, y } : obj,
            ),
          })),
        },
      };
    }

    case 'ADD_FACILITY':
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(
            state.boardingHouse.floors,
            action.payload.floorId,
            f => ({ ...f, objects: [...f.objects, action.payload.facility] }),
          ),
        },
      };

    case 'UPDATE_FACILITY':
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(
            state.boardingHouse.floors,
            action.payload.floorId,
            f => ({
              ...f,
              objects: f.objects.map((obj): MapObject =>
                isFacility(obj) && obj.id === action.payload.facility.id
                  ? action.payload.facility
                  : obj,
              ),
            }),
          ),
        },
      };

    case 'DELETE_FACILITY':
      return {
        ...state,
        boardingHouse: {
          ...state.boardingHouse,
          floors: updateFloors(
            state.boardingHouse.floors,
            action.payload.floorId,
            f => ({
              ...f,
              objects: f.objects.filter(
                obj => !(isFacility(obj) && obj.id === action.payload.facilityId),
              ),
            }),
          ),
        },
        selectedObjectId:
          state.selectedObjectId === action.payload.facilityId ? null : state.selectedObjectId,
      };

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, dispatch] = useReducer(reducer, undefined as any, initAppState);

  // isMounted gates the save effect so the first render with defaultBoardingHouse
  // never overwrites persisted data before the hydration effect fires.
  const isMounted = useRef(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'HYDRATE', payload: saved });
    }
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    saveToStorage(state.boardingHouse);
  }, [state.boardingHouse]);

  useEffect(() => {
    saveWorkspaceSession({
      version: 1,
      activePropertyId: state.boardingHouse.id,
      activeFloorId: state.activeFloorId,
      selectedObjectId: state.selectedObjectId,
      mode: state.mode,
    });
  }, [state.boardingHouse.id, state.activeFloorId, state.selectedObjectId, state.mode]);

  // ---------------------------------------------------------------------------
  // Convenience action dispatchers
  // ---------------------------------------------------------------------------

  const actions = {
    setMode: (mode: AppMode) =>
      dispatch({ type: 'SET_MODE', payload: mode }),

    setActiveFloor: (floorId: string) =>
      dispatch({ type: 'SET_ACTIVE_FLOOR', payload: floorId }),

    selectObject: (objectId: string) =>
      dispatch({ type: 'SELECT_OBJECT', payload: objectId }),

    deselectObject: () =>
      dispatch({ type: 'DESELECT_OBJECT' }),

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

    addFacility: (floorId: string, facilityData: Omit<Facility, 'id'>) =>
      dispatch({
        type: 'ADD_FACILITY',
        payload: { floorId, facility: { ...facilityData, id: crypto.randomUUID() } },
      }),

    updateFacility: (floorId: string, facility: Facility) =>
      dispatch({ type: 'UPDATE_FACILITY', payload: { floorId, facility } }),

    deleteFacility: (floorId: string, facilityId: string) =>
      dispatch({ type: 'DELETE_FACILITY', payload: { floorId, facilityId } }),

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
    activeFloor?.objects.filter(isRoom).find(r => r.id === state.selectedObjectId) ?? null;

  const selectedFacility =
    activeFloor?.objects.filter(isFacility).find(f => f.id === state.selectedObjectId) ?? null;

  return { state, actions, activeFloor, selectedRoom, selectedFacility };
}
