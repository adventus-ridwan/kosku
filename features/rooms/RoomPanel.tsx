'use client';

import { useState, useEffect, useRef } from 'react';
import type { Room } from '@/types';
import type { FlatRoom } from './useRooms';
import { useAuth } from '@/features/auth/useAuth';
import { canEditRoom, canPublishRoom } from '@/features/auth/permission';
import { DEFAULT_ROOM_AMENITIES } from './defaults';
import { RoomBasicSection } from './sections/RoomBasicSection';
import { RoomAmenitiesSection } from './sections/RoomAmenitiesSection';
import { RoomPublishSection } from './sections/RoomPublishSection';

type RoomProfilePatch = Partial<Pick<Room, 'description' | 'size' | 'capacity' | 'publishStatus' | 'roomAmenities'>>;

interface RoomPanelProps {
  selectedRoom: FlatRoom | null;
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

export function RoomPanel({ selectedRoom, onClose, onSave }: RoomPanelProps) {
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
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              <section className={sectionClass}>
                <h2 className={sectionTitleClass}>Deskripsi &amp; Ukuran</h2>
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

              <section className={sectionClass}>
                <h2 className={sectionTitleClass}>Fasilitas Kamar</h2>
                <RoomAmenitiesSection
                  value={draft.roomAmenities ?? DEFAULT_ROOM_AMENITIES}
                  onChange={amenities => patchDraft({ roomAmenities: amenities })}
                  disabled={!canEdit}
                />
              </section>

              <section className={sectionClass}>
                <h2 className={sectionTitleClass}>Status Publikasi</h2>
                <RoomPublishSection
                  value={draft.publishStatus ?? 'draft'}
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
