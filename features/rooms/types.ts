export type PublishStatus = 'draft' | 'published';

export interface RoomAmenity {
  id:        string;
  name:      string;
  icon:      string;
  available: boolean;
}
