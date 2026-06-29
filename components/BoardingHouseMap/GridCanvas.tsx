'use client';

import { useState, useRef, useEffect } from 'react';
import type { Floor, Room, Facility, RoomStatus, AppMode, RoomType } from '@/types';
import { isRoom, isFacility } from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { canAddRoom, canAddFacility } from '@/features/auth/permission';
import { useOccupantNames } from '@/features/tenants/useOccupantNames';
import { useUsageMode } from '@/context/UsageModeContext';
import { resolveRoomProfile } from '@/lib/resolveRoomProfile';
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

// Distance in px before a pointerdown on a tile becomes an active drag.
const DRAG_THRESHOLD_PX = 6;

type Overlay =
  | { kind: 'menu';         x: number; y: number; rect: DOMRect }
  | { kind: 'add-room';     x: number; y: number; rect: DOMRect }
  | { kind: 'add-facility'; x: number; y: number; rect: DOMRect }
  | null;

// Recorded immediately on pointerdown — becomes ActiveDrag once threshold is crossed.
type DragIntent = {
  objectId: string;
  kind: 'room' | 'facility';
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
  width: number;
  height: number;
  offsetCol: number; // which cell within the tile the pointer landed on
  offsetRow: number;
};

type ActiveDrag = {
  objectId: string;
  kind: 'room' | 'facility';
  originX: number;
  originY: number;
  width: number;
  height: number;
  offsetCol: number;
  offsetRow: number;
  ghostX: number;   // proposed drop column (0-based)
  ghostY: number;   // proposed drop row   (0-based)
  isValid: boolean;
  shakeTrigger: number; // increment to replay shake animation
};

interface GridCanvasProps {
  floor: Floor;
  gridCols: number;
  gridRows: number;
  roomTypes: RoomType[];
  mode: AppMode;
  onAddRoom: (floorId: string, roomData: Omit<Room, 'id'>) => void;
  onAddFacility: (floorId: string, facilityData: Omit<Facility, 'id'>) => void;
  onRoomClick: (roomId: string) => void;
  onFacilityClick: (facilityId: string) => void;
  onMoveRoom: (floorId: string, roomId: string, x: number, y: number) => void;
  onMoveFacility: (floorId: string, facility: Facility) => void;
}

