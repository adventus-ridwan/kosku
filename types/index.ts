export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export interface Room {
  id: string;
  name: string;
  x: number;       // 0-based grid column
  y: number;       // 0-based grid row
  width: number;   // columns spanned (usually 1)
  height: number;  // rows spanned (usually 1)
  status: RoomStatus;
  occupant: string;
  price: number;   // monthly rent in IDR
  notes: string;
}

export interface Floor {
  id: string;
  name: string;
  rooms: Room[];
}

export interface BoardingHouse {
  id: string;
  name: string;
  gridCols: number;
  gridRows: number;
  floors: Floor[];
}

export type AppMode = 'view' | 'edit';

export interface DragState {
  roomId: string;
  floorId: string;
  originX: number;
  originY: number;
  ghostX: number;
  ghostY: number;
  isValid: boolean;
}

export interface AppState {
  boardingHouse: BoardingHouse;
  mode: AppMode;
  activeFloorId: string;
  selectedRoomId: string | null;
  dragState: DragState | null;
}
