import { useState, useEffect, useRef } from 'react';
import type { Facility, FacilityType } from '@/types';
import { FACILITY_TYPE_CONFIG, FACILITY_TYPE_OPTIONS } from '@/lib/facilityConfig';

interface AddFacilityOverlayProps {
  anchorRect: DOMRect;
  cell: { x: number; y: number };
  occupiedCells: Set<string>;
  gridCols: number;
  gridRows: number;
  onConfirm: (facilityData: Omit<Facility, 'id'>) => void;
  onCancel: () => void;
}

const PANEL_WIDTH = 288;
const PANEL_HEIGHT_ESTIMATE = 310;
const GAP = 14;

const inputClass =
  'w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
  'focus:border-gray-900 transition-shadow';

export function AddFacilityOverlay({
  anchorRect, cell, occupiedCells, gridCols, gridRows, onConfirm, onCancel,
}: AddFacilityOverlayProps) {
  const [facilityType, setFacilityType] = useState<FacilityType>('bathroom');
  const [name, setName] = useState(FACILITY_TYPE_CONFIG['bathroom'].label);
  const [widthStr, setWidthStr] = useState('1');
  const [heightStr, setHeightStr] = useState('1');
  const notes = '';
  const [nameError, setNameError] = useState('');
  const [sizeError, setSizeError] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);

  function handleTypeChange(type: FacilityType) {
    setFacilityType(type);
    setName(FACILITY_TYPE_CONFIG[type].label);
    setNameError('');
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onCancel();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [onCancel]);

  const left = Math.max(8, Math.min(anchorRect.left, window.innerWidth - PANEL_WIDTH - 8));
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const posStyle: React.CSSProperties =
    spaceBelow >= PANEL_HEIGHT_ESTIMATE + GAP
      ? { top: anchorRect.bottom + GAP, left }
      : { bottom: window.innerHeight - anchorRect.top + GAP, left };

  const maxWidth = gridCols - cell.x;
  const maxHeight = gridRows - cell.y;

  function validateSpan(w: number, h: number): boolean {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (dx === 0 && dy === 0) continue; // anchor cell is confirmed empty
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
    else if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
  }

  const cfg = FACILITY_TYPE_CONFIG[facilityType];

  return (
    <div
      ref={panelRef}
      style={{ ...posStyle, position: 'fixed', width: PANEL_WIDTH, zIndex: 50 }}
      className="bg-white rounded-lg border border-gray-200 shadow-lg p-4"
    >
      <p className="text-sm font-semibold text-gray-800 mb-3">Tambah Fasilitas</p>

      <div className="space-y-3">
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
          <p className="text-[11px] text-gray-500 mt-1">{cfg.label}</p>
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
          {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
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
        {sizeError && <p className="text-xs text-red-500 -mt-1">{sizeError}</p>}
      </div>

      <div className="flex gap-2 mt-4">
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
      </div>
    </div>
  );
}
