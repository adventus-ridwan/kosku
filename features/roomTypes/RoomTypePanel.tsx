'use client';

import { useState, useEffect, useRef } from 'react';
import type { RoomType, LabelColor } from '@/types';
import { RoomAmenitiesSection } from '@/features/rooms/sections/RoomAmenitiesSection';
import { RoomPublishSection } from '@/features/rooms/sections/RoomPublishSection';
import { DEFAULT_ROOM_AMENITIES } from '@/features/rooms/defaults';

const PALETTE: { value: LabelColor; label: string; swatch: string; badgeClass: string }[] = [
  { value: 'gray',   label: 'Abu-abu', swatch: 'bg-gray-400',    badgeClass: 'bg-gray-100 text-gray-600'    },
  { value: 'blue',   label: 'Biru',    swatch: 'bg-blue-500',    badgeClass: 'bg-blue-100 text-blue-700'    },
  { value: 'green',  label: 'Hijau',   swatch: 'bg-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-700' },
  { value: 'purple', label: 'Ungu',    swatch: 'bg-purple-500',  badgeClass: 'bg-purple-100 text-purple-700' },
  { value: 'orange', label: 'Oranye',  swatch: 'bg-orange-500',  badgeClass: 'bg-orange-100 text-orange-700' },
  { value: 'red',    label: 'Merah',   swatch: 'bg-red-500',     badgeClass: 'bg-red-100 text-red-700'      },
  { value: 'pink',   label: 'Pink',    swatch: 'bg-pink-500',    badgeClass: 'bg-pink-100 text-pink-700'    },
];

const FIELD =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
  'focus:border-gray-900 transition-shadow';

const sectionClass = 'bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col gap-4';
const sectionTitleClass = 'text-sm font-semibold text-gray-900';

type DraftType = Omit<RoomType, 'id'>;

const EMPTY_DRAFT: DraftType = {
  name:          '',
  description:   '',
  amenities:     DEFAULT_ROOM_AMENITIES,
  photos:        [],
  publishStatus: 'draft',
  labelColor:    'gray',
};

interface RoomTypePanelProps {
  roomType:  RoomType | null;  // null = create mode
  isOpen:    boolean;
  roomCount: number;           // rooms currently assigned — for AC-13 delete guard
  onCreate:  (data: DraftType) => void;
  onUpdate:  (rt: RoomType) => void;
  onDelete:  (id: string) => void;
  onClose:   () => void;
}

