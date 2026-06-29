'use client';

import { useKosMap } from '@/hooks/useKosMap';
import { useUsageMode } from '@/context/UsageModeContext';
import { isRoom } from '@/types';
import { Toolbar } from './Toolbar';
import { FloorTab } from './FloorTab';
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
  // Public mode is always read-only regardless of reducer state.
  const effectiveMode = usageMode === 'public' ? 'view' : state.mode;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {usageMode === 'admin' && (
        <Toolbar
          houseName={boardingHouse.name}
          mode={effectiveMode}
          onModeChange={actions.setMode}
        />
      )}
      <div className="flex-1 overflow-auto px-6 py-5">
        <FloorTab
          floors={boardingHouse.floors}
          activeFloorId={state.activeFloorId}
          onSelect={actions.setActiveFloor}
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
