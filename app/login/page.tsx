'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import type { UserRole } from '@/features/auth/types';

type LoginRole = Exclude<UserRole, 'public'>;

const ROLES: {
  value:    LoginRole;
  icon:     string;
  label:    string;
  tagline:  string;
  features: string[];
}[] = [
  {
    value:    'owner',
    icon:     '👑',
    label:    'Owner',
    tagline:  'Kelola seluruh properti',
    features: ['Dashboard & analitik', 'Properti & galeri', 'Tipe kamar', 'Pengaturan sistem'],
  },
  {
    value:    'penjaga',
    icon:     '🛠️',
    label:    'Penjaga',
    tagline:  'Kelola operasional harian',
    features: ['Denah interaktif', 'Data penghuni', 'Kontrak & histori kamar'],
  },
];

// Button background shifts between deep indigo (owner) and royal blue (penjaga).
// Both share the same blue-indigo family so the transition reads as a purposeful shift, not a
// random color change. transition-colors on the button makes the change animate over 300 ms.
const BUTTON_BG: Record<LoginRole, string> = {
  owner:   'bg-indigo-700 hover:bg-indigo-800',
  penjaga: 'bg-blue-600 hover:bg-blue-700',
};

// ── Decorative preview data ───────────────────────────────────────────────────
// Colours are copied verbatim from facilityConfig.ts so the illustration uses
// exactly the same palette as the live workspace.

type PreviewRoom = {
  kind:   'room';
  id:     string;
  status: 'available' | 'occupied' | 'maintenance';
  type:   string;
  price:  string;
};

type PreviewFacility = {
  kind:  'facility';
  icon:  string;
  name:  string;
  bg:    string;
  bd:    string;   // border colour
  fg:    string;   // text colour
};

type PreviewCell = PreviewRoom | PreviewFacility;

// 4 × 3 grid: rooms in rows 1–2, facilities across all three rows
const PREVIEW_CELLS: PreviewCell[] = [
  // ── Row 1 — sleeping rooms + staircase ────────────────────────────────────
  { kind: 'room',     id: '101', status: 'occupied',    type: 'Standard', price: '1.2jt'  },
  { kind: 'room',     id: '102', status: 'available',   type: 'Deluxe',   price: '1.8jt'  },
  { kind: 'room',     id: '103', status: 'available',   type: 'Deluxe',   price: '1.8jt'  },
  { kind: 'facility', icon: '🪜', name: 'Tangga',   bg: '#f1f5f9', bd: '#94a3b8', fg: '#475569' },
  // ── Row 2 — sleeping rooms + service facilities ───────────────────────────
  { kind: 'room',     id: '104', status: 'available',   type: 'Standard', price: '1.2jt'  },
  { kind: 'room',     id: '105', status: 'maintenance', type: 'Standard', price: '1.2jt'  },
  { kind: 'facility', icon: '🚿', name: 'K. Mandi', bg: '#ecfeff', bd: '#a5f3fc', fg: '#0e7490' },
  { kind: 'facility', icon: '🍳', name: 'Dapur',    bg: '#fff7ed', bd: '#fed7aa', fg: '#c2410c' },
  // ── Row 3 — outdoor + shared facilities ──────────────────────────────────
  { kind: 'facility', icon: '🅿️', name: 'Parkir',   bg: '#f4f4f5', bd: '#a1a1aa', fg: '#52525b' },
  { kind: 'facility', icon: '📦', name: 'Gudang',   bg: '#fefce8', bd: '#fde047', fg: '#a16207' },
  { kind: 'facility', icon: '🌿', name: 'Taman',    bg: '#f7fee7', bd: '#bef264', fg: '#3f6212' },
  { kind: 'facility', icon: '🏛️', name: 'Lobby',    bg: '#f5f3ff', bd: '#c4b5fd', fg: '#6d28d9' },
];

