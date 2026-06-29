'use client';

import { useState, useEffect, useRef } from 'react';
import type { Room, RoomType } from '@/types';
import type { FlatRoom } from './useRooms';
import { useAuth } from '@/features/auth/useAuth';
import { canEditRoom, canPublishRoom } from '@/features/auth/permission';
import { resolveRoomProfile } from '@/lib/resolveRoomProfile';
import { RoomBasicSection } from './sections/RoomBasicSection';
import { RoomAmenitiesSection } from './sections/RoomAmenitiesSection';
import { RoomPublishSection } from './sections/RoomPublishSection';

type RoomProfilePatch = Partial<Pick<Room, 'description' | 'size' | 'capacity' | 'publishStatus' | 'roomAmenities' | 'roomTypeId' | 'priceOverride'>>;

interface RoomPanelProps {
  selectedRoom: FlatRoom | null;
  roomTypes:    RoomType[];
  onClose:      () => void;
  onSave:       (roomId: string, patch: RoomProfilePatch) => void;
}

const STATUS_LABEL: Record<string, string> = {
  available:   'Tersedia',
  occupied:    'Terisi',
  maintenance: 'Perbaikan',
};

const STATUS_BADGE: Record<string, string> = {
  available:   'bg-emerald-100 text-emerald-700',
  occupied:    'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
};

const sectionClass = 'bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col gap-4';
const sectionTitleClass = 'text-sm font-semibold text-gray-900';

