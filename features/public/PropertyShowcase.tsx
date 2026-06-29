// Static SVG illustration of a modern Indonesian boarding house at dusk.
// Used as the Hero visual on the public landing page until an owner uploads
// a real cover photo.  All coordinates are relative to viewBox "0 0 300 400"
// which gives a natural 3:4 portrait aspect ratio.

export function PropertyShowcase() {
  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto block"
      role="img"
      aria-label="Ilustrasi gedung kos modern"
    >
      <defs>
        <linearGradient id="psc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#020617" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="psc-bldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3d5069" />
          <stop offset="100%" stopColor="#2d3d50" />
        </linearGradient>
        {/* Warm amber window — lit room */}
        <linearGradient id="psc-win-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.85" />
        </linearGradient>
        {/* Dim window — unoccupied room */}
        <linearGradient id="psc-win-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fde68a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
        </linearGradient>
        {/* Ground ambient light spill */}
        <radialGradient id="psc-glow" cx="50%" cy="0%" r="70%">
          <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"  />
        </radialGradient>
      </defs>

      {/* ── Sky ────────────────────────────────────────────────────────── */}
      <rect width="300" height="400" fill="url(#psc-sky)" />

      {/* Stars */}
      <circle cx="35"  cy="25" r="1"   fill="#1e3a5f" />
      <circle cx="90"  cy="15" r="1.5" fill="#1e3a5f" />
      <circle cx="165" cy="30" r="1"   fill="#1e3a5f" />
      <circle cx="240" cy="12" r="1.5" fill="#1e3a5f" />
      <circle cx="270" cy="35" r="1"   fill="#1e3a5f" />
      <circle cx="50"  cy="50" r="1"   fill="#1e3a5f" />
      <circle cx="280" cy="55" r="1"   fill="#1e3a5f" />

      {/* ── Rooftop railing ────────────────────────────────────────────── */}
      <rect x="28" y="48" width="244" height="3"  rx="1" fill="#6b7f94" />
      {[55, 105, 155, 205, 245].map(px => (
        <rect key={px} x={px} y="48" width="4" height="14" rx="1" fill="#6b7f94" />
      ))}
      {/* Parapet cap */}
      <rect x="26" y="60" width="248" height="14" rx="2" fill="#576880" />
      <rect x="26" y="60" width="248" height="4"  rx="1" fill="#7a92a8" />

      {/* ── Building body ──────────────────────────────────────────────── */}
      {/* Depth shadow */}
      <rect x="33" y="73" width="240" height="219" rx="2" fill="#0f172a" opacity="0.4" />
      {/* Facade */}
      <rect x="30" y="70" width="240" height="220" rx="1" fill="url(#psc-bldg)" />

      {/* Floor separators */}
      <rect x="30" y="140" width="240" height="4" fill="#1a2d3e" />
      <rect x="30" y="210" width="240" height="4" fill="#1a2d3e" />

      {/* ── Floor 3 windows ────────────────────────────────────────────── */}
      {/* Left — lit */}
      <rect x="44"  y="80" width="54" height="48" rx="2" fill="#1e293b" />
      <rect x="47"  y="83" width="48" height="42" rx="1" fill="url(#psc-win-a)" opacity="0.9" />
      {/* Centre — lit */}
      <rect x="123" y="80" width="54" height="48" rx="2" fill="#1e293b" />
      <rect x="126" y="83" width="48" height="42" rx="1" fill="url(#psc-win-a)" />
      {/* Right — dim (available) */}
      <rect x="202" y="80" width="54" height="48" rx="2" fill="#1e293b" />
      <rect x="205" y="83" width="48" height="42" rx="1" fill="url(#psc-win-b)" />

      {/* ── Floor 2 windows ────────────────────────────────────────────── */}
      {/* Left — dim */}
      <rect x="44"  y="150" width="54" height="48" rx="2" fill="#1e293b" />
      <rect x="47"  y="153" width="48" height="42" rx="1" fill="url(#psc-win-b)" />
      {/* Centre — lit */}
      <rect x="123" y="150" width="54" height="48" rx="2" fill="#1e293b" />
      <rect x="126" y="153" width="48" height="42" rx="1" fill="url(#psc-win-a)" opacity="0.95" />
      {/* Right — lit */}
      <rect x="202" y="150" width="54" height="48" rx="2" fill="#1e293b" />
      <rect x="205" y="153" width="48" height="42" rx="1" fill="url(#psc-win-a)" opacity="0.85" />

      {/* ── Ground floor ───────────────────────────────────────────────── */}
      {/* Left side window */}
      <rect x="44"  y="220" width="50" height="64" rx="2" fill="#1e293b" />
      <rect x="47"  y="223" width="44" height="58" rx="1" fill="url(#psc-win-a)" opacity="0.7" />

      {/* Entrance — double door */}
      <rect x="108" y="218" width="84" height="72" rx="2" fill="#1e293b" />
      {/* Transom window above doors */}
      <rect x="111" y="221" width="78" height="22" rx="1" fill="url(#psc-win-a)" opacity="0.3" />
      {/* Left door panel */}
      <rect x="112" y="245" width="37" height="45" rx="1" fill="#0e1928" />
      {/* Right door panel */}
      <rect x="151" y="245" width="37" height="45" rx="1" fill="#0e1928" />
      {/* Door handles */}
      <circle cx="148" cy="269" r="2.5" fill="#94a3b8" />
      <circle cx="153" cy="269" r="2.5" fill="#94a3b8" />

      {/* Right side window */}
      <rect x="206" y="220" width="50" height="64" rx="2" fill="#1e293b" />
      <rect x="209" y="223" width="44" height="58" rx="1" fill="url(#psc-win-a)" opacity="0.8" />

      {/* ── Ground ─────────────────────────────────────────────────────── */}
      <rect x="0" y="290" width="300" height="110" fill="#060d18" />
      {/* Walkway from entrance to street */}
      <rect x="126" y="290" width="48" height="110" fill="#0a1525" />
      <rect x="126" y="290" width="1"  height="110" fill="#0f1e30" />
      <rect x="173" y="290" width="1"  height="110" fill="#0f1e30" />

      {/* ── Perimeter walls & gate posts ───────────────────────────────── */}
      <rect x="0"   y="258" width="28" height="34" rx="1" fill="#324155" />
      <rect x="272" y="258" width="28" height="34" rx="1" fill="#324155" />
      <rect x="26"  y="246" width="7"  height="46" rx="1" fill="#4a6077" />
      <rect x="267" y="246" width="7"  height="46" rx="1" fill="#4a6077" />

      {/* ── Left tree ──────────────────────────────────────────────────── */}
      <rect x="6"  y="268" width="7" height="28" rx="2" fill="#1a2535" />
      <ellipse cx="10" cy="256" rx="22" ry="24" fill="#042f1b" />
      <ellipse cx="10" cy="242" rx="17" ry="19" fill="#064e3b" />
      <ellipse cx="10" cy="230" rx="12" ry="14" fill="#065f46" />
      <ellipse cx="10" cy="220" rx="8"  ry="10" fill="#047857" />

      {/* ── Right tree ─────────────────────────────────────────────────── */}
      <rect x="287" y="268" width="7" height="28" rx="2" fill="#1a2535" />
      <ellipse cx="290" cy="256" rx="22" ry="24" fill="#042f1b" />
      <ellipse cx="290" cy="242" rx="17" ry="19" fill="#064e3b" />
      <ellipse cx="290" cy="230" rx="12" ry="14" fill="#065f46" />
      <ellipse cx="290" cy="220" rx="8"  ry="10" fill="#047857" />

      {/* Small potted plants flanking entrance */}
      <rect x="33"  y="280" width="5" height="12" rx="1" fill="#1a2535" />
      <ellipse cx="36"  cy="276" rx="8" ry="9" fill="#065f46" />
      <rect x="262" y="280" width="5" height="12" rx="1" fill="#1a2535" />
      <ellipse cx="264" cy="276" rx="8" ry="9" fill="#065f46" />

      {/* ── Ambient window glow on ground ──────────────────────────────── */}
      <ellipse cx="150" cy="293" rx="120" ry="8" fill="url(#psc-glow)" />
    </svg>
  );
}
