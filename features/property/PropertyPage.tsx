'use client';

import { useState } from 'react';
import type { BoardingHouse } from '@/types';
import type { PropertyType, PropertyContact, PropertyAddress, PropertyAmenity, PropertyRule, PropertyGalleryConfig } from '@/features/property/types';
import { DEFAULT_AMENITIES, DEFAULT_GALLERY_CATEGORIES } from '@/features/property/defaults';
import { useAuth } from '@/features/auth/useAuth';
import { canEditPropertyProfile } from '@/features/auth/permission';
import { usePropertyProfile } from './usePropertyProfile';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ContactSection } from './sections/ContactSection';
import { LocationSection } from './sections/LocationSection';
import { AmenitiesSection } from './sections/AmenitiesSection';
import { RulesSection } from './sections/RulesSection';
import { GallerySection } from './sections/GallerySection';

const sectionClass = 'bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4';
const sectionTitleClass = 'text-sm font-semibold text-gray-900';

export function PropertyPage() {
  const { boardingHouse, isLoading, saveProfile } = usePropertyProfile();
  const { role } = useAuth();
  const canEdit = canEditPropertyProfile(role);

  const [draft, setDraft] = useState<BoardingHouse | null>(null);
  const [prevBH, setPrevBH] = useState<BoardingHouse | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // During-render update: initialize draft once hydration completes.
  // Guarded by !isLoading so we never initialize from the SSR default state.
  if (!isLoading && boardingHouse !== prevBH) {
    setPrevBH(boardingHouse);
    if (draft === null) {
      setDraft(boardingHouse);
    }
  }

  function patchDraft(partial: Partial<BoardingHouse>) {
    if (!draft) return;
    setDraft({ ...draft, ...partial });
    setIsDirty(true);
  }

  function handleSave() {
    if (!draft) return;
    saveProfile(draft);
    setIsDirty(false);
  }

  function handleDiscard() {
    setDraft(boardingHouse);
    setIsDirty(false);
  }

  if (isLoading || !draft) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-sm text-gray-400">Memuat…</span>
      </div>
    );
  }

  const contact: PropertyContact   = draft.contact  ?? { whatsapp: '', phone: '', email: '' };
  const address: PropertyAddress   = draft.address  ?? { full: '' };
  const amenities: PropertyAmenity[] = draft.amenities ?? DEFAULT_AMENITIES;
  const rules: PropertyRule[]      = draft.rules    ?? [];
  const gallery: PropertyGalleryConfig = draft.gallery ?? { categories: DEFAULT_GALLERY_CATEGORIES };
  const type: PropertyType         = draft.type     ?? 'MIXED';

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Properti</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Kelola informasi properti Anda.{' '}
            <a
              href="/kos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Lihat tampilan publik →
            </a>
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscard}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batalkan
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Simpan
            </button>
          </div>
        )}
      </div>

      {/* Informasi Dasar */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Informasi Dasar</h2>
        <BasicInfoSection
          value={{
            name:        draft.name,
            tagline:     draft.tagline ?? '',
            description: draft.description ?? '',
            type,
          }}
          onChange={v => patchDraft({
            name:        v.name,
            tagline:     v.tagline,
            description: v.description,
            type:        v.type,
          })}
          disabled={!canEdit}
        />
      </section>

      {/* Kontak */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Kontak</h2>
        <ContactSection
          value={contact}
          onChange={c => patchDraft({ contact: c })}
          disabled={!canEdit}
        />
      </section>

      {/* Lokasi */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Lokasi</h2>
        <LocationSection
          value={address}
          onChange={a => patchDraft({ address: a })}
          disabled={!canEdit}
        />
      </section>

      {/* Fasilitas */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Fasilitas</h2>
        <AmenitiesSection
          value={amenities}
          onChange={a => patchDraft({ amenities: a })}
          disabled={!canEdit}
        />
      </section>

      {/* Peraturan Rumah */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Peraturan Rumah</h2>
        <RulesSection
          value={rules}
          onChange={r => patchDraft({ rules: r })}
          disabled={!canEdit}
        />
      </section>

      {/* Galeri */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Galeri</h2>
        <GallerySection value={gallery} />
      </section>
    </div>
  );
}
