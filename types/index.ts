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
  kind: 'room';
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

// 'gate' is entrance/exit; 'hallway' is intentionally absent — use POI for corridors
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
  | 'gate'
  | 'custom';

export interface Facility {
  kind: 'facility';
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
  description?: string;
}

// POI interaction variants — sealed union; extend here as the product grows
export type POIInteraction =
  | { type: 'navigate-floor'; targetFloorId: string };

// POIs are passive by default; interaction is present only when the POI needs to be interactive
export interface POI {
  kind: 'poi';
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  icon?:        string;
  label?:       string;
  notes?:       string;
  interaction?: POIInteraction;
}

// Unified map object — extend by adding a new | VariantInterface to this union
export type MapObject = Room | Facility | POI;

// Type guards — use for exhaustive switch statements and filter patterns
export function isRoom(o: MapObject): o is Room         { return o.kind === 'room';     }
export function isFacility(o: MapObject): o is Facility { return o.kind === 'facility'; }
export function isPOI(o: MapObject): o is POI           { return o.kind === 'poi';      }

export interface Floor {
  id: string;
  name: string;
  objects: MapObject[];  // unified — replaces separate rooms[] + facilities[]
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
  draggedObjectId: string;  // was roomId — now covers any MapObject kind
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
  selectedObjectId: string | null;  // was selectedRoomId + selectedFacilityId (mutually exclusive pair)
  dragState: DragState | null;
}
