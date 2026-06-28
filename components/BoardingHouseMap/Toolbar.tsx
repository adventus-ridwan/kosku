import type { AppMode } from '@/types';

interface ToolbarProps {
  houseName: string;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const SEGMENTS: { value: AppMode; label: string }[] = [
  { value: 'view', label: 'Lihat' },
  { value: 'edit', label: 'Edit' },
];

export function Toolbar({ houseName, mode, onModeChange }: ToolbarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 truncate">{houseName}</h1>

      <div className="flex items-center rounded-md border border-gray-200 overflow-hidden">
        {SEGMENTS.map(({ value, label }, i) => (
          <button
            key={value}
            type="button"
            onClick={() => onModeChange(value)}
            className={[
              'px-4 py-1.5 text-sm font-medium transition-colors',
              i > 0 ? 'border-l border-gray-200' : '',
              mode === value
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
