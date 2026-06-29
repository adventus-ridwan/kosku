// Static product screenshot for the Hero section.
// Mimics the boarding house map workspace — floor tabs, canvas grid,
// room tiles with real status colors, one open room drawer.
// Uses the same color tokens as RoomTile, FloorTab, GridCanvas, and RoomDrawer.
// Not interactive; aria-hidden from screen readers.

import type React from 'react';

// ─── Mock data ────────────────────────────────────────────────────────────────
// Six rooms in a 3×2 grid — all three statuses visible at a glance.

type MockStatus = 'available' | 'occupied' | 'maintenance';

const MOCK_ROOMS: { name: string; status: MockStatus; type: string }[] = [
  { name: 'A1', status: 'occupied',    type: 'Standard' },
  { name: 'A2', status: 'available',   type: 'Ekonomi'  },
  { name: 'A3', status: 'available',   type: 'Standard' },
  { name: 'B1', status: 'available',   type: 'Premium'  },
  { name: 'B2', status: 'maintenance', type: 'Ekonomi'  },
  { name: 'B3', status: 'occupied',    type: 'Standard' },
];

// Mirrors STATUS_CONFIG in RoomTile.tsx exactly.
const STATUS_CFG: Record<MockStatus, {
  bg: string; border: string; text: string; badge: string; label: string;
}> = {
  available:   { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', badge: 'bg-emerald-500', label: 'Tersedia'  },
  occupied:    { bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-900',    badge: 'bg-blue-500',    label: 'Terisi'    },
  maintenance: { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-900',   badge: 'bg-amber-500',   label: 'Perbaikan' },
};

// Mirrors the SVG grid pattern from GridCanvas.tsx.
const CANVAS_STYLE: React.CSSProperties = {
  background: '#f8fafc',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M 16 0 L 0 0 0 16' fill='none' stroke='%2394a3b8' stroke-width='0.4' stroke-opacity='0.22'/%3E%3C/svg%3E")`,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(2, 1fr)',
  gap: 4,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductMockup() {
  return (
    <div
      className="relative w-full select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Ambient amber glow — visible on dark hero background */}
      <div
        className="absolute -z-10 rounded-full"
        style={{
          width: '130%',
          height: '130%',
          left: '-15%',
          top: '-15%',
          background:
            'radial-gradient(ellipse at 62% 38%, rgba(251,191,36,0.13) 0%, transparent 62%)',
        }}
      />

      {/* ── Browser window ────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">

        {/* Browser chrome */}
        <div className="bg-slate-700 px-3.5 py-2 flex items-center gap-2.5">
          {/* Traffic lights */}
          <div className="flex gap-1.5 shrink-0">
            <span className="block w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="block w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="block w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          {/* Address bar */}
          <div className="flex-1 bg-slate-600/70 rounded px-2.5 py-0.5">
            <span className="font-mono text-slate-400" style={{ fontSize: 9 }}>
              kosku.app/workspace/denah
            </span>
          </div>
        </div>

        {/* ── App shell ─────────────────────────────────────────────────── */}
        <div className="flex flex-col overflow-hidden" style={{ height: 312 }}>

          {/* App nav */}
          <div className="shrink-0 bg-slate-900 border-b border-white/[0.05] px-4 py-2 flex items-center gap-3">
            <span className="font-bold text-white tracking-tight" style={{ fontSize: 11 }}>
              Kosku
            </span>
            <span className="text-slate-600 font-medium" style={{ fontSize: 9 }}>
              Map Studio
            </span>
          </div>

          {/* ── Canvas + Drawer row ──────────────────────────────────────── */}
          <div className="flex flex-1 min-h-0 bg-slate-100">

            {/* Canvas pane */}
            <div className="flex-1 min-w-0 flex flex-col px-3 py-2.5 gap-2 overflow-hidden">

              {/* Floor tabs — mirrors FloorTab.tsx colors */}
              <div className="flex shrink-0 border-b border-slate-200" style={{ gap: 2 }}>
                <span
                  className="text-amber-700 font-semibold bg-white border-b-2 border-amber-500 rounded-t -mb-px"
                  style={{ fontSize: 9.5, padding: '4px 10px' }}
                >
                  Lantai 1
                </span>
                <span
                  className="text-slate-500 font-medium border-b-2 border-transparent"
                  style={{ fontSize: 9.5, padding: '4px 10px' }}
                >
                  Lantai 2
                </span>
              </div>

              {/* Grid canvas — mirrors GridCanvas.tsx */}
              <div
                className="flex-1 rounded-lg border border-slate-200 p-1.5 overflow-hidden"
                style={CANVAS_STYLE}
              >
                {MOCK_ROOMS.map(room => {
                  const s = STATUS_CFG[room.status];
                  return (
                    <div
                      key={room.name}
                      className={`${s.bg} ${s.border} ${s.text} border-2 rounded-md shadow-sm flex flex-col`}
                      style={{ padding: '5px 6px', gap: 3 }}
                    >
                      <div className="flex items-start justify-between" style={{ gap: 2 }}>
                        <span className="font-bold leading-none" style={{ fontSize: 10 }}>
                          {room.name}
                        </span>
                        <span
                          className={`${s.badge} text-white font-semibold rounded-full leading-none shrink-0`}
                          style={{ fontSize: 6.5, padding: '2px 4px' }}
                        >
                          {s.label}
                        </span>
                      </div>
                      <span className="leading-none truncate" style={{ fontSize: 8.5, opacity: 0.6 }}>
                        {room.type}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend — mirrors GridCanvas.tsx legend */}
              <div className="shrink-0 flex gap-3">
                {[
                  { dot: 'bg-emerald-500', label: 'Tersedia'  },
                  { dot: 'bg-blue-500',    label: 'Terisi'    },
                  { dot: 'bg-amber-500',   label: 'Perbaikan' },
                ].map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-1 text-slate-500" style={{ fontSize: 8.5 }}>
                    <span className={`block w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                    {label}
                  </div>
                ))}
              </div>

            </div>

            {/* ── Room drawer — mirrors RoomDrawer.tsx layout ──────────── */}
            <div
              className="shrink-0 bg-white border-l border-slate-200 shadow-xl flex flex-col overflow-hidden"
              style={{ width: 150 }}
            >
              {/* Header */}
              <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-bold text-slate-900" style={{ fontSize: 12 }}>
                    Kamar A1
                  </span>
                  <span
                    className="bg-blue-100 text-blue-700 font-semibold rounded-full shrink-0 leading-none"
                    style={{ fontSize: 7, padding: '2.5px 5px' }}
                  >
                    Terisi
                  </span>
                </div>
                <span
                  className="inline-block bg-slate-100 text-slate-600 font-medium rounded-full"
                  style={{ fontSize: 8, padding: '2px 8px' }}
                >
                  Standard
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 px-3.5 py-3 flex flex-col overflow-hidden" style={{ gap: 12 }}>

                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1" style={{ fontSize: 6.5 }}>
                    Penghuni
                  </p>
                  <p className="font-medium text-slate-800" style={{ fontSize: 11 }}>
                    Ahmad Rizky
                  </p>
                  <p className="text-slate-400 leading-tight" style={{ fontSize: 8.5 }}>
                    Aktif · 5 bulan
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-0.5" style={{ fontSize: 6.5 }}>
                    Harga / Bulan
                  </p>
                  <p className="font-bold text-amber-600" style={{ fontSize: 13 }}>
                    Rp 700.000
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontSize: 6.5 }}>
                    Fasilitas
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['AC', 'WiFi', 'Kasur'].map(f => (
                      <span
                        key={f}
                        className="bg-slate-50 border border-slate-200 text-slate-600 rounded"
                        style={{ fontSize: 7.5, padding: '2px 5px' }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer — matches RoomDrawer edit-mode footer */}
              <div className="px-3.5 pb-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                <div
                  className="w-full bg-slate-900 text-white font-semibold text-center rounded-lg"
                  style={{ fontSize: 10, padding: '6px 8px' }}
                >
                  Simpan
                </div>
                <div
                  className="w-full border border-slate-200 text-slate-600 font-medium text-center rounded-lg"
                  style={{ fontSize: 10, padding: '5px 8px' }}
                >
                  Batal
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
