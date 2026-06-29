'use client';

import type { PublishStatus } from '@/features/rooms/types';

interface RoomPublishSectionProps {
  value:    PublishStatus;
  onChange: (value: PublishStatus) => void;
  disabled: boolean;
}

export function RoomPublishSection({ value, onChange, disabled }: RoomPublishSectionProps) {
  const isPublished = value === 'published';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {isPublished ? 'Dipublikasikan' : 'Draft'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Aktif saat halaman publik diluncurkan
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(isPublished ? 'draft' : 'published')}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent',
            'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            isPublished ? 'bg-blue-600' : 'bg-gray-200',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
          role="switch"
          aria-checked={isPublished}
        >
          <span
            className={[
              'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
              isPublished ? 'translate-x-5' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>

      {disabled && (
        <p className="text-xs text-gray-400">
          Hanya pemilik yang dapat mengubah status publikasi.
        </p>
      )}
    </div>
  );
}
