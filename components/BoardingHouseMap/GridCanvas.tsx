import type { Floor, RoomStatus } from '@/types';
import { RoomTile } from './RoomTile';

const LEGEND: { status: RoomStatus; label: string; color: string }[] = [
  { status: 'available',   label: 'Tersedia',  color: 'bg-emerald-500' },
  { status: 'occupied',    label: 'Terisi',    color: 'bg-blue-500' },
  { status: 'maintenance', label: 'Perbaikan', color: 'bg-amber-500' },
];

interface GridCanvasProps {
  floor: Floor;
  gridCols: number;
  gridRows: number;
}

export function GridCanvas({ floor, gridCols, gridRows }: GridCanvasProps) {
  const totalCells = gridCols * gridRows;

  const counts = floor.rooms.reduce<Partial<Record<RoomStatus, number>>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {},
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm">
        <span className="font-semibold text-gray-800">{floor.rooms.length} kamar</span>
        <span className="text-gray-300" aria-hidden>•</span>
        <span className="text-emerald-700">{counts.available ?? 0} tersedia</span>
        <span className="text-gray-300" aria-hidden>•</span>
        <span className="text-blue-700">{counts.occupied ?? 0} terisi</span>
        {(counts.maintenance ?? 0) > 0 && (
          <>
            <span className="text-gray-300" aria-hidden>•</span>
            <span className="text-amber-700">{counts.maintenance} perbaikan</span>
          </>
        )}
      </div>

      {/* Grid
          Two layers share the same CSS Grid definition.
          Background cells (DOM-first) sit below room tiles (DOM-last).
          CSS Grid stacks explicit-placed items by DOM order without z-index. */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(80px, 1fr))`,
        }}
      >
        {/* Layer 1 — empty cell backgrounds */}
        {Array.from({ length: totalCells }, (_, i) => {
          const col = (i % gridCols) + 1;
          const row = Math.floor(i / gridCols) + 1;
          return (
            <div
              key={`cell-${col}-${row}`}
              className="border border-gray-100 bg-gray-50"
              style={{ gridColumn: col, gridRow: row }}
            />
          );
        })}

        {/* Layer 2 — room tiles (rendered on top via DOM order) */}
        {floor.rooms.map(room => (
          <RoomTile
            key={room.id}
            room={room}
            style={{
              gridColumn: `${room.x + 1} / span ${room.width}`,
              gridRow: `${room.y + 1} / span ${room.height}`,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-gray-100">
        {LEGEND.map(({ status, label, color }) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
