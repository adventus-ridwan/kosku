import { useEffect, useRef } from 'react';

interface AddEntityMenuProps {
  anchorRect: DOMRect;
  onAddRoom: () => void;
  onAddFacility: () => void;
  onCancel: () => void;
}

const MENU_WIDTH = 176;
const MENU_HEIGHT_ESTIMATE = 110;
const GAP = 14;

export function AddEntityMenu({ anchorRect, onAddRoom, onAddFacility, onCancel }: AddEntityMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCancel();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [onCancel]);

  const left = Math.max(8, Math.min(anchorRect.left, window.innerWidth - MENU_WIDTH - 8));
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const posStyle: React.CSSProperties =
    spaceBelow >= MENU_HEIGHT_ESTIMATE + GAP
      ? { top: anchorRect.bottom + GAP, left }
      : { bottom: window.innerHeight - anchorRect.top + GAP, left };

  return (
    <div
      ref={menuRef}
      style={{ ...posStyle, position: 'fixed', width: MENU_WIDTH, zIndex: 50 }}
      className="bg-white rounded-lg border border-gray-200 shadow-lg p-1.5"
    >
      <p className="text-[11px] font-medium text-gray-400 px-2.5 pt-1.5 pb-1 uppercase tracking-wide">
        Tambah ke sel ini
      </p>
      <button
        type="button"
        onClick={onAddRoom}
        className="w-full text-left px-2.5 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2.5"
      >
        <span className="text-base leading-none">🏠</span>
        <span>Kamar</span>
      </button>
      <button
        type="button"
        onClick={onAddFacility}
        className="w-full text-left px-2.5 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2.5"
      >
        <span className="text-base leading-none">🏛️</span>
        <span>Fasilitas</span>
      </button>
    </div>
  );
}