const ROOM_STYLE = {
  available:   { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', badge: 'bg-emerald-500', label: 'Tersedia'  },
  occupied:    { bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-900',    badge: 'bg-blue-500',    label: 'Terisi'    },
  maintenance: { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-900',   badge: 'bg-amber-500',   label: 'Perbaikan' },
} as const;

export default function LoginPage() {
  const [selected, setSelected] = useState<LoginRole>('owner');
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // ── Auth logic unchanged ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/workspace/denah');
    }
  }, [isLoading, isAuthenticated, router]);

  function handleLogin() {
    login(selected);
    router.push('/workspace/denah');
  }
  // ───────────────────────────────────────────────────────────────────────────

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-400">Memuat…</span>
      </div>
    );
  }

  const roleConfig = ROLES.find(o => o.value === selected)!;

  return (
    <div className="min-h-screen flex">

      {/* ── Left column — login form ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[460px] xl:w-[500px] shrink-0 flex flex-col justify-center bg-white px-8 py-14 lg:px-14">

        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-7">
            <span className="text-xl" aria-hidden="true">🏠</span>
            <span className="text-base font-bold text-gray-900 tracking-tight">Kosku</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug tracking-tight">
            Workspace Kosku
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Kelola kamar, penghuni, kontrak, dan properti
            langsung dari denah interaktif.
          </p>
        </div>

        {/* Role selection */}
        <div className="mb-7">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pilih peran
          </p>
          <div className="flex flex-col gap-3">
            {ROLES.map(role => {
              const isSelected = selected === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelected(role.value)}
                  aria-pressed={isSelected}
                  className={[
                    'w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-200',
                    isSelected
                      ? 'border-gray-900 bg-gray-50 shadow-lg shadow-gray-200/50 scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 shrink-0 leading-none" aria-hidden="true">
                      {role.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={[
                        'text-sm font-bold leading-none mb-1',
                        isSelected ? 'text-gray-900' : 'text-gray-700',
                      ].join(' ')}>
                        {role.label}
                      </p>
                      <p className="text-xs text-gray-500 mb-2.5">{role.tagline}</p>
                      <ul className="flex flex-col gap-1">
                        {role.features.map(f => (
                          <li key={f} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="shrink-0">
                              <path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Selected indicator */}
                    <span
                      className={[
                        'shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200',
                        isSelected ? 'bg-gray-900 scale-100' : 'bg-gray-100 scale-90',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path
                          d="M2 4.5l1.5 1.5 3.5-3"
                          stroke={isSelected ? 'white' : '#d1d5db'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login button — logic unchanged; colour and icon shift with selected role */}
        <button
          type="button"
          onClick={handleLogin}
          className={[
            'w-full text-white text-sm font-semibold py-3.5 rounded-xl',
            'flex items-center justify-center gap-2',
            'active:scale-[0.99] transition-all duration-300',
            BUTTON_BG[selected],
          ].join(' ')}
        >
          <span aria-hidden="true">{roleConfig.icon}</span>
          Masuk sebagai {roleConfig.label}
        </button>

        {/* Back to public — unchanged */}
        <div className="mt-7 pt-5 border-t border-gray-100 text-center">
          <a
            href="/kos"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
          >
            ← Kembali ke Halaman Publik
          </a>
        </div>
      </div>

      {/* ── Right column — workspace preview (desktop only) ───────────────────── */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f1f5f9 100%)' }}
        aria-hidden="true"
      >
        {/* Ambient depth blobs */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-56 h-56 bg-slate-200/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 -left-12 w-40 h-40 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-md flex flex-col gap-4">

          {/* Workspace preview card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-300/30 overflow-hidden">

            {/* Mock window chrome */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-300/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-300/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-300/80" />
              </div>
              <span className="flex-1 text-xs font-medium text-gray-600 pl-1 truncate">Kosku</span>
              <span className="text-[10px] text-white bg-gray-800 px-2 py-0.5 rounded font-medium">Edit</span>
            </div>

            {/* Mock floor tabs */}
            <div className="flex gap-1 px-4 pt-2.5 pb-2 border-b border-gray-100">
              <span className="text-[11px] font-semibold text-gray-900 px-3 py-1 rounded-md bg-gray-100">Lantai 1</span>
              <span className="text-[11px] text-gray-400 px-3 py-1 rounded-md">Lantai 2</span>
            </div>

            {/* Mock stats bar */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 px-4 py-2 text-[11px]">
              <span className="font-semibold text-gray-700">5 kamar</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">7 fasilitas</span>
              <span className="text-gray-300">·</span>
              <span className="text-emerald-700">3 tersedia</span>
              <span className="text-gray-300">·</span>
              <span className="text-blue-700">1 terisi</span>
              <span className="text-gray-300">·</span>
              <span className="text-amber-700">1 perbaikan</span>
            </div>

            {/* Mock grid — 4 × 3, rooms and facilities mixed */}
            <div className="grid grid-cols-4 gap-1 px-3 pb-3">
              {PREVIEW_CELLS.map((cell, i) => {
                if (cell.kind === 'room') {
                  const s = ROOM_STYLE[cell.status];
                  return (
                    <div
                      key={cell.id}
                      className={[s.bg, s.border, s.text, 'border-2 rounded-lg p-1.5 flex flex-col gap-1'].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-0.5">
                        <span className="font-bold text-[10px] leading-tight">{cell.id}</span>
                        <span className={`${s.badge} text-white text-[7px] font-semibold px-1 py-px rounded-full leading-none shrink-0`}>
                          {s.label}
                        </span>
                      </div>
                      <span className="text-[8px] font-medium opacity-60 truncate leading-none">{cell.type}</span>
                      <span className="text-[8px] opacity-40 mt-auto leading-none">{cell.price}</span>
                    </div>
                  );
                }
                // Facility tile — inline styles mirror facilityConfig.ts exactly
                return (
                  <div
                    key={`fac-${i}`}
                    style={{ backgroundColor: cell.bg, borderColor: cell.bd, color: cell.fg }}
                    className="border-2 rounded-lg p-1.5 flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-base leading-none select-none">{cell.icon}</span>
                    <span className="text-[8px] font-medium text-center leading-tight truncate max-w-full">{cell.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Mock legend */}
            <div className="flex gap-3 px-4 py-2.5 border-t border-gray-100">
              {[
                { dot: 'bg-emerald-500', label: 'Tersedia'  },
                { dot: 'bg-blue-500',    label: 'Terisi'    },
                { dot: 'bg-amber-500',   label: 'Perbaikan' },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-1 text-[10px] text-gray-400">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-[11px] text-gray-400 leading-relaxed px-4">
            Denah interaktif — kelola kamar dan seluruh properti dalam satu tampilan
          </p>
        </div>
      </div>

    </div>
  );
}
