import type { Room, RoomType, RoomAmenity, PublishStatus, LabelColor, RoomTypePhoto } from '@/types';
import { DEFAULT_ROOM_AMENITIES } from '@/features/rooms/defaults';
import { getDummyGallery } from './dummyGallery';

export interface ResolvedRoomProfile {
  typeName:      string | null;
  labelColor:    LabelColor | undefined;
  price:         number | undefined;
  description:   string;
  amenities:     RoomAmenity[];
  size:          number | undefined;
  capacity:      number | undefined;
  publishStatus: PublishStatus;
  // Resolved gallery: stored type photos → dummy gallery → [] if no type assigned.
  // Future room-level override follows the same priceOverride pattern.
  photos:        RoomTypePhoto[];
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

  const photos = type
    ? (type.photos?.length ? type.photos : getDummyGallery(type.name))
    : [];

  return {
    typeName:      type?.name ?? null,
    labelColor:    type?.labelColor,
    price:         room.priceOverride ?? type?.price,
    description:   room.description?.trim() || type?.description || '',
    amenities:     room.roomAmenities?.length
                     ? room.roomAmenities
                     : (type?.amenities ?? DEFAULT_ROOM_AMENITIES),
    size:          room.size ?? type?.size,
    capacity:      room.capacity ?? type?.capacity,
    publishStatus: room.publishStatus ?? type?.publishStatus ?? 'draft',
    photos,
  };
}
