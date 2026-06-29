import type { Facility } from '@/types';
import { FACILITY_TYPE_CONFIG } from '@/lib/facilityConfig';

interface FacilityTileProps {
  facility: Facility;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function FacilityTile({ facility, style, onClick }: FacilityTileProps) {
  const cfg = FACILITY_TYPE_CONFIG[facility.facilityType];

  return (
    <div
      style={{
        ...style,
        backgroundColor: facility.color || cfg.bg,
        borderColor: cfg.border,
        color: cfg.text,
      }}
      onClick={onClick}
      className={[
        'border-2 rounded-lg m-1 flex flex-col items-center justify-center gap-1 overflow-hidden shadow-sm',
        onClick ? 'cursor-pointer hover:brightness-[0.93] hover:shadow-md transition-all duration-150' : '',
      ].join(' ')}
    >
      <span className="text-2xl leading-none select-none">{facility.icon || cfg.icon}</span>
      <span className="text-xs font-medium text-center leading-tight px-1 max-w-full truncate">
        {facility.name}
      </span>
    </div>
  );
}
