import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { Facility, FacilityType, AppMode } from '@/types';
import { FACILITY_TYPE_CONFIG, FACILITY_TYPE_OPTIONS } from '@/lib/facilityConfig';
import { useAuth } from '@/features/auth/useAuth';
import { canDeleteFacility, canEditFacility } from '@/features/auth/permission';

const FIELD =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
  'focus:border-gray-900 transition-shadow';

interface FacilityDrawerProps {
  facility: Facility | null;
  floorId: string;
  gridCols: number;
  gridRows: number;
  mode: AppMode;
  onSave: (floorId: string, facility: Facility) => void;
  onDelete: (floorId: string, facilityId: string) => void;
  onClose: () => void;
}

export function FacilityDrawer({
  facility, floorId, gridCols, gridRows, mode, onSave, onDelete, onClose,
}: FacilityDrawerProps) {
  const { role } = useAuth();
  const canDelete = canDeleteFacility(role);
  const isOpen = facility !== null;

  const [localFacility, setLocalFacility] = useState<Facility | null>(facility);
  const [widthStr, setWidthStr] = useState<string>(facility ? String(facility.width) : '1');
  const [heightStr, setHeightStr] = useState<string>(facility ? String(facility.height) : '1');
  const [nameError, setNameError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync local state when a different facility is selected (during-render update).
  const [prevFacility, setPrevFacility] = useState<Facility | null>(facility);
  if (facility !== prevFacility) {
    setPrevFacility(facility);
    if (facility !== null) {
      setLocalFacility(facility);
      setWidthStr(String(facility.width));
      setHeightStr(String(facility.height));
      setNameError('');
      setConfirmDelete(false);
    }
  }

  const onCloseRef = useRef(onClose);
  const modeRef = useRef(mode);
  const handleSaveRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setConfirmDelete(false);
        setNameError('');
        onCloseRef.current();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's' && modeRef.current === 'edit') {
        e.preventDefault();
        handleSaveRef.current();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  function handleClose() {
    setConfirmDelete(false);
    setNameError('');
    onClose();
  }

  function update<K extends keyof Facility>(key: K, value: Facility[K]) {
    setLocalFacility(prev => (prev ? { ...prev, [key]: value } : null));
  }

  function handleTypeChange(newType: FacilityType) {
    const cfg = FACILITY_TYPE_CONFIG[newType];
    setLocalFacility(prev =>
      prev ? { ...prev, facilityType: newType, icon: cfg.icon, color: cfg.bg } : null,
    );
  }

  function handleSave() {
    if (!canEditFacility(role)) return;
    if (!localFacility) return;
    const trimmed = localFacility.name.trim();
    if (!trimmed) {
      setNameError('Nama tidak boleh kosong');
      return;
    }
    const cfg = FACILITY_TYPE_CONFIG[localFacility.facilityType];
    const maxWidth = gridCols - localFacility.x;
    const maxHeight = gridRows - localFacility.y;
    onSave(floorId, {
      ...localFacility,
      name: trimmed,
      width: Math.max(1, Math.min(localFacility.width, maxWidth)),
      height: Math.max(1, Math.min(localFacility.height, maxHeight)),
      color: localFacility.facilityType === 'custom'
        ? (localFacility.color || cfg.bg)
        : cfg.bg,
    });
    onClose();
  }

  // Keep refs pointing at the latest callbacks without re-running the keyboard effect.
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
    modeRef.current = mode;
    handleSaveRef.current = handleSave;
  });

  function handleDelete() {
    if (!canDelete) return;
    if (!localFacility) return;
    onDelete(floorId, localFacility.id);
    onClose();
  }

  const cfg = localFacility ? FACILITY_TYPE_CONFIG[localFacility.facilityType] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={handleClose}
        className={[
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer panel */}
      <aside
        aria-label="Detail fasilitas"
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
          {mode === 'view' && localFacility && cfg ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl leading-none shrink-0">{localFacility.icon}</span>
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {localFacility.name}
              </h2>
              <span
                style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
                className="shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border"
              >
                {cfg.label}
              </span>
            </div>
          ) : (
            <h2 className="text-base font-semibold text-gray-900">Edit Fasilitas</h2>
          )}
          <button
            type="button"
            onClick={handleClose}
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
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">

          {/* View mode */}
          {localFacility && mode === 'view' && (
            <dl className="space-y-5">
              <div>
                <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Ukuran
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {localFacility.width} × {localFacility.height} sel
                </dd>
              </div>
              {localFacility.notes && (
                <div>
                  <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Catatan
                  </dt>
                  <dd className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {localFacility.notes}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {/* Edit mode */}
          {localFacility && mode === 'edit' && (
            <div className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localFacility.name}
                  onChange={e => { update('name', e.target.value); setNameError(''); }}
                  className={FIELD}
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis</label>
                <div className="grid grid-cols-5 gap-1">
                  {FACILITY_TYPE_OPTIONS.map(type => {
                    const c = FACILITY_TYPE_CONFIG[type];
                    const isActive = type === localFacility.facilityType;
                    return (
                      <button
                        key={type}
                        type="button"
                        title={c.label}
                        onClick={() => handleTypeChange(type)}
                        style={isActive ? { backgroundColor: c.bg, borderColor: c.border } : {}}
                        className={[
                          'flex items-center justify-center p-2 rounded-md border-2 transition-colors',
                          isActive ? '' : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <span className="text-lg leading-none">{c.icon}</span>
                      </button>
                    );
                  })}
                </div>
                {cfg && <p className="text-[11px] text-gray-500 mt-1">{cfg.label}</p>}
              </div>

              {/* Width × Height */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Lebar (sel)</label>
                  <input
                    type="number"
                    value={widthStr}
                    onChange={e => {
                      setWidthStr(e.target.value);
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) update('width', v);
                    }}
                    min={1}
                    max={gridCols - localFacility.x}
                    className={FIELD}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tinggi (sel)</label>
                  <input
                    type="number"
                    value={heightStr}
                    onChange={e => {
                      setHeightStr(e.target.value);
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) update('height', v);
                    }}
                    min={1}
                    max={gridRows - localFacility.y}
                    className={FIELD}
                  />
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ikon (emoji)</label>
                <input
                  type="text"
                  value={localFacility.icon}
                  onChange={e => update('icon', e.target.value)}
                  placeholder="emoji"
                  className={FIELD}
                />
              </div>

              {/* Color — only shown for custom type */}
              {localFacility.facilityType === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Warna latar</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localFacility.color || '#f9fafb'}
                      onChange={e => update('color', e.target.value)}
                      className="w-10 h-9 rounded border border-gray-200 cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={localFacility.color || '#f9fafb'}
                      onChange={e => update('color', e.target.value)}
                      placeholder="#f9fafb"
                      className={FIELD}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Catatan</label>
                <textarea
                  value={localFacility.notes}
                  onChange={e => update('notes', e.target.value)}
                  rows={3}
                  placeholder="Catatan tambahan…"
                  className={`${FIELD} resize-none`}
                />
              </div>

            </div>
          )}
        </div>

        {/* ── Footer (sticky) ── */}
        <footer className="shrink-0 border-t border-gray-100 px-5 py-4">

          {/* View mode */}
          {mode === 'view' && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          )}

          {/* Edit mode */}
          {mode === 'edit' && (
            <>
              {canDelete && confirmDelete ? (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                  <p className="text-sm font-medium text-red-800 mb-0.5">Delete this facility?</p>
                  <p className="text-xs text-red-600 mb-3">This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Delete
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)}
                      className="flex-1 border border-red-200 text-red-700 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={handleSave}
                    className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    Simpan
                  </button>
                  {canDelete && (
                    <button type="button" onClick={() => setConfirmDelete(true)}
                      className="px-4 border border-red-200 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors">
                      Hapus
                    </button>
                  )}
                  <button type="button" onClick={handleClose}
                    className="px-4 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Batal
                  </button>
                </div>
              )}
            </>
          )}
        </footer>
      </aside>
    </>
  );
}
