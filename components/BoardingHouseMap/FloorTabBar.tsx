'use client';

import { useState, useEffect, useRef } from 'react';
import type { Floor, AppMode } from '@/types';

const MAX_FLOORS = 20;

interface FloorTabBarProps {
  floors: Floor[];        // already sorted by order
  activeFloorId: string;
  mode: AppMode;
  onSelect: (floorId: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReorder: (floorIds: string[]) => void;
}

type Modal =
  | { kind: 'add' }
  | { kind: 'rename'; id: string; currentName: string };

// ─── Modal ────────────────────────────────────────────────────────────────────

interface FloorModalProps {
  modal: Modal;
  floors: Floor[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
}

function FloorModal({ modal, floors, onClose, onAdd, onRename }: FloorModalProps) {
  const defaultName =
    modal.kind === 'add' ? `Lantai ${floors.length + 1}` : modal.currentName;
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function validate(): boolean {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nama lantai tidak boleh kosong.');
      return false;
    }
    const duplicate = floors.some(f => {
      if (modal.kind === 'rename' && f.id === modal.id) return false;
      return f.name.toLowerCase() === trimmed.toLowerCase();
    });
    if (duplicate) {
      setError('Nama lantai sudah digunakan.');
      return false;
    }
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (modal.kind === 'add') onAdd(name.trim());
    else onRename(modal.id, name.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  }

  const title = modal.kind === 'add' ? 'Tambah Lantai' : 'Ubah Nama Lantai';
  const submitLabel = modal.kind === 'add' ? 'Tambah' : 'Simpan';

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
        <h2 className="text-base font-semibold text-slate-900 mb-4">{title}</h2>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Nama</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
          />
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-slate-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FloorTabBar({
  floors,
  activeFloorId,
  mode,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: FloorTabBarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Close ⋮ menu on click outside
  useEffect(() => {
    if (!openMenuId) return;
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-floor-menu]')) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleDeleteAttempt(floor: Floor) {
    setOpenMenuId(null);
    if (floors.length <= 1) {
      setToast('Minimal satu lantai harus ada.');
      return;
    }
    if (floor.objects.length > 0) {
      setToast('Kosongkan lantai ini terlebih dahulu.');
      return;
    }
    onDelete(floor.id);
  }

  // HTML5 drag & drop for tab reordering
  function handleDragStart(e: React.DragEvent, floorId: string) {
    setDraggingId(floorId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', floorId);
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (targetId !== draggingId) setDragOverId(targetId);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const ids = floors.map(f => f.id);
    const fromIdx = ids.indexOf(draggingId);
    const toIdx   = ids.indexOf(targetId);
    const newIds = [...ids];
    newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, draggingId);
    onReorder(newIds);
    setDraggingId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
  }

  const canAdd = floors.length < MAX_FLOORS;

  return (
    <>
      <div className="flex items-end gap-0.5 border-b border-slate-200 mb-5">
        {floors.map(floor => {
          const isActive   = floor.id === activeFloorId;
          const isDragging = floor.id === draggingId;
          const isDragOver = floor.id === dragOverId && !isDragging;

          return (
            <div
              key={floor.id}
              className={[
                'relative flex items-center group',
                mode === 'edit' ? 'cursor-grab' : '',
              ].join(' ')}
              draggable={mode === 'edit'}
              onDragStart={e => handleDragStart(e, floor.id)}
              onDragOver={e => handleDragOver(e, floor.id)}
              onDrop={e => handleDrop(e, floor.id)}
              onDragEnd={handleDragEnd}
            >
              {/* Drop indicator */}
              {isDragOver && (
                <div className="absolute left-0 top-1 bottom-0 w-0.5 bg-amber-500 -translate-x-px rounded-full pointer-events-none" />
              )}

              <button
                type="button"
                onClick={() => { setOpenMenuId(null); onSelect(floor.id); }}
                className={[
                  'px-3 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors select-none',
                  isDragging ? 'opacity-40' : '',
                  isActive
                    ? 'border-amber-500 text-amber-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                {floor.name}
              </button>

              {/* ⋮ menu — edit mode only */}
              {mode === 'edit' && (
                <div className="relative" data-floor-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(prev => (prev === floor.id ? null : floor.id))
                    }
                    className={[
                      'h-6 w-5 flex items-center justify-center rounded text-slate-400',
                      'hover:bg-slate-100 hover:text-slate-600 transition-colors mr-1 -ml-1',
                      'opacity-0 group-hover:opacity-100 focus:opacity-100',
                      openMenuId === floor.id ? '!opacity-100' : '',
                    ].join(' ')}
                    aria-label={`Opsi lantai ${floor.name}`}
                  >
                    ⋮
                  </button>

                  {openMenuId === floor.id && (
                    <div
                      data-floor-menu
                      className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[128px]"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setModal({ kind: 'rename', id: floor.id, currentName: floor.name });
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Ubah Nama
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttempt(floor)}
                        className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* + Tambah button — edit mode only */}
        {mode === 'edit' && (
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => setModal({ kind: 'add' })}
            className={[
              'px-3 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent -mb-px transition-colors',
              canAdd
                ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                : 'text-slate-300 cursor-not-allowed',
            ].join(' ')}
          >
            + Tambah
          </button>
        )}
      </div>

      {modal && (
        <FloorModal
          modal={modal}
          floors={floors}
          onClose={() => setModal(null)}
          onAdd={name => { onAdd(name); setModal(null); }}
          onRename={(id, name) => { onRename(id, name); setModal(null); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg pointer-events-none">
          {toast}
        </div>
      )}
    </>
  );
}