export function RoomPanel({ selectedRoom, roomTypes, onClose, onSave }: RoomPanelProps) {
  const { role } = useAuth();
  const isOpen = selectedRoom !== null;

  const [draft, setDraft] = useState<Room | null>(null);
  const [prevRoomId, setPrevRoomId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // During-render update: reinitialize draft when the selected room changes.
  // Compared by ID — not by object reference — because allRooms creates new
  // objects on every render, making reference equality always false.
  const currentRoomId = selectedRoom?.room.id ?? null;
  if (currentRoomId !== prevRoomId) {
    setPrevRoomId(currentRoomId);
    setDraft(selectedRoom !== null ? selectedRoom.room : null);
    setIsDirty(false);
  }

  // Stable ref so the keyboard effect doesn't re-register on every render.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  function patchDraft(partial: RoomProfilePatch) {
    if (!draft) return;
    setDraft({ ...draft, ...partial });
    setIsDirty(true);
  }

  function handleSave() {
    if (!draft || !selectedRoom) return;
    onSave(draft.id, {
      roomTypeId:    draft.roomTypeId,
      priceOverride: draft.priceOverride,
      description:   draft.description,
      size:          draft.size,
      capacity:      draft.capacity,
      publishStatus: draft.publishStatus,
      roomAmenities: draft.roomAmenities,
    });
    setIsDirty(false);
  }

  function handleDiscard() {
    if (!selectedRoom) return;
    setDraft(selectedRoom.room);
    setIsDirty(false);
  }

  const canEdit    = canEditRoom(role);
  const canPublish = canPublishRoom(role);
  const showFooter = canEdit || canPublish;

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 bg-black/20 z-40 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={[
          'fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50',
          'flex flex-col transition-transform duration-200',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
        {draft && selectedRoom ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-gray-900 shrink-0">{selectedRoom.room.name}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_BADGE[selectedRoom.room.status] ?? ''}`}>
                  {STATUS_LABEL[selectedRoom.room.status] ?? selectedRoom.room.status}
                </span>
                <span className="text-xs text-gray-400 truncate">{selectedRoom.floorName}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded shrink-0"
                aria-label="Tutup"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M15 5L5 15M5 5l10 10" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">

              {/* ── Type assignment ── */}
              {roomTypes.length > 0 && (
                <section className={sectionClass}>
                  <h2 className={sectionTitleClass}>Tipe Kamar</h2>
                  <select
                    value={draft.roomTypeId ?? ''}
                    onChange={e => patchDraft({ roomTypeId: e.target.value || undefined })}
                    disabled={!canEdit}
                    className={[
                      'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'disabled:bg-gray-50 disabled:text-gray-400',
                    ].join(' ')}
                  >
                    <option value="">— Tanpa tipe —</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name}</option>
                    ))}
                  </select>
                  {draft.roomTypeId && (() => {
                    const resolved = resolveRoomProfile(draft, roomTypes);
                    return resolved.typeName ? (
                      <p className="text-xs text-blue-500">
                        Kamar ini mewarisi profil dari tipe &quot;{resolved.typeName}&quot;.
                      </p>
                    ) : null;
                  })()}
                </section>
              )}

              {/* ── Price override ── */}
              <section className={sectionClass}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className={sectionTitleClass}>Harga / Bulan</h2>
                  {(() => {
                    const rt = draft.roomTypeId ? roomTypes.find(t => t.id === draft.roomTypeId) : null;
                    const isInheriting = !draft.priceOverride && !!rt?.price;
                    return isInheriting ? (
                      <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        Dari tipe
                      </span>
                    ) : null;
                  })()}
                </div>
                {(() => {
                  const resolved = resolveRoomProfile(draft, roomTypes);
                  return (
                    <div>
                      <input
                        type="number"
                        value={draft.priceOverride ?? ''}
                        onChange={e => {
                          const val = Number(e.target.value);
                          patchDraft({ priceOverride: e.target.value !== '' && val > 0 ? val : undefined });
                        }}
                        min={0}
                        placeholder={resolved.price ? String(resolved.price) : 'Warisi dari tipe'}
                        disabled={!canEdit}
                        className={[
                          'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900',
                          'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
                          'focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400',
                        ].join(' ')}
                      />
                      {!draft.priceOverride && !resolved.price && (
                        <p className="text-xs text-gray-400 mt-1">Kosongkan untuk mewarisi dari tipe kamar</p>
                      )}
                    </div>
                  );
                })()}
              </section>

              {/* ── Description & sizing ── */}
              <section className={sectionClass}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className={sectionTitleClass}>Deskripsi &amp; Ukuran</h2>
                  {(() => {
                    const rt = draft.roomTypeId ? roomTypes.find(t => t.id === draft.roomTypeId) : null;
                    const isInheriting = !draft.description?.trim() && !!rt?.description;
                    return isInheriting ? (
                      <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        Dari tipe
                      </span>
                    ) : null;
                  })()}
                </div>
                <RoomBasicSection
                  value={{
                    description: draft.description ?? '',
                    size:        draft.size,
                    capacity:    draft.capacity,
                  }}
                  onChange={v => patchDraft({ description: v.description, size: v.size, capacity: v.capacity })}
                  disabled={!canEdit}
                />
              </section>

              {/* ── Amenities ── */}
              <section className={sectionClass}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className={sectionTitleClass}>Fasilitas Kamar</h2>
                  {(() => {
                    const rt = draft.roomTypeId ? roomTypes.find(t => t.id === draft.roomTypeId) : null;
                    const isInheriting = !draft.roomAmenities?.length && !!rt;
                    return isInheriting ? (
                      <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        Dari tipe
                      </span>
                    ) : null;
                  })()}
                </div>
                <RoomAmenitiesSection
                  value={resolveRoomProfile(draft, roomTypes).amenities}
                  onChange={amenities => patchDraft({ roomAmenities: amenities })}
                  disabled={!canEdit}
                />
              </section>

              {/* ── Publish status ── */}
              <section className={sectionClass}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className={sectionTitleClass}>Status Publikasi</h2>
                  {(() => {
                    const rt = draft.roomTypeId ? roomTypes.find(t => t.id === draft.roomTypeId) : null;
                    const isInheriting = !draft.publishStatus && !!rt?.publishStatus;
                    return isInheriting ? (
                      <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        Dari tipe
                      </span>
                    ) : null;
                  })()}
                </div>
                <RoomPublishSection
                  value={resolveRoomProfile(draft, roomTypes).publishStatus}
                  onChange={v => patchDraft({ publishStatus: v })}
                  disabled={!canPublish}
                />
              </section>
            </div>

            {/* Footer */}
            {showFooter && (
              <div className="px-5 py-4 border-t border-gray-200 flex items-center gap-2 shrink-0">
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
          </>
        ) : null}
      </div>
    </>
  );
}
