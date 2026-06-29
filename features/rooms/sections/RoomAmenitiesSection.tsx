'use client';

import type { RoomAmenity } from '@/features/rooms/types';

interface RoomAmenitiesSectionProps {
  value:    RoomAmenity[];
  onChange: (value: RoomAmenity[]) => void;
  disabled: boolean;
}

export function RoomAmenitiesSection({ value, onChange, disabled }: RoomAmenitiesSectionProps) {
  function toggle(id: string) {
    onChange(value.map(a => (a.id === id ? { ...a, available: !a.available } : a)));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {value.map(amenity => (
        <button
          key={amenity.id}
          type="button"
          disabled={disabled}
          onClick={() => toggle(amenity.id)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors',
            amenity.available
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-gray-500 border-gray-200',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300',
          ].join(' ')}
        >
          <span>{amenity.icon}</span>
          <span className="font-medium">{amenity.name}</span>
        </button>
      ))}
    </div>
  );
}
