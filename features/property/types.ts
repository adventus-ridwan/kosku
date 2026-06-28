export type PropertyType = 'MALE' | 'FEMALE' | 'MIXED';

export interface PropertyContact {
  whatsapp: string;
  phone:    string;
  email:    string;
  // Future: instagram: string; tiktok: string;
}

export interface PropertyAddress {
  full: string;
  // Future: googleMapsUrl: string; lat: number; lng: number;
}

export interface PropertyAmenity {
  id:        string; // semantic for defaults ('wifi'); UUID for user-added
  name:      string;
  icon:      string; // emoji
  available: boolean;
}

export interface PropertyRule {
  id:   string; // crypto.randomUUID()
  text: string;
}

export type GalleryCategorySlug =
  | 'cover' | 'exterior' | 'rooms' | 'facilities' | 'environment';

export interface GalleryCategory {
  slug:       GalleryCategorySlug;
  label:      string;
  imageCount: number; // placeholder — becomes derived when images are real
  // Future: images: GalleryImage[]
}

export interface PropertyGalleryConfig {
  categories: GalleryCategory[];
}
