import { useState, useEffect } from 'react';
import type { Facility, FacilityType } from '@/types';
import { FACILITY_TYPE_CONFIG, FACILITY_TYPE_OPTIONS } from '@/lib/facilityConfig';

interface AddFacilityOverlayProps {
  cell: { x: number; y: number };
  occupiedCells: Set<string>;
  gridCols: number;
  gridRows: number;
  onConfirm: (facilityData: Omit<Facility, 'id'>) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
  'focus:border-gray-900 transition-shadow';

export function AddFacilityOverlay({
  cell, occupiedCells, gridCols, gridRows, onConfirm, onCancel,
}: AddFacilityOverlayProps) {
  const [facilityType, setFacilityType] = useState<FacilityType>('bathroom');
  const [name, setName] = useState(FACILITY_TYPE_CONFIG['bathroom'].label);
  const [widthStr, setWidthStr] = useState('1');
  const [heightStr, setHeightStr] = useState('1');
  const notes = '';
  const [nameError, setNameError] = useState('');
  const [sizeError, setSizeError] = useState('');

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  function handleTypeChange(type: FacilityType) {
    setFacilityType(type);
    setName(FACILITY_TYPE_CONFIG[type].label);
    setNameError('');
  }

  const maxWidth = gridCols - cell.x;
  const maxHeight = gridRows - cell.y;

  function validateSpan(w: number, h: number): boolean {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (occupiedCells.has(`${cell.x + dx},${cell.y + dy}`)) return false;
      }
    }
    return true;
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Nama tidak boleh kosong');
      return;
    }
    const w = Math.max(1, Math.min(parseInt(widthStr, 10) || 1, maxWidth));
    const h = Math.max(1, Math.min(parseInt(heightStr, 10) || 1, maxHeight));
    if (!validateSpan(w, h)) {
      setSizeError('Ukuran berbenturan dengan entitas lain');
      return;
    }
    const cfg = FACILITY_TYPE_CONFIG[facilityType];
    onConfirm({
      kind: 'facility',
      name: trimmed,
      facilityType,
      x: cell.x,
      y: cell.y,
      width: w,
      height: h,
      icon: cfg.icon,
      color: cfg.bg,
      notes,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  }

  const cfg = FACILITY_TYPE_CONFIG[facilityType];

  return (
    /* Centred modal — position never depends on anchor coords or panel height estimates */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-black/20"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tambah fasilitas"
        className={[
          'relative z-10 flex flex-col',
          'w-full max-w-sm',
          'bg-white rounded-xl border border-gray-200 shadow-xl',
          'max-h-[calc(100vh-2rem)]',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <header className="px-5 py-4 border-b border-gray-100 shrink-0">
          <p className="text-sm font-semibold text-gray-800">Tambah Fasilitas</p>
        </header>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">

          {/* Type picker */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis</label>
            <div className="grid grid-cols-5 gap-1">
              {FACILITY_TYPE_OPTIONS.map(type => {
                const c = FACILITY_TYPE_CONFIG[type];
                const isActive = type === facilityType;
                return (
                  <button
                    key={type}
                    type="button"
                    title={c.label}
                    onClick={() => handleTypeChange(type)}
                    style={isActive ? { backgroundColor: c.bg, borderColor: c.border } : {}}
                    className={[
                      'flex items-center justify-center p-2 rounded-md border-2 transition-colors',
                      isActive ? '' : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <span className="text-lg leading-none">{c.icon}</span>
                  </button>
                );
              })}
            </div>
            {/* Fixed min-height prevents layout shift when the label text changes length */}
            <p className="text-[11px] text-gray-500 mt-1 min-h-[16px]">{cfg.label}</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(''); }}
              onKeyDown={handleKeyDown}
              className={inputClass}
            />
            {/* Fixed min-height keeps layout stable whether error is shown or not */}
            <p className="text-xs text-red-500 mt-1 min-h-[16px]">{nameError}</p>
          </div>

          {/* Width × Height */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Lebar (sel)</label>
              <input
                type="number"
                value={widthStr}
                onChange={e => { setWidthStr(e.target.value); setSizeError(''); }}
                onKeyDown={handleKeyDown}
                min={1}
                max={maxWidth}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tinggi (sel)</label>
              <input
                type="number"
                value={heightStr}
                onChange={e => { setHeightStr(e.target.value); setSizeError(''); }}
                onKeyDown={handleKeyDown}
                min={1}
                max={maxHeight}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-red-500 -mt-2 min-h-[16px]">{sizeError}</p>

        </div>

        {/* ── Footer (always visible) ── */}
        <footer className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-gray-900 text-white text-sm font-medium py-1.5 rounded-md hover:bg-gray-700 transition-colors"
          >
            Buat
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </footer>
      </div>
    </div>
  );
}
