import type {
  PropertyType,
  PropertyContact,
  PropertyAddress,
  PropertyAmenity,
  PropertyRule,
  PropertyGalleryConfig,
} from '@/features/property/types';

import type {
  PublishStatus,
  RoomAmenity,
} from '@/features/rooms/types';

export type {
  PropertyType,
  PropertyContact,
  PropertyAddress,
  PropertyAmenity,
  PropertyRule,
  PropertyGalleryConfig,
  PublishStatus,
  RoomAmenity,
};

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

  // Profile fields (ET-003) — marketing data, managed in workspace RoomPanel
  // Operational data (status, price, tenant, contract) stays in the map RoomDrawer
  publishStatus?: PublishStatus;
  description?:   string;
  size?:          number;   // sq meters
  capacity?:      number;   // max occupants
  roomAmenities?: RoomAmenity[];
}

export type FacilityType =
  | 'stair'
  | 'parking'
  | 'kitchen'
  | 'bathroom'
  | 'laundry'
  | 'mushola'
  | 'storage'
  | 'lobby'
  | 'garden'
  | 'custom';

export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;   // CSS hex background color (overrides type default for 'custom')
  icon: string;    // emoji character
  notes: string;
}

export interface Floor {
  id: string;
  name: string;
  rooms: Room[];
  facilities: Facility[];
}

export interface BoardingHouse {
  id: string;
  name: string;
  gridCols: number;
  gridRows: number;
  floors: Floor[];

  // Profile fields (ET-002) — all optional so existing code compiles unchanged
  tagline?:     string;
  description?: string;
  type?:        PropertyType;
  contact?:     PropertyContact;
  address?:     PropertyAddress;
  amenities?:   PropertyAmenity[];
  rules?:       PropertyRule[];
  gallery?:     PropertyGalleryConfig;
}

export type AppMode = 'view' | 'edit';

export type UsageMode = 'public' | 'admin';

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
  selectedFacilityId: string | null;
  dragState: DragState | null;
}
