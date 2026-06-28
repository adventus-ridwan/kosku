'use client';

import type { PropertyContact } from '@/features/property/types';

interface ContactSectionProps {
  value:    PropertyContact;
  onChange: (value: PropertyContact) => void;
  disabled: boolean;
}

export function ContactSection({ value, onChange, disabled }: ContactSectionProps) {
  function patch(partial: Partial<PropertyContact>) {
    onChange({ ...value, ...partial });
  }

  const inputClass =
    'w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">WhatsApp</label>
        <input
          type="tel"
          value={value.whatsapp}
          onChange={e => patch({ whatsapp: e.target.value })}
          disabled={disabled}
          placeholder="Contoh: 081234567890"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Telepon</label>
        <input
          type="tel"
          value={value.phone}
          onChange={e => patch({ phone: e.target.value })}
          disabled={disabled}
          placeholder="Contoh: 02112345678"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Email</label>
        <input
          type="email"
          value={value.email}
          onChange={e => patch({ email: e.target.value })}
          disabled={disabled}
          placeholder="Contoh: kos@example.com"
          className={inputClass}
        />
      </div>
    </div>
  );
}
