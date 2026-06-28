import type { Floor } from '@/types';

interface FloorTabProps {
  floors: Floor[];
  activeFloorId: string;
  onSelect: (floorId: string) => void;
}

export function FloorTab({ floors, activeFloorId, onSelect }: FloorTabProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-5">
      {floors.map(floor => {
        const isActive = floor.id === activeFloorId;
        return (
          <button
            key={floor.id}
            type="button"
            onClick={() => onSelect(floor.id)}
            className={[
              'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            {floor.name}
          </button>
        );
      })}
    </div>
  );
}
