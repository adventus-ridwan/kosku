'use client';

import { useKosMap } from '@/hooks/useKosMap';
import { useUsageMode } from '@/context/UsageModeContext';
import { isRoom } from '@/types';
import { FloorTabBar } from './FloorTabBar';
import { GridCanvas } from './GridCanvas';
import { RoomDrawer } from './RoomDrawer';
import { FacilityDrawer } from './FacilityDrawer';

export default function BoardingHouseMap() {
  const { state, actions, activeFloor, selectedRoom, selectedFacility } = useKosMap();
  const usageMode = useUsageMode();

  // Guard: floors array should never be empty due to reducer invariant,
  // but TypeScript infers Floor | undefined for the array-index fallback.
  if (!activeFloor) return null;

  const { boardingHouse } = state;
  const effectiveMode = usageMode === 'public' ? 'view' : 'edit';
  const waPhone = boardingHouse.contact?.whatsapp?.trim() || undefined;
  const sortedFloors = [...boardingHouse.floors].sort((a, b) => a.order - b.order);

  return (
    <div className={['flex flex-col bg-slate-100', usageMode !== 'public' ? 'min-h-screen' : ''].join(' ')}>
      <div className="flex-1 overflow-auto px-6 py-5">
        <FloorTabBar
          floors={sortedFloors}
          activeFloorId={state.activeFloorId}
          mode={effectiveMode}
          onSelect={actions.setActiveFloor}
          onAdd={actions.addFloor}
          onRename={actions.renameFloor}
          onDelete={actions.deleteFloor}
          onReorder={actions.reorderFloors}
        />
        <GridCanvas
          floor={activeFloor}
          gridCols={boardingHouse.gridCols}
          gridRows={boardingHouse.gridRows}
          roomTypes={boardingHouse.roomTypes ?? []}
          mode={effectiveMode}
          onAddRoom={actions.addRoom}
          onAddFacility={actions.addFacility}
          onRoomClick={actions.selectObject}
          onFacilityClick={actions.selectObject}
          onMoveRoom={actions.moveRoom}
          onMoveFacility={(floorId, facility) => actions.updateFacility(floorId, facility)}
        />
      </div>

      {/* RoomDrawer and FacilityDrawer are always mounted; they slide in/out via translate.
          They are mutually exclusive at the state level (selectedObjectId can only resolve to
          one kind at a time), so only one will animate in at a time. */}
      <RoomDrawer
        room={selectedRoom}
        floorId={activeFloor.id}
        floorRooms={activeFloor.objects.filter(isRoom)}
        roomTypes={boardingHouse.roomTypes ?? []}
        mode={effectiveMode}
        onSave={actions.updateRoom}
        onDelete={actions.deleteRoom}
        onClose={actions.deselectObject}
        waPhone={waPhone}
      />
      <FacilityDrawer
        facility={selectedFacility}
        floorId={activeFloor.id}
        gridCols={boardingHouse.gridCols}
        gridRows={boardingHouse.gridRows}
        mode={effectiveMode}
        onSave={actions.updateFacility}
        onDelete={actions.deleteFacility}
        onClose={actions.deselectObject}
      />
    </div>
  );
}
