import type { FacilityType } from '@/types';

export interface FacilityTypeConfig {
  label: string;
  icon: string;
  bg: string;     // CSS hex background
  text: string;   // CSS hex text color
  border: string; // CSS hex border color
}

export const FACILITY_TYPE_CONFIG: Record<FacilityType, FacilityTypeConfig> = {
  stair:    { label: 'Tangga',      icon: '🪜', bg: '#f1f5f9', text: '#475569', border: '#94a3b8' },
  parking:  { label: 'Parkir',      icon: '🅿️', bg: '#f4f4f5', text: '#52525b', border: '#a1a1aa' },
  kitchen:  { label: 'Dapur',       icon: '🍳', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  bathroom: { label: 'Kamar Mandi', icon: '🚿', bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
  laundry:  { label: 'Laundry',     icon: '🫧', bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  mushola:  { label: 'Mushola',     icon: '🕌', bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  storage:  { label: 'Gudang',      icon: '📦', bg: '#fefce8', text: '#a16207', border: '#fde047' },
  lobby:    { label: 'Lobby',       icon: '🏛️', bg: '#f5f3ff', text: '#6d28d9', border: '#c4b5fd' },
  garden:   { label: 'Taman',       icon: '🌿', bg: '#f7fee7', text: '#3f6212', border: '#bef264' },
  gate:     { label: 'Gerbang',     icon: '🚪', bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
  custom:   { label: 'Kustom',      icon: '⭐', bg: '#f9fafb', text: '#374151', border: '#d1d5db' },
};

export const FACILITY_TYPE_OPTIONS: FacilityType[] = [
  'stair', 'parking', 'kitchen', 'bathroom', 'laundry',
  'mushola', 'storage', 'lobby', 'garden', 'gate', 'custom',
];
