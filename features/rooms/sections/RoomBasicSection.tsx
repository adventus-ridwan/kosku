'use client';

interface RoomBasicValue {
  description: string;
  size?:       number;
  capacity?:   number;
}

interface RoomBasicSectionProps {
  value:    RoomBasicValue;
  onChange: (v: RoomBasicValue) => void;
  disabled: boolean;
}

const FIELD =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
  'focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400';

export function RoomBasicSection({ value, onChange, disabled }: RoomBasicSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Deskripsi</label>
        <textarea
          value={value.description}
          onChange={e => onChange({ ...value, description: e.target.value })}
          disabled={disabled}
          placeholder="Contoh: Kamar nyaman dengan jendela besar menghadap taman..."
          rows={3}
          className={`${FIELD} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Luas (m²)</label>
          <input
            type="number"
            min={0}
            value={value.size ?? ''}
            onChange={e => onChange({ ...value, size: e.target.value ? Number(e.target.value) : undefined })}
            disabled={disabled}
            placeholder="Contoh: 12"
            className={FIELD}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Maks. Penghuni</label>
          <input
            type="number"
            min={1}
            value={value.capacity ?? ''}
            onChange={e => onChange({ ...value, capacity: e.target.value ? Number(e.target.value) : undefined })}
            disabled={disabled}
            placeholder="Contoh: 2"
            className={FIELD}
          />
        </div>
      </div>
    </div>
  );
}
