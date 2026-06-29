'use client';

import { useState } from 'react';
import type { RoomTypePhoto } from '@/types';

// Renders a single photo thumbnail.  Per-photo state tracks load failure so
// a broken or missing image is always replaced by a styled fallback — the
// gallery strip never shows a blank slot or a browser broken-image icon.
function PhotoItem({ photo }: { photo: RoomTypePhoto }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="shrink-0 flex flex-col gap-1">
      <div className="w-36 h-24 rounded-lg overflow-hidden bg-slate-100">
        {failed ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <circle cx="12" cy="12" r="4" />
              <path d="M7.5 5 9 3h6l1.5 2" />
            </svg>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.caption ?? 'Foto kamar'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {photo.caption && (
        <span className="block text-[10px] text-gray-400 text-center w-36 truncate">
          {photo.caption}
        </span>
      )}
    </div>
  );
}

interface GalleryStripProps {
  photos: RoomTypePhoto[];
}

export function GalleryStrip({ photos }: GalleryStripProps) {
  if (photos.length === 0) return null;

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
    >
      {photos.map(photo => (
        <PhotoItem key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
