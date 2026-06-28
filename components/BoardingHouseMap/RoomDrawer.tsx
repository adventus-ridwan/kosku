import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { Room, RoomStatus, AppMode } from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { useUsageMode } from '@/context/UsageModeContext';
import { canDeleteRoom, canEditRoom, canViewTenantInfo, canViewContractHistory } from '@/features/auth/permission';
import { TenantTab } from '@/features/tenants/TenantTab';
import { useTenant } from '@/features/tenants/useTenant';
import { HistoryTab } from '@/features/history/HistoryTab';

// ─── Status display config ───────────────────────────────────────────────────

const STATUS_LABEL: Record<RoomStatus, string> = {
  available:   'Tersedia',
  occupied:    'Terisi',
  maintenance: 'Perbaikan',
};

const STATUS_BADGE: Record<RoomStatus, string> = {
  available:   'bg-emerald-100 text-emerald-700',
  occupied:    'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
};

const STATUS_ACTIVE: Record<RoomStatus, string> = {
  available:   'bg-emerald-100 text-emerald-800',
  occupied:    'bg-blue-100 text-blue-800',
  maintenance: 'bg-amber-100 text-amber-800',
};

// 'occupied' is a derived state — only the contract lifecycle may set it.
const MANUAL_STATUS_OPTIONS: RoomStatus[] = ['available', 'maintenance'];

// ─── Shared input class (matches AddRoomOverlay) ─────────────────────────────

const FIELD =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
  'focus:border-gray-900 transition-shadow';

// ─── Props ───────────────────────────────────────────────────────────────────

