import type { BoardingHouse } from '@/types';
import { DEFAULT_AMENITIES, DEFAULT_GALLERY_CATEGORIES } from '@/features/property/defaults';

export const DEFAULT_GRID_COLS = 6;
export const DEFAULT_GRID_ROWS = 5;

export const defaultBoardingHouse: BoardingHouse = {
  id: 'bh-default',
  name: 'Kos Ku',
  gridCols: DEFAULT_GRID_COLS,
  gridRows: DEFAULT_GRID_ROWS,
  tagline: '',
  description: '',
  type: 'MIXED',
  contact: { whatsapp: '', phone: '', email: '' },
  address: { full: '' },
  amenities: DEFAULT_AMENITIES,
  rules: [],
  gallery: { categories: DEFAULT_GALLERY_CATEGORIES },
  floors: [
    {
      id: 'floor-1',
      name: 'Lantai 1',
      rooms: [
        { id: 'r-101', name: '101', x: 0, y: 0, width: 1, height: 1, status: 'occupied',    occupant: 'Budi Santoso',  price: 1500000, notes: '' },
        { id: 'r-102', name: '102', x: 1, y: 0, width: 1, height: 1, status: 'available',   occupant: '',              price: 1200000, notes: '' },
        { id: 'r-103', name: '103', x: 2, y: 0, width: 1, height: 1, status: 'occupied',    occupant: 'Siti Rahayu',   price: 1500000, notes: '' },
        { id: 'r-104', name: '104', x: 0, y: 2, width: 1, height: 1, status: 'occupied',    occupant: 'Ahmad Fauzi',   price: 1200000, notes: '' },
        { id: 'r-105', name: '105', x: 1, y: 2, width: 1, height: 1, status: 'maintenance', occupant: '',              price: 1200000, notes: 'Perbaikan AC' },
        { id: 'r-106', name: '106', x: 2, y: 2, width: 1, height: 1, status: 'available',   occupant: '',              price: 1500000, notes: '' },
      ],
      facilities: [],
    },
    {
      id: 'floor-2',
      name: 'Lantai 2',
      rooms: [
        { id: 'r-201', name: '201', x: 0, y: 0, width: 1, height: 1, status: 'occupied',    occupant: 'Dewi Kusuma',   price: 1800000, notes: '' },
        { id: 'r-202', name: '202', x: 1, y: 0, width: 1, height: 1, status: 'available',   occupant: '',              price: 1800000, notes: '' },
        { id: 'r-203', name: '203', x: 0, y: 2, width: 1, height: 1, status: 'occupied',    occupant: 'Rudi Hartono',  price: 1800000, notes: 'Termasuk listrik' },
        { id: 'r-204', name: '204', x: 1, y: 2, width: 1, height: 1, status: 'available',   occupant: '',              price: 1800000, notes: '' },
      ],
      facilities: [],
    },
  ],
};
