'use client';

import type { PropertyGalleryConfig } from '@/features/property/types';

interface GallerySectionProps {
  value: PropertyGalleryConfig;
}

export function GallerySection({ value }: GallerySectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {value.categories.map(cat => (
          <div
            key={cat.slug}
            className="flex flex-col gap-2 p-4 rounded-xl border border-gray-200 border-dashed bg-gray-50"
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {cat.label}
            </span>
            <span className="text-xs text-gray-400">{cat.imageCount} foto</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Upload foto akan tersedia di v0.5.</p>
    </div>
  );
}
