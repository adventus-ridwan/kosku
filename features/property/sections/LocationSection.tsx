'use client';

import type { PropertyAddress } from '@/features/property/types';

interface LocationSectionProps {
  value:    PropertyAddress;
  onChange: (value: PropertyAddress) => void;
  disabled: boolean;
}

export function LocationSection({ value, onChange, disabled }: LocationSectionProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600">Alamat Lengkap</label>
      <textarea
        value={value.full}
        onChange={e => onChange({ ...value, full: e.target.value })}
        disabled={disabled}
        placeholder="Contoh: Jl. Melati No. 5, Kel. Sukamaju, Kec. Cibeunying, Bandung 40132"
        rows={3}
        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed resize-none"
      />
    </div>
  );
}
