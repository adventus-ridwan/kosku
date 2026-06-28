import type { Room, RoomStatus } from '@/types';

const STATUS_CONFIG: Record<
  RoomStatus,
  { bg: string; border: string; text: string; badgeBg: string; label: string }
> = {
  available: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    badgeBg: 'bg-emerald-500',
    label: 'Tersedia',
  },
  occupied: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-900',
    badgeBg: 'bg-blue-500',
    label: 'Terisi',
  },
  maintenance: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    badgeBg: 'bg-amber-500',
    label: 'Perbaikan',
  },
};

interface RoomTileProps {
  room: Room;
  style?: React.CSSProperties;
}

export function RoomTile({ room, style }: RoomTileProps) {
  const cfg = STATUS_CONFIG[room.status];

  const formattedPrice =
    room.price > 0
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(room.price)
      : null;

  return (
    <div
      style={style}
      className={`${cfg.bg} ${cfg.border} ${cfg.text} border-2 rounded-lg m-1 p-2.5 flex flex-col gap-1 overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-bold text-sm leading-tight">{room.name}</span>
        <span
          className={`${cfg.badgeBg} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none shrink-0`}
        >
          {cfg.label}
        </span>
      </div>

      {room.occupant && (
        <span className="text-xs leading-snug truncate opacity-75">{room.occupant}</span>
      )}

      {formattedPrice && (
        <span className="text-xs opacity-50 mt-auto leading-none">{formattedPrice}</span>
      )}
    </div>
  );
}