export function RoomTypePanel({
  roomType, isOpen, roomCount, onCreate, onUpdate, onDelete, onClose,
}: RoomTypePanelProps) {
  const isCreateMode = roomType === null;

  const [draft, setDraft] = useState<DraftType>(EMPTY_DRAFT);
  const [isDirty, setIsDirty] = useState(false);
  const [nameError, setNameError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reinitialize draft when the panel opens with a different type or switches to create mode
  const [prevRoomType, setPrevRoomType] = useState<RoomType | null | undefined>(undefined);
  if (roomType !== prevRoomType) {
    setPrevRoomType(roomType);
    setDraft(roomType ?? EMPTY_DRAFT);
    setIsDirty(false);
    setNameError('');
    setConfirmDelete(false);
  }

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

  function patch(partial: Partial<DraftType>) {
    setDraft(prev => ({ ...prev, ...partial }));
    setIsDirty(true);
  }

  function handleSave() {
    const trimmedName = draft.name.trim();
    if (!trimmedName) {
      setNameError('Nama tipe tidak boleh kosong');
      return;
    }
    const payload: DraftType = { ...draft, name: trimmedName };
    if (isCreateMode) {
      onCreate(payload);
    } else {
      onUpdate({ ...payload, id: roomType.id });
    }
    setIsDirty(false);
  }

  function handleDelete() {
    if (!roomType) return;
    onDelete(roomType.id);
  }

  const canDelete = !isCreateMode && roomCount === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Panel */}
      <aside
        aria-label={isCreateMode ? 'Tambah tipe kamar' : 'Edit tipe kamar'}
        className={[
          'fixed inset-y-0 right-0 z-50 flex flex-col',
          'w-full sm:w-96',
          'bg-white border-l border-gray-200 shadow-2xl sm:rounded-l-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">
            {isCreateMode ? 'Tipe Kamar Baru' : (roomType?.name || 'Edit Tipe Kamar')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </header>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">

          {/* Name */}
          <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Nama Tipe</h2>
            <div>
              <input
                type="text"
                value={draft.name}
                onChange={e => { patch({ name: e.target.value }); setNameError(''); }}
                placeholder="Contoh: Kamar Standard AC"
                className={FIELD}
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>
          </section>

          {/* Label color */}
          <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Warna Label</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 flex-wrap">
                {PALETTE.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    onClick={() => patch({ labelColor: p.value })}
                    className={[
                      'w-7 h-7 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
                      p.swatch,
                      (draft.labelColor ?? 'gray') === p.value
                        ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                        : 'hover:scale-110',
                    ].join(' ')}
                    aria-pressed={(draft.labelColor ?? 'gray') === p.value}
                    aria-label={p.label}
                  />
                ))}
              </div>
              {/* Live preview */}
              {draft.name && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Preview:</span>
                  <span className={[
                    'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                    (PALETTE.find(p => p.value === (draft.labelColor ?? 'gray')) ?? PALETTE[0]).badgeClass,
                  ].join(' ')}>
                    {draft.name}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Description & sizing */}
          <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Deskripsi &amp; Ukuran</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Deskripsi</label>
                <textarea
                  value={draft.description}
                  onChange={e => patch({ description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi umum untuk kamar dengan tipe ini…"
                  className={`${FIELD} resize-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Luas (m²)</label>
                  <input
                    type="number"
                    min={0}
                    value={draft.size ?? ''}
                    onChange={e => patch({ size: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Contoh: 12"
                    className={FIELD}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Maks. Penghuni</label>
                  <input
                    type="number"
                    min={1}
                    value={draft.capacity ?? ''}
                    onChange={e => patch({ capacity: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Contoh: 2"
                    className={FIELD}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Harga Kanonikal (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={draft.price ?? ''}
                  onChange={e => patch({ price: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Contoh: 1500000"
                  className={FIELD}
                />
                <p className="text-[11px] text-gray-400">
                  Kamar yang menggunakan tipe ini mewarisi harga ini secara default.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Urutan Tampil</label>
                <input
                  type="number"
                  min={0}
                  value={draft.sortOrder ?? ''}
                  onChange={e => patch({ sortOrder: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Contoh: 1"
                  className={FIELD}
                />
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Fasilitas Default</h2>
            <RoomAmenitiesSection
              value={draft.amenities}
              onChange={amenities => patch({ amenities })}
              disabled={false}
            />
          </section>

          {/* Publish status */}
          <section className={sectionClass}>
            <h2 className={sectionTitleClass}>Status Publikasi Default</h2>
            <RoomPublishSection
              value={draft.publishStatus}
              onChange={v => patch({ publishStatus: v })}
              disabled={false}
            />
          </section>

          {/* Assigned rooms count — shown when editing */}
          {!isCreateMode && (
            <p className="text-xs text-gray-400 text-center">
              {roomCount === 0
                ? 'Belum ada kamar menggunakan tipe ini.'
                : `${roomCount} kamar menggunakan tipe ini.`}
            </p>
          )}

        </div>

        {/* ── Footer (sticky) ── */}
        <footer className="shrink-0 border-t border-gray-100 px-5 py-4">
          {confirmDelete ? (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-sm font-medium text-red-800 mb-0.5">Hapus tipe ini?</p>
              <p className="text-xs text-red-600 mb-3">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-2">
                <button type="button" onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Hapus
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="flex-1 border border-red-200 text-red-700 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors">
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty && !isCreateMode}
                className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isCreateMode ? 'Buat Tipe' : 'Simpan'}
              </button>
              {canDelete && (
                <button type="button" onClick={() => setConfirmDelete(true)}
                  className="px-4 border border-red-200 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors">
                  Hapus
                </button>
              )}
              {!isCreateMode && !canDelete && roomCount > 0 && (
                <span className="text-xs text-gray-400 self-center">
                  Tidak dapat dihapus — {roomCount} kamar aktif
                </span>
              )}
              <button type="button" onClick={onClose}
                className="px-4 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                {isCreateMode ? 'Batal' : 'Tutup'}
              </button>
            </div>
          )}
        </footer>
      </aside>
    </>
  );
}