export function GridCanvas({
  floor, gridCols, gridRows, roomTypes, mode,
  onAddRoom, onAddFacility, onRoomClick, onFacilityClick,
  onMoveRoom, onMoveFacility,
}: GridCanvasProps) {
  const { role } = useAuth();
  const usageMode = useUsageMode();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [dragIntent, setDragIntent] = useState<DragIntent | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const floorRooms = floor.objects.filter(isRoom);
  const floorFacilities = floor.objects.filter(isFacility);
  const occupantNames = useOccupantNames(floorRooms);
  const totalCells = gridCols * gridRows;

  const occupiedCells = new Set<string>();
  for (const room of floorRooms) {
    for (let dy = 0; dy < room.height; dy++)
      for (let dx = 0; dx < room.width; dx++)
        occupiedCells.add(`${room.x + dx},${room.y + dy}`);
  }
  for (const fac of floorFacilities) {
    for (let dy = 0; dy < fac.height; dy++)
      for (let dx = 0; dx < fac.width; dx++)
        occupiedCells.add(`${fac.x + dx},${fac.y + dy}`);
  }

  const counts = floorRooms.reduce<Partial<Record<RoomStatus, number>>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {},
  );
  const existingRoomNames = floorRooms.map(r => r.name);
  const addFirstRef = useRef<HTMLButtonElement>(null);

  // ── Escape cancels drag ──────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveDrag(null);
        setDragIntent(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Drag helpers ─────────────────────────────────────────────────────────

  function getGridCell(clientX: number, clientY: number): { col: number; row: number } | null {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const col = Math.floor((clientX - rect.left) / (rect.width / gridCols));
    const row = Math.floor((clientY - rect.top) / (rect.height / gridRows));
    return { col, row };
  }

  function isDropValid(x: number, y: number, w: number, h: number, excludeId: string): boolean {
    if (x < 0 || y < 0 || x + w > gridCols || y + h > gridRows) return false;
    for (const obj of floor.objects) {
      if (obj.id === excludeId) continue;
      if (x < obj.x + obj.width && x + w > obj.x && y < obj.y + obj.height && y + h > obj.y)
        return false;
    }
    return true;
  }

  // ── Grid pointer handlers (event delegation for tile interactions) ────────

  function handleGridPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (mode !== 'edit') return;

    // Find if a tile wrapper was the target
    const tileEl = (e.target as HTMLElement).closest<HTMLElement>('[data-tile-id]');
    if (!tileEl) return;

    const objectId = tileEl.dataset.tileId ?? '';
    const kind = (tileEl.dataset.tileKind ?? 'room') as 'room' | 'facility';
    const originX = parseInt(tileEl.dataset.tileX ?? '0', 10);
    const originY = parseInt(tileEl.dataset.tileY ?? '0', 10);
    const width = parseInt(tileEl.dataset.tileW ?? '1', 10);
    const height = parseInt(tileEl.dataset.tileH ?? '1', 10);
    if (!objectId) return;

    const cell = getGridCell(e.clientX, e.clientY);
    const offsetCol = cell ? Math.max(0, Math.min(width - 1, cell.col - originX)) : 0;
    const offsetRow = cell ? Math.max(0, Math.min(height - 1, cell.row - originY)) : 0;

    // Capture pointer so move/up fire on grid even outside bounds
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault(); // prevents click from firing; we'll dispatch it manually on pointerup

    setOverlay(null);
    setDragIntent({ objectId, kind, startClientX: e.clientX, startClientY: e.clientY,
                    originX, originY, width, height, offsetCol, offsetRow });
  }

  function handleGridPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragIntent && !activeDrag) {
      const dx = e.clientX - dragIntent.startClientX;
      const dy = e.clientY - dragIntent.startClientY;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
        const cell = getGridCell(e.clientX, e.clientY);
        const ghostX = cell ? cell.col - dragIntent.offsetCol : dragIntent.originX;
        const ghostY = cell ? cell.row - dragIntent.offsetRow : dragIntent.originY;
        setActiveDrag({
          objectId: dragIntent.objectId,
          kind: dragIntent.kind,
          originX: dragIntent.originX,
          originY: dragIntent.originY,
          width: dragIntent.width,
          height: dragIntent.height,
          offsetCol: dragIntent.offsetCol,
          offsetRow: dragIntent.offsetRow,
          ghostX,
          ghostY,
          isValid: isDropValid(ghostX, ghostY, dragIntent.width, dragIntent.height, dragIntent.objectId),
          shakeTrigger: 0,
        });
        setDragIntent(null);
      }
      return;
    }

    if (activeDrag) {
      const cell = getGridCell(e.clientX, e.clientY);
      if (!cell) return;
      const ghostX = cell.col - activeDrag.offsetCol;
      const ghostY = cell.row - activeDrag.offsetRow;
      const isValid = isDropValid(ghostX, ghostY, activeDrag.width, activeDrag.height, activeDrag.objectId);
      if (ghostX !== activeDrag.ghostX || ghostY !== activeDrag.ghostY || isValid !== activeDrag.isValid) {
        setActiveDrag({ ...activeDrag, ghostX, ghostY, isValid });
      }
    }
  }

  function handleGridPointerUp() {
    if (dragIntent) {
      // No threshold crossed → treat as click
      if (dragIntent.kind === 'room') onRoomClick(dragIntent.objectId);
      else onFacilityClick(dragIntent.objectId);
      setDragIntent(null);
      return;
    }

    if (activeDrag) {
      if (activeDrag.isValid) {
        if (activeDrag.ghostX !== activeDrag.originX || activeDrag.ghostY !== activeDrag.originY) {
          if (activeDrag.kind === 'room') {
            onMoveRoom(floor.id, activeDrag.objectId, activeDrag.ghostX, activeDrag.ghostY);
          } else {
            const fac = floorFacilities.find(f => f.id === activeDrag.objectId);
            if (fac) onMoveFacility(floor.id, { ...fac, x: activeDrag.ghostX, y: activeDrag.ghostY });
          }
        }
        setActiveDrag(null);
      } else {
        // Invalid drop — shake the ghost then cancel
        const shaken = { ...activeDrag, shakeTrigger: activeDrag.shakeTrigger + 1 };
        setActiveDrag(shaken);
        setTimeout(() => setActiveDrag(null), 400);
      }
    }
  }

  function handleGridPointerCancel() {
    setActiveDrag(null);
    setDragIntent(null);
  }

  // ── Add-room / add-facility overlays ────────────────────────────────────

  function handleCellClick(x: number, y: number, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setOverlay({ kind: 'menu', x, y, rect });
  }

  function handleRoomConfirm(name: string, priceOverride?: number) {
    if (!canAddRoom(role)) return;
    if (!overlay || overlay.kind !== 'add-room') return;
    onAddRoom(floor.id, {
      kind: 'room',
      name, priceOverride,
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

  function handleAddFirstRoom() {
    const rect = addFirstRef.current?.getBoundingClientRect() ?? new DOMRect(100, 200, 0, 0);
    setOverlay({ kind: 'add-room', x: 0, y: 0, rect });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="rounded-xl border border-slate-200 shadow-sm p-5 bg-slate-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%2394a3b8' stroke-width='0.5' stroke-opacity='0.28'/%3E%3C/svg%3E")`,
        cursor: activeDrag ? 'grabbing' : undefined,
      }}
    >
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm">
        <span className="font-semibold text-slate-700">{floorRooms.length} kamar</span>
        {floorFacilities.length > 0 && (
          <>
            <span className="text-slate-300" aria-hidden>•</span>
            <span className="text-slate-500">{floorFacilities.length} fasilitas</span>
          </>
        )}
        <span className="text-slate-300" aria-hidden>•</span>
        <span className="text-emerald-700">{counts.available ?? 0} tersedia</span>
        <span className="text-slate-300" aria-hidden>•</span>
        <span className="text-blue-700">{counts.occupied ?? 0} terisi</span>
        {(counts.maintenance ?? 0) > 0 && (
          <>
            <span className="text-slate-300" aria-hidden>•</span>
            <span className="text-amber-700">{counts.maintenance} perbaikan</span>
          </>
        )}
      </div>

      {/* Empty floor state */}
      {floor.objects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 min-h-[240px]">
          <span className="text-4xl select-none" role="img" aria-hidden>🏗️</span>
          <p className="text-sm text-slate-400">Lantai ini masih kosong.</p>
          {mode === 'edit' && (
            <button
              ref={addFirstRef}
              type="button"
              onClick={handleAddFirstRoom}
              className="mt-1 text-sm font-medium text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-white transition-colors"
            >
              + Tambah Kamar
            </button>
          )}
        </div>
      )}

      {/* Grid
          Layer 1 (DOM-first): background cells — static in view mode, interactive in edit mode.
          Layer 2 (DOM-last):  entity tiles (rooms + facilities) — on top via DOM-order stacking. */}
      {floor.objects.length > 0 && (
      <div
        ref={gridRef}
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(80px, 1fr))`,
        }}
        onPointerDown={handleGridPointerDown}
        onPointerMove={handleGridPointerMove}
        onPointerUp={handleGridPointerUp}
        onPointerCancel={handleGridPointerCancel}
      >
        {/* Layer 1 — cell backgrounds / interactive targets */}
        {Array.from({ length: totalCells }, (_, i) => {
          const col = (i % gridCols) + 1;
          const row = Math.floor(i / gridCols) + 1;
          const x = col - 1;
          const y = row - 1;
          const isOccupied = occupiedCells.has(`${x},${y}`);
          // Disable cell add-buttons while a drag is in progress
          const isInteractive = mode === 'edit' && !isOccupied && !activeDrag && !dragIntent;
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
                    ? 'border-slate-400 bg-slate-100/60'
                    : 'border-transparent hover:border-slate-400/60 hover:bg-slate-100/50',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex flex-col items-center gap-0.5 text-slate-400 transition-opacity',
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
              className="m-0.5 rounded-sm border border-slate-300/20"
              style={{ gridColumn: col, gridRow: row }}
            />
          );
        })}

        {/* Layer 2 — Room tiles */}
        {floorRooms.map(room => {
          const resolved = resolveRoomProfile(room, roomTypes);
          const isDragged = activeDrag?.objectId === room.id || dragIntent?.objectId === room.id;
          return (
            <div
              key={room.id}
              data-tile-id={room.id}
              data-tile-kind="room"
              data-tile-x={room.x}
              data-tile-y={room.y}
              data-tile-w={room.width}
              data-tile-h={room.height}
              style={{
                gridColumn: `${room.x + 1} / span ${room.width}`,
                gridRow: `${room.y + 1} / span ${room.height}`,
                // display:grid makes RoomTile a grid item so it stretches to fill
                // this wrapper — identical sizing behaviour to the pre-wrapper code.
                display: 'grid',
                opacity: activeDrag
                  ? (isDragged ? 0.35 : 0.6)
                  : 1,
                transition: activeDrag ? undefined : 'opacity 0.1s ease',
                cursor: mode === 'edit' ? 'grab' : undefined,
                pointerEvents: activeDrag ? 'none' : undefined,
              }}
            >
              <RoomTile
                room={room}
                resolvedPrice={resolved.price}
                typeName={resolved.typeName ?? undefined}
                labelColor={resolved.labelColor}
                previewPhoto={resolved.photos[0]?.url}
                occupantName={usageMode === 'public' ? undefined : occupantNames[room.id]}
                onClick={() => {
                  setOverlay(null);
                  onRoomClick(room.id);
                }}
              />
            </div>
          );
        })}

        {/* Layer 2 — Facility tiles */}
        {floorFacilities.map(fac => {
          const isDragged = activeDrag?.objectId === fac.id || dragIntent?.objectId === fac.id;
          return (
            <div
              key={fac.id}
              data-tile-id={fac.id}
              data-tile-kind="facility"
              data-tile-x={fac.x}
              data-tile-y={fac.y}
              data-tile-w={fac.width}
              data-tile-h={fac.height}
              style={{
                gridColumn: `${fac.x + 1} / span ${fac.width}`,
                gridRow: `${fac.y + 1} / span ${fac.height}`,
                display: 'grid',
                opacity: activeDrag
                  ? (isDragged ? 0.35 : 0.6)
                  : 1,
                transition: activeDrag ? undefined : 'opacity 0.1s ease',
                cursor: mode === 'edit' ? 'grab' : undefined,
                pointerEvents: activeDrag ? 'none' : undefined,
              }}
            >
              <FacilityTile
                facility={fac}
                onClick={() => {
                  setOverlay(null);
                  onFacilityClick(fac.id);
                }}
              />
            </div>
          );
        })}

        {/* Ghost preview — rendered last so it stacks above all tiles */}
        {activeDrag && (() => {
          const { ghostX, ghostY, width, height, isValid, shakeTrigger } = activeDrag;
          if (ghostX < 0 || ghostY < 0 || ghostX + width > gridCols || ghostY + height > gridRows) {
            return null;
          }
          return (
            <div
              key={shakeTrigger}
              style={{
                gridColumn: `${ghostX + 1} / span ${width}`,
                gridRow: `${ghostY + 1} / span ${height}`,
                zIndex: 10,
                pointerEvents: 'none',
              }}
              className={[
                'm-1 rounded-lg border-2 border-dashed transition-colors duration-75',
                isValid
                  ? 'bg-emerald-100/70 border-emerald-400'
                  : 'bg-red-100/70 border-red-400',
                shakeTrigger > 0 ? 'drag-shake' : '',
              ].join(' ')}
            />
          );
        })()}
      </div>
      )}

      {/* Legend — inline with canvas, no visual separator */}
      <div className="flex flex-wrap gap-5 mt-5 pl-0.5">
        {LEGEND.map(({ status, label, color }) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
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
