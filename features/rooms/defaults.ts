import type { RoomAmenity } from './types';

export const DEFAULT_ROOM_AMENITIES: RoomAmenity[] = [
  { id: 'ac',        name: 'AC',               icon: '❄️',  available: false },
  { id: 'km-dalam',  name: 'Kamar Mandi Dalam', icon: '🚿', available: false },
  { id: 'pemanas',   name: 'Pemanas Air',        icon: '🌡️', available: false },
  { id: 'balkon',    name: 'Balkon',             icon: '🌤️', available: false },
  { id: 'lemari',    name: 'Lemari',             icon: '🗄️', available: false },
  { id: 'meja',      name: 'Meja Belajar',       icon: '📖', available: false },
  { id: 'jendela',   name: 'Jendela',            icon: '🪟', available: false },
];