interface RoomDrawerProps {
  room: Room | null;      // null → drawer is hidden
  floorId: string;
  floorRooms: Room[];     // needed for uniqueness validation on save
  mode: AppMode;
  onSave: (floorId: string, room: Room) => void;
  onDelete: (floorId: string, roomId: string) => void;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RoomDrawer({
  room,
  floorId,
  floorRooms,
  mode,
  onSave,
  onDelete,
  onClose,
}: RoomDrawerProps) {
  const { role } = useAuth();
  const usageMode = useUsageMode();
  const effectiveRole = usageMode === 'public' ? null : role;
  const canDelete = canDeleteRoom(effectiveRole);
  const isOpen = room !== null;
  const { tenant, contract } = useTenant(room?.id ?? null);

  // localRoom persists during the close animation so the drawer doesn't
  // flash empty while it's sliding out.
  const [activeTab, setActiveTab] = useState<'information' | 'tenant' | 'history'>('information');
  const [localRoom, setLocalRoom] = useState<Room | null>(room);
  const [nameError, setNameError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync local state when a new room is selected (during-render update).
  const [prevRoom, setPrevRoom] = useState<Room | null>(room);
  if (room !== prevRoom) {
    setPrevRoom(room);
    if (room !== null) {
      setLocalRoom(room);
      setNameError('');
      setStatusError('');
      setConfirmDelete(false);
      setActiveTab('information');
    }
  }

  // Stable refs so keyboard effects don't re-register on every render.
  const onCloseRef = useRef(onClose);
  const modeRef = useRef(mode);
  // Assigned after handleSave is defined below.
  const handleSaveRef = useRef<() => void>(() => undefined);

  // Escape → close; Ctrl/Cmd+S → save when editing.
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

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function handleClose() {
    setConfirmDelete(false);
    setNameError('');
    onClose();
  }

  function update<K extends keyof Room>(key: K, value: Room[K]) {
    setLocalRoom(prev => (prev ? { ...prev, [key]: value } : null));
  }

  function handleSave() {
    if (!canEditRoom(effectiveRole)) return;
    if (!localRoom) return;
    const trimmed = localRoom.name.trim();
    if (!trimmed) {
      setNameError('Nomor kamar tidak boleh kosong');
      return;
    }
    const isDuplicate = floorRooms
      .filter(r => r.id !== localRoom.id)
      .some(r => r.name.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      setNameError('Nomor kamar sudah digunakan di lantai ini');
      return;
    }
    if (contract && localRoom.status !== 'occupied') {
      setStatusError('Status kamar tidak dapat diubah karena masih ada kontrak aktif.');
      return;
    }

    onSave(floorId, { ...localRoom, name: trimmed, price: Math.max(0, localRoom.price) });
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
    if (!localRoom) return;
    onDelete(floorId, localRoom.id);
    onClose();
  }

  function handleRoomOccupied() {
    if (!room) return;
    onSave(floorId, { ...room, status: 'occupied' });
  }

  function handleRoomVacant() {
    if (!room) return;
    onSave(floorId, { ...room, status: 'available' });
  }

  const formattedPrice =
    localRoom && localRoom.price > 0
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(localRoom.price)
      : '—';

  // ─── Render ────────────────────────────────────────────────────────────────

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
        aria-label="Detail kamar"
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
          {mode === 'view' && localRoom ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {localRoom.name}
              </h2>
              <span
                className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[localRoom.status]}`}
              >
                {STATUS_LABEL[localRoom.status]}
              </span>
            </div>
          ) : (
            <h2 className="text-base font-semibold text-gray-900">Edit Kamar</h2>
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

        {/* ── Tabs ── */}
        {localRoom && (
          <div className="flex shrink-0 border-b border-gray-100">
            <button
              type="button"
              onClick={() => { setActiveTab('information'); setConfirmDelete(false); }}
              className={[
                'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'information'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              Information
            </button>
            {canViewTenantInfo(effectiveRole) && (
              <button
                type="button"
                onClick={() => { setActiveTab('tenant'); setConfirmDelete(false); }}
                className={[
                  'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === 'tenant'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                Tenant
              </button>
            )}
            {canViewContractHistory(effectiveRole) && (
              <button
                type="button"
                onClick={() => { setActiveTab('history'); setConfirmDelete(false); }}
                className={[
                  'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === 'history'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                History
              </button>
            )}
          </div>
        )}

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* View mode — read-only description list */}
          {activeTab === 'information' && localRoom && mode === 'view' && (
            <dl className="space-y-5">
              <div>
                <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Harga / Bulan
                </dt>
                <dd className="text-sm font-medium text-gray-900">{formattedPrice}</dd>
              </div>
              {canViewTenantInfo(effectiveRole) && (
                <div>
                  <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Penghuni
                  </dt>
                  <dd className="text-sm text-gray-900">{tenant?.name || '—'}</dd>
                </div>
              )}
              {localRoom.notes && (
                <div>
                  <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Catatan
                  </dt>
                  <dd className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {localRoom.notes}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {/* Edit mode — form */}
          {activeTab === 'information' && localRoom && mode === 'edit' && (
            <div className="space-y-4">

              {/* Nomor Kamar */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nomor Kamar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localRoom.name}
                  onChange={e => { update('name', e.target.value); setNameError(''); }}
                  className={FIELD}
                />
                {nameError && (
                  <p className="text-xs text-red-500 mt-1">{nameError}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Status
                </label>
                {localRoom.status === 'occupied' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-sm font-medium text-blue-800">{STATUS_LABEL.occupied}</span>
                      <span className="ml-auto text-xs text-blue-500">Diatur oleh kontrak aktif</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Selesaikan kontrak terlebih dahulu melalui tab Tenant untuk mengubah status kamar.
                    </p>
                  </div>
                ) : (
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {MANUAL_STATUS_OPTIONS.map((s, i) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { update('status', s); setStatusError(''); }}
                        className={[
                          'flex-1 py-1.5 text-xs font-medium transition-colors',
                          i > 0 ? 'border-l border-gray-200' : '',
                          localRoom.status === s
                            ? STATUS_ACTIVE[s]
                            : 'bg-white text-gray-500 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                )}
                {statusError && (
                  <p className="text-xs text-red-500 mt-1">{statusError}</p>
                )}
              </div>

              {/* Harga */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Harga / Bulan (Rp)
                </label>
                <input
                  type="number"
                  value={localRoom.price}
                  onChange={e => update('price', Math.max(0, Number(e.target.value) || 0))}
                  min={0}
                  className={FIELD}
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Catatan
                </label>
                <textarea
                  value={localRoom.notes}
                  onChange={e => update('notes', e.target.value)}
                  rows={3}
                  placeholder="Catatan tambahan…"
                  className={`${FIELD} resize-none`}
                />
              </div>

            </div>
          )}

          {/* Tenant tab */}
          {activeTab === 'tenant' && localRoom && canViewTenantInfo(effectiveRole) && (
            <TenantTab
              roomId={localRoom.id}
              roomStatus={localRoom.status}
              mode={mode}
              onRoomOccupied={handleRoomOccupied}
              onRoomVacant={handleRoomVacant}
            />
          )}

          {/* History tab */}
          {activeTab === 'history' && localRoom && canViewContractHistory(effectiveRole) && (
            <HistoryTab roomId={localRoom.id} />
          )}
        </div>

        {/* ── Footer (sticky) ── */}
        <footer className="shrink-0 border-t border-gray-100 px-5 py-4">

          {/* View mode — single close button */}
          {activeTab === 'information' && mode === 'view' && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          )}

          {/* Edit mode — save / delete / cancel */}
          {activeTab === 'information' && mode === 'edit' && (
            <>
              {canDelete && confirmDelete ? (
                /* Inline delete confirmation */
                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                  <p className="text-sm font-medium text-red-800 mb-0.5">Delete this room?</p>
                  <p className="text-xs text-red-600 mb-3">This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 border border-red-200 text-red-700 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary actions */
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Simpan
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-4 border border-red-200 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </>
          )}

          {/* Tenant tab — close button */}
          {activeTab === 'tenant' && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          )}

          {/* History tab — close button */}
          {activeTab === 'history' && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}
