import type { Room, RoomStatus, LabelColor } from '@/types';

const STATUS_CONFIG: Record<RoomStatus, { badge: string; label: string }> = {
  available:   { badge: 'bg-emerald-100 text-emerald-700', label: 'Tersedia'  },
  occupied:    { badge: 'bg-blue-100 text-blue-700',       label: 'Terisi'    },
  maintenance: { badge: 'bg-amber-100 text-amber-700',     label: 'Perbaikan' },
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

interface RoomHoverCardProps {
  room:           Room;
  resolvedPrice?: number;
  typeName?:      string;
  labelColor?:    LabelColor;
  photoUrl?:      string;
  pos:            { top: number; left: number };
}

export function RoomHoverCard({
  room, resolvedPrice, typeName, labelColor, photoUrl, pos,
}: RoomHoverCardProps) {
  const sc = STATUS_CONFIG[room.status];
  const formattedPrice = resolvedPrice && resolvedPrice > 0
    ? new Intl.NumberFormat('id-ID', {
        style:                 'currency',
        currency:              'IDR',
        maximumFractionDigits: 0,
      }).format(resolvedPrice)
    : null;

  return (
    <div
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 192 }}
      className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden pointer-events-none select-none"
    >
      {/* Photo */}
      {photoUrl && (
        <div className="hover-photo w-full h-28 bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={`Foto kamar ${room.name}`}
            className="w-full h-full object-cover"
            onError={e => {
              const section = (e.currentTarget as HTMLImageElement).closest<HTMLElement>('.hover-photo');
              if (section) section.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <span className="text-base font-bold text-gray-900 leading-none">{room.name}</span>

        {typeName && (
          <span className={[
            'self-start text-[10px] font-medium leading-none px-1.5 py-0.5 rounded-full',
            LABEL_COLOR_CLASSES[labelColor ?? 'gray'],
          ].join(' ')}>
            {typeName}
          </span>
        )}

        <span className={[
          'self-start text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
          sc.badge,
        ].join(' ')}>
          {sc.label}
        </span>

        {formattedPrice && (
          <p className="text-xs font-semibold text-gray-900 pt-1.5 mt-0.5 border-t border-gray-100">
            {formattedPrice}
            <span className="text-[10px] font-normal text-gray-400 ml-1">/ bulan</span>
          </p>
        )}
      </div>
    </div>
  );
}
