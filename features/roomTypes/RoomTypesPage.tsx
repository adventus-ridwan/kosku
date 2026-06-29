'use client';

import { useState } from 'react';
import type { RoomType } from '@/types';
import { useRoomTypes } from './useRoomTypes';
import { RoomTypePanel } from './RoomTypePanel';

const PUBLISH_BADGE: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-500',
  published: 'bg-emerald-100 text-emerald-700',
  archived:  'bg-amber-100 text-amber-700',
};

const PUBLISH_LABEL: Record<string, string> = {
  draft:     'Draft',
  published: 'Publik',
  archived:  'Arsip',
};

export function RoomTypesPage() {
  const {
    roomTypes, isLoading, addRoomType, updateRoomType, deleteRoomType, roomCountByType,
  } = useRoomTypes();

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isCreating, setIsCreating]         = useState(false);

  const isPanelOpen = isCreating || selectedTypeId !== null;
  const editingType: RoomType | null = selectedTypeId
    ? (roomTypes.find(t => t.id === selectedTypeId) ?? null)
    : null;

  function handleCreate(data: Omit<RoomType, 'id'>) {
    addRoomType(data);
    setIsCreating(false);
  }

  function handleUpdate(rt: RoomType) {
    updateRoomType(rt);
    setSelectedTypeId(null);
  }

  function handleDelete(id: string) {
    const ok = deleteRoomType(id);
    if (ok) setSelectedTypeId(null);
  }

  function handleClose() {
    setIsCreating(false);
    setSelectedTypeId(null);
  }

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <span className="text-sm text-gray-400">Memuat…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Tipe Kamar</h1>
              <p className="text-sm text-gray-400 mt-0.5">{roomTypes.length} tipe</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedTypeId(null); setIsCreating(true); }}
              className="shrink-0 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Tambah Tipe
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {roomTypes.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400 mb-1">Belum ada tipe kamar.</p>
                <p className="text-xs text-gray-300">
                  Buat tipe untuk mengelompokkan kamar dengan profil serupa.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {roomTypes.map(rt => (
                  <RoomTypeListItem
                    key={rt.id}
                    roomType={rt}
                    roomCount={roomCountByType[rt.id] ?? 0}
                    isSelected={rt.id === selectedTypeId}
                    onClick={() => { setIsCreating(false); setSelectedTypeId(rt.id); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <RoomTypePanel
        roomType={isCreating ? null : editingType}
        isOpen={isPanelOpen}
        roomCount={editingType ? (roomCountByType[editingType.id] ?? 0) : 0}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </>
  );
}

interface RoomTypeListItemProps {
  roomType:   RoomType;
  roomCount:  number;
  isSelected: boolean;
  onClick:    () => void;
}

function RoomTypeListItem({ roomType, roomCount, isSelected, onClick }: RoomTypeListItemProps) {
  const status = roomType.publishStatus ?? 'draft';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors',
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{roomType.name}</p>
        {roomType.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{roomType.description}</p>
        )}
      </div>

      <span className="text-xs text-gray-400 shrink-0">
        {roomCount === 0 ? '—' : `${roomCount} kamar`}
      </span>

      <span className={[
        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
        PUBLISH_BADGE[status] ?? PUBLISH_BADGE.draft,
      ].join(' ')}>
        {PUBLISH_LABEL[status] ?? status}
      </span>
    </button>
  );
}
