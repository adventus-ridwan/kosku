import type { Room, RoomType, RoomAmenity, PublishStatus } from '@/types';
import { DEFAULT_ROOM_AMENITIES } from '@/features/rooms/defaults';

export interface ResolvedRoomProfile {
  typeName:      string | null;
  price:         number | undefined;
  description:   string;
  amenities:     RoomAmenity[];
  size:          number | undefined;
  capacity:      number | undefined;
  publishStatus: PublishStatus;
}

/**
 * Single source of truth for a room's effective profile.
 * Resolution chain per field: room override → type canonical → hardcoded default.
 * Never reads from storage — pass the current roomTypes array from state.
 */
export function resolveRoomProfile(room: Room, roomTypes: RoomType[]): ResolvedRoomProfile {
  const type = room.roomTypeId
    ? (roomTypes.find(t => t.id === room.roomTypeId) ?? null)
    : null;

  return {
    typeName:      type?.name ?? null,
    price:         room.priceOverride ?? type?.price,
    description:   room.description?.trim() || type?.description || '',
    amenities:     room.roomAmenities?.length
                     ? room.roomAmenities
                     : (type?.amenities ?? DEFAULT_ROOM_AMENITIES),
    size:          room.size ?? type?.size,
    capacity:      room.capacity ?? type?.capacity,
    publishStatus: room.publishStatus ?? type?.publishStatus ?? 'draft',
  };
}
