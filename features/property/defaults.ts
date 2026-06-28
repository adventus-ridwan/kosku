import type { PropertyAmenity, GalleryCategory } from './types';

export const DEFAULT_AMENITIES: PropertyAmenity[] = [
  { id: 'wifi',     name: 'WiFi',           icon: '📶', available: false },
  { id: 'parking',  name: 'Parkir',         icon: '🚗', available: false },
  { id: 'kitchen',  name: 'Dapur Bersama',  icon: '🍳', available: false },
  { id: 'laundry',  name: 'Laundry',        icon: '👕', available: false },
  { id: 'cctv',     name: 'CCTV',           icon: '📷', available: false },
  { id: 'musholla', name: 'Musholla',       icon: '🕌', available: false },
];

export const DEFAULT_GALLERY_CATEGORIES: GalleryCategory[] = [
  { slug: 'cover',       label: 'Cover',      imageCount: 0 },
  { slug: 'exterior',    label: 'Eksterior',  imageCount: 0 },
  { slug: 'rooms',       label: 'Kamar',      imageCount: 0 },
  { slug: 'facilities',  label: 'Fasilitas',  imageCount: 0 },
  { slug: 'environment', label: 'Lingkungan', imageCount: 0 },
];
