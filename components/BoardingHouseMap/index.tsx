'use client';

import { useKosMap } from '@/hooks/useKosMap';
import { Toolbar } from './Toolbar';
import { FloorTab } from './FloorTab';
import { GridCanvas } from './GridCanvas';

export default function BoardingHouseMap() {
  const { state, actions, activeFloor } = useKosMap();

  // Guard: floors array should never be empty due to reducer invariant,
  // but TypeScript infers Floor | undefined for the array-index fallback.
  if (!activeFloor) return null;

  const { boardingHouse } = state;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toolbar
          houseName={boardingHouse.name}
          mode={state.mode}
          onModeChange={actions.setMode}
        />
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
        />
      </div>
    </div>
  );
}
