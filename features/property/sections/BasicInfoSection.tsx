'use client';

import type { PropertyType } from '@/features/property/types';

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'MIXED',  label: 'Campur' },
  { value: 'MALE',   label: 'Putra' },
  { value: 'FEMALE', label: 'Putri' },
];

interface BasicInfoValue {
  name:        string;
  tagline:     string;
  description: string;
  type:        PropertyType;
}

interface BasicInfoSectionProps {
  value:    BasicInfoValue;
  onChange: (value: BasicInfoValue) => void;
  disabled: boolean;
}

export function BasicInfoSection({ value, onChange, disabled }: BasicInfoSectionProps) {
  function patch(partial: Partial<BasicInfoValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Nama Properti</label>
        <input
          type="text"
          value={value.name}
          onChange={e => patch({ name: e.target.value })}
          disabled={disabled}
          placeholder="Contoh: Kos Melati"
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Tagline</label>
        <input
          type="text"
          value={value.tagline}
          onChange={e => patch({ tagline: e.target.value })}
          disabled={disabled}
          placeholder="Contoh: Kos nyaman dekat kampus"
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Deskripsi</label>
        <textarea
          value={value.description}
          onChange={e => patch({ description: e.target.value })}
          disabled={disabled}
          placeholder="Ceritakan keunggulan properti Anda…"
          rows={4}
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Jenis Penghuni</label>
        <div className="flex gap-2 flex-wrap">
          {PROPERTY_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => patch({ type: opt.value })}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                value.type === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
