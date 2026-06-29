'use client';

import { useRef, useState } from 'react';
import type { Room, RoomStatus, LabelColor } from '@/types';
import { RoomHoverCard } from './RoomHoverCard';

const STATUS_CONFIG: Record<
  RoomStatus,
  { bg: string; border: string; text: string; badgeBg: string; label: string }
> = {
  available: {
    bg:      'bg-emerald-50',
    border:  'border-emerald-300',
    text:    'text-emerald-900',
    badgeBg: 'bg-emerald-500',
    label:   'Tersedia',
  },
  occupied: {
    bg:      'bg-blue-50',
    border:  'border-blue-300',
    text:    'text-blue-900',
    badgeBg: 'bg-blue-500',
    label:   'Terisi',
  },
  maintenance: {
    bg:      'bg-amber-50',
    border:  'border-amber-300',
    text:    'text-amber-900',
    badgeBg: 'bg-amber-500',
    label:   'Perbaikan',
  },
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

interface RoomTileProps {
  room:           Room;
  resolvedPrice?: number;
  typeName?:      string;
  labelColor?:    LabelColor;
  previewPhoto?:  string;       // first photo URL from resolved gallery
  occupantName?:  string;
  style?:         React.CSSProperties;
  onClick?:       () => void;
}

export function RoomTile({
  room, resolvedPrice, typeName, labelColor, previewPhoto, occupantName, style, onClick,
}: RoomTileProps) {
  const cfg = STATUS_CONFIG[room.status];
  const divRef = useRef<HTMLDivElement>(null);
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);

  const formattedPrice =
    resolvedPrice && resolvedPrice > 0
      ? new Intl.NumberFormat('id-ID', {
          style:                 'currency',
          currency:              'IDR',
          maximumFractionDigits: 0,
        }).format(resolvedPrice)
      : null;

  function handleMouseEnter() {
    const rect = divRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cardW = 192;
    const cardH = previewPhoto ? 265 : 145;
    const gap   = 10;

    // Prefer right side; fall back to left if card would overflow viewport
    let left = rect.right + gap;
    if (left + cardW > window.innerWidth - 8) left = rect.left - cardW - gap;

    // Clamp vertical so card never goes below viewport
    let top = rect.top;
    if (top + cardH > window.innerHeight - 8) top = Math.max(8, window.innerHeight - cardH - 8);

    setHoverPos({ top, left });
  }

  function handleMouseLeave() {
    setHoverPos(null);
  }

  return (
    <>
      <div
        ref={divRef}
        style={style}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          cfg.bg, cfg.border, cfg.text,
          'border-2 rounded-lg m-1 p-2.5 flex flex-col gap-1 overflow-hidden shadow-sm',
          onClick ? 'cursor-pointer hover:brightness-[0.93] hover:shadow-md transition-all duration-150' : '',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="font-bold text-sm leading-tight">{room.name}</span>
          <span
            className={`${cfg.badgeBg} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none shrink-0`}
          >
            {cfg.label}
          </span>
        </div>

        {typeName && (
          <span className={[
            'self-start inline-block text-[10px] font-medium leading-none px-1.5 py-0.5 rounded-full truncate max-w-full',
            LABEL_COLOR_CLASSES[labelColor ?? 'gray'],
          ].join(' ')}>
            {typeName}
          </span>
        )}

        {occupantName && (
          <span className="text-xs leading-snug truncate opacity-75">{occupantName}</span>
        )}

        {formattedPrice && (
          <span className="text-xs opacity-50 mt-auto leading-none">{formattedPrice}</span>
        )}
      </div>

      {/* Hover preview card — fixed position, pointer-events-none, disappears on mouseLeave */}
      {hoverPos && (
        <RoomHoverCard
          room={room}
          resolvedPrice={resolvedPrice}
          typeName={typeName}
          labelColor={labelColor}
          photoUrl={previewPhoto}
          pos={hoverPos}
        />
      )}
    </>
  );
}
