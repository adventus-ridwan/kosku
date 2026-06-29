import type { RoomTypePhoto } from '@/types';

// Placeholder gallery architecture
// ─────────────────────────────────
// Images are selected by a (tier × category) matrix.
// Every cell resolves to exactly one LoremFlickr URL:
//
//   https://loremflickr.com/640/400/{tag}?lock={N}
//
// Single-keyword tags are used intentionally — multi-tag queries require
// Flickr photos to carry ALL specified tags simultaneously, which produces
// small pools that LoremFlickr fills with its own gray placeholder.
// Single tags have wide Flickr coverage and always resolve to a real photo.
//
// Lock numbers are globally unique across the entire table so every cell
// always shows a distinct image.  Different lock numbers on the same tag
// draw different photos from the same semantic pool, giving each tier a
// visually distinct set without sacrificing reliability.
//
// Future: when an owner uploads real photos into RoomType.photos,
// resolveRoomProfile prefers those over this fallback automatically.

type Tier = 'economy' | 'regular' | 'exclusive' | 'premium';

function ph(tag: string, lock: number): string {
  return `https://loremflickr.com/640/400/${tag}?lock=${lock}`;
}

// ── Tier × Category matrix ────────────────────────────────────────────────────
//
// Economy   — single bed, basic furniture, shared bathroom
// Regular   — cleaner room, better furniture, study desk, private bathroom
// Exclusive — modern interior, AC, private bathroom, workspace, balcony
// Premium   — hotel-like finish, luxury materials, all amenities
//
// Absent categories (e.g. no balcony for economy) are intentionally omitted.

const GALLERY: Record<Tier, RoomTypePhoto[]> = {

  economy: [
    { id: 'eco-bedroom',  url: ph('bedroom',  11), caption: 'Kamar Tidur'         },
    { id: 'eco-bathroom', url: ph('bathroom', 12), caption: 'Kamar Mandi Bersama' },
  ],

  regular: [
    { id: 'reg-bedroom',  url: ph('bedroom',  21), caption: 'Kamar Tidur'  },
    { id: 'reg-bathroom', url: ph('bathroom', 22), caption: 'Kamar Mandi'  },
    { id: 'reg-desk',     url: ph('desk',     23), caption: 'Meja Belajar' },
  ],

  exclusive: [
    { id: 'exc-bedroom',  url: ph('bedroom',  31), caption: 'Kamar Tidur' },
    { id: 'exc-bathroom', url: ph('bathroom', 32), caption: 'Kamar Mandi' },
    { id: 'exc-desk',     url: ph('desk',     33), caption: 'Area Kerja'  },
    { id: 'exc-balcony',  url: ph('balcony',  34), caption: 'Balkon'      },
  ],

  premium: [
    { id: 'pre-bedroom',  url: ph('bedroom',  41), caption: 'Kamar Tidur' },
    { id: 'pre-bathroom', url: ph('bathroom', 42), caption: 'Kamar Mandi' },
    { id: 'pre-desk',     url: ph('desk',     43), caption: 'Area Kerja'  },
    { id: 'pre-balcony',  url: ph('balcony',  44), caption: 'Balkon'      },
  ],

};

// ── Tier classifier ───────────────────────────────────────────────────────────
// premium is tested before exclusive — "premium deluxe" maps to the top tier.

function classifyTier(name: string): Tier {
  const n = name.toLowerCase();
  if (/premium|luxury|mewah/.test(n))                   return 'premium';
  if (/deluxe|exclusive|eksklusif|vip|suite/.test(n))   return 'exclusive';
  if (/ekonom|economy|basic|dasar|hemat|murah/.test(n)) return 'economy';
  return 'regular';
}

export function getDummyGallery(typeName: string): RoomTypePhoto[] {
  return GALLERY[classifyTier(typeName)];
}
