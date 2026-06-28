import { useState } from 'react';
import type { Floor, Room, Facility, RoomStatus, AppMode } from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { canAddRoom, canAddFacility } from '@/features/auth/permission';
import { RoomTile } from './RoomTile';
import { FacilityTile } from './FacilityTile';
import { AddRoomOverlay } from './AddRoomOverlay';
import { AddEntityMenu } from './AddEntityMenu';
import { AddFacilityOverlay } from './AddFacilityOverlay';

const LEGEND: { status: RoomStatus; label: string; color: string }[] = [
  { status: 'available',   label: 'Tersedia',  color: 'bg-emerald-500' },
  { status: 'occupied',    label: 'Terisi',    color: 'bg-blue-500' },
  { status: 'maintenance', label: 'Perbaikan', color: 'bg-amber-500' },
];

type Overlay =
  | { kind: 'menu';         x: number; y: number; rect: DOMRect }
  | { kind: 'add-room';     x: number; y: number; rect: DOMRect }
  | { kind: 'add-facility'; x: number; y: number; rect: DOMRect }
  | null;

interface GridCanvasProps {
  floor: Floor;
  gridCols: number;
  gridRows: number;
  mode: AppMode;
  onAddRoom: (floorId: string, roomData: Omit<Room, 'id'>) => void;
  onAddFacility: (floorId: string, facilityData: Omit<Facility, 'id'>) => void;
  onRoomClick: (roomId: string) => void;
  onFacilityClick: (facilityId: string) => void;
}

export function GridCanvas({
  floor, gridCols, gridRows, mode,
  onAddRoom, onAddFacility, onRoomClick, onFacilityClick,
}: GridCanvasProps) {
  const { role } = useAuth();
  const [overlay, setOverlay] = useState<Overlay>(null);

  const totalCells = gridCols * gridRows;

  // Build occupancy set covering both rooms and facilities (supports multi-cell spans)
  const occupiedCells = new Set<string>();
  for (const room of floor.rooms) {
    for (let dy = 0; dy < room.height; dy++)
      for (let dx = 0; dx < room.width; dx++)
        occupiedCells.add(`${room.x + dx},${room.y + dy}`);
  }
  for (const fac of floor.facilities) {
    for (let dy = 0; dy < fac.height; dy++)
      for (let dx = 0; dx < fac.width; dx++)
        occupiedCells.add(`${fac.x + dx},${fac.y + dy}`);
  }

  const counts = floor.rooms.reduce<Partial<Record<RoomStatus, number>>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {},
  );

  const existingRoomNames = floor.rooms.map(r => r.name);

  function handleCellClick(x: number, y: number, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setOverlay({ kind: 'menu', x, y, rect });
  }

  function handleRoomConfirm(name: string, price: number) {
    if (!canAddRoom(role)) return;
    if (!overlay || overlay.kind !== 'add-room') return;
    onAddRoom(floor.id, {
      name, price,
      x: overlay.x, y: overlay.y,
      width: 1, height: 1,
      status: 'available', occupant: '', notes: '',
    });
    setOverlay(null);
  }

  function handleFacilityConfirm(facilityData: Omit<Facility, 'id'>) {
    if (!canAddFacility(role)) return;
    onAddFacility(floor.id, facilityData);
    setOverlay(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm">
        <span className="font-semibold text-gray-800">{floor.rooms.length} kamar</span>
        {floor.facilities.length > 0 && (
          <>
            <span className="text-gray-300" aria-hidden>•</span>
            <span className="text-gray-600">{floor.facilities.length} fasilitas</span>
          </>
        )}
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
          Layer 1 (DOM-first): background cells — static in view mode, interactive in edit mode.
          Layer 2 (DOM-last):  entity tiles (rooms + facilities) — on top via DOM-order stacking. */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(80px, 1fr))`,
        }}
      >
        {/* Layer 1 — cell backgrounds / interactive targets */}
        {Array.from({ length: totalCells }, (_, i) => {
          const col = (i % gridCols) + 1;
          const row = Math.floor(i / gridCols) + 1;
          const x = col - 1;
          const y = row - 1;
          const isOccupied = occupiedCells.has(`${x},${y}`);
          const isInteractive = mode === 'edit' && !isOccupied;
          const isPending = overlay?.x === x && overlay?.y === y;

          if (isInteractive) {
            return (
              <button
                key={`cell-${col}-${row}`}
                type="button"
                onClick={e => handleCellClick(x, y, e)}
                style={{ gridColumn: col, gridRow: row }}
                className={[
                  'border-2 border-dashed rounded-lg m-1 flex flex-col items-center justify-center',
                  'transition-colors group',
                  isPending
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex flex-col items-center gap-0.5 text-gray-400 transition-opacity',
                    isPending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                  ].join(' ')}
                >
                  <span className="text-2xl font-light leading-none select-none">+</span>
                  <span className="text-[11px] leading-none select-none">Tambah</span>
                </span>
              </button>
            );
          }

          return (
            <div
              key={`cell-${col}-${row}`}
              className="border border-gray-100 bg-gray-50"
              style={{ gridColumn: col, gridRow: row }}
            />
          );
        })}

        {/* Layer 2 — entity tiles (rooms first, then facilities — both above Layer 1) */}
        {floor.rooms.map(room => (
          <RoomTile
            key={room.id}
            room={room}
            style={{
              gridColumn: `${room.x + 1} / span ${room.width}`,
              gridRow: `${room.y + 1} / span ${room.height}`,
            }}
            onClick={() => {
              setOverlay(null);
              onRoomClick(room.id);
            }}
          />
        ))}
        {floor.facilities.map(fac => (
          <FacilityTile
            key={fac.id}
            facility={fac}
            style={{
              gridColumn: `${fac.x + 1} / span ${fac.width}`,
              gridRow: `${fac.y + 1} / span ${fac.height}`,
            }}
            onClick={() => {
              setOverlay(null);
              onFacilityClick(fac.id);
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

      {/* Overlays — fixed-positioned, mounted outside the grid flow */}
      {overlay?.kind === 'menu' && (
        <AddEntityMenu
          anchorRect={overlay.rect}
          onAddRoom={() =>
            setOverlay({ kind: 'add-room', x: overlay.x, y: overlay.y, rect: overlay.rect })
          }
          onAddFacility={() =>
            setOverlay({ kind: 'add-facility', x: overlay.x, y: overlay.y, rect: overlay.rect })
          }
          onCancel={() => setOverlay(null)}
        />
      )}
      {overlay?.kind === 'add-room' && (
        <AddRoomOverlay
          existingNames={existingRoomNames}
          anchorRect={overlay.rect}
          onConfirm={handleRoomConfirm}
          onCancel={() => setOverlay(null)}
        />
      )}
      {overlay?.kind === 'add-facility' && (
        <AddFacilityOverlay
          anchorRect={overlay.rect}
          cell={{ x: overlay.x, y: overlay.y }}
          occupiedCells={occupiedCells}
          gridCols={gridCols}
          gridRows={gridRows}
          onConfirm={handleFacilityConfirm}
          onCancel={() => setOverlay(null)}
        />
      )}
    </div>
  );
}
