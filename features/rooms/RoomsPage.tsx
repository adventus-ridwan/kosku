'use client';

import Link from 'next/link';
import type { RoomStatus, RoomType, LabelColor } from '@/types';
import type { FlatRoom } from './useRooms';
import { useRooms } from './useRooms';
import { resolveRoomProfile } from '@/lib/resolveRoomProfile';

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

const LABEL_COLOR_CLASSES: Record<LabelColor, string> = {
  gray:   'bg-gray-100 text-gray-600',
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-emerald-100 text-emerald-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  red:    'bg-red-100 text-red-700',
  pink:   'bg-pink-100 text-pink-700',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function RoomsPage() {
  const { allRooms, isLoading, roomTypes } = useRooms();

  return (
    isLoading ? (
      <div className="flex items-center justify-center h-40">
        <span className="text-sm text-gray-400">Memuat…</span>
      </div>
    ) : (
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Kamar</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {allRooms.length} kamar · Edit kamar melalui{' '}
              <Link href="/workspace/denah" className="text-blue-500 hover:text-blue-600 transition-colors">
                Denah
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {allRooms.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">Belum ada kamar.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {allRooms.map(flatRoom => (
                <RoomListItem
                  key={flatRoom.room.id}
                  flatRoom={flatRoom}
                  roomTypes={roomTypes}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  );
}

interface RoomListItemProps {
  flatRoom:  FlatRoom;
  roomTypes: RoomType[];
}

function RoomListItem({ flatRoom, roomTypes }: RoomListItemProps) {
  const { room, floorName } = flatRoom;
  const resolved = resolveRoomProfile(room, roomTypes);
  const publishStatus = resolved.publishStatus;
  const typeName = resolved.typeName;
  const labelColor = resolved.labelColor ?? 'gray';

  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <span className="font-semibold text-gray-900 text-sm w-10 shrink-0">{room.name}</span>
      <span className="text-xs text-gray-400 w-20 shrink-0">{floorName}</span>
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_BADGE[room.status]}`}>
        {STATUS_LABEL[room.status]}
      </span>
      <span className="text-sm text-gray-600 flex-1">{resolved.price ? formatPrice(resolved.price) : '—'}</span>
      {typeName && (
        <span className={[
          'inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 max-w-[100px] truncate',
          LABEL_COLOR_CLASSES[labelColor],
        ].join(' ')}>
          {typeName}
        </span>
      )}
      <span
        className={[
          'inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
          publishStatus === 'published'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-500',
        ].join(' ')}
      >
        {publishStatus === 'published' ? 'Publik' : 'Draft'}
      </span>
    </div>
  );
}
