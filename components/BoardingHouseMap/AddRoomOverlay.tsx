import { useState, useEffect, useRef } from 'react';

interface AddRoomOverlayProps {
  existingNames: string[];
  anchorRect: DOMRect;
  onConfirm: (name: string, priceOverride?: number) => void;
  onCancel: () => void;
}

const PANEL_WIDTH = 272;
const PANEL_HEIGHT_ESTIMATE = 220; // used only to decide flip direction
const GAP = 14; // px offset between the anchor cell edge and the panel

export function AddRoomOverlay({
  existingNames,
  anchorRect,
  onConfirm,
  onCancel,
}: AddRoomOverlayProps) {
  const [name, setName] = useState('');
  // Empty string so the price field starts blank; parsed to number on submit.
  const [priceStr, setPriceStr] = useState('');
  const [nameError, setNameError] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the panel
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onCancel();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [onCancel]);

  // Compute fixed position relative to anchor cell
  const left = Math.max(8, Math.min(anchorRect.left, window.innerWidth - PANEL_WIDTH - 8));
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const posStyle: React.CSSProperties =
    spaceBelow >= PANEL_HEIGHT_ESTIMATE + GAP
      ? { top: anchorRect.bottom + GAP, left }
      : { bottom: window.innerHeight - anchorRect.top + GAP, left };

  function validate(): boolean {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Nomor kamar tidak boleh kosong');
      return false;
    }
    if (existingNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      setNameError('Nomor kamar sudah digunakan di lantai ini');
      return false;
    }
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;
    // Only set priceOverride when the owner enters a value > 0.
    // Leaving the field blank means the room will inherit price from its type.
    const parsed = Number(priceStr);
    const priceOverride = priceStr !== '' && parsed > 0 ? parsed : undefined;
    onConfirm(name.trim(), priceOverride);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }

  const inputClass =
    'w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
    'focus:border-gray-900 transition-shadow';

  return (
    <div
      ref={panelRef}
      style={{ ...posStyle, position: 'fixed', width: PANEL_WIDTH, zIndex: 50 }}
      className="bg-white rounded-lg border border-gray-200 shadow-lg p-4"
    >
      <p className="text-sm font-semibold text-gray-800 mb-3">Tambah Kamar</p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nomor Kamar <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="cth. 101"
            className={inputClass}
          />
          {nameError && (
            <p className="text-xs text-red-500 mt-1">{nameError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Harga Override (Rp) <span className="text-gray-400 font-normal">— opsional</span>
          </label>
          <input
            type="number"
            value={priceStr}
            onChange={e => setPriceStr(e.target.value)}
            onKeyDown={handleKeyDown}
            min={0}
            placeholder="1200000"
            className={inputClass}
          />
        </div>
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
