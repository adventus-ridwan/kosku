'use client';

import { useState, useEffect } from 'react';
import { usePropertyProfile } from '@/features/property/usePropertyProfile';
import { UsageModeProvider } from '@/context/UsageModeContext';
import BoardingHouseMap from '@/components/BoardingHouseMap';
import { isRoom, type RoomType, type RoomAmenity } from '@/types';
import type { PropertyAmenity, PropertyType } from '@/features/property/types';
import Image from 'next/image';
import { resolveRoomProfile } from '@/lib/resolveRoomProfile';
import { getDummyGallery } from '@/lib/dummyGallery';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  MALE:   'Kos Putra',
  FEMALE: 'Kos Putri',
  MIXED:  'Kos Campur',
};

function formatPrice(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style:                 'currency',
    currency:              'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

function buildWaUrl(raw: string, propertyName: string): string {
  const digits = raw.replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
  const message = `Halo, saya tertarik dengan kos ${propertyName}. Apakah masih ada kamar tersedia?`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function getSuitableFor(typeName: string): string[] {
  const n = typeName.toLowerCase();
  if (/premium|luxury|mewah/.test(n))                   return ['Karyawan', 'Pasangan', 'Remote Worker'];
  if (/deluxe|exclusive|eksklusif|vip|suite/.test(n))   return ['Mahasiswa', 'Karyawan', 'Pasangan'];
  if (/ekonom|economy|basic|dasar|hemat|murah/.test(n)) return ['Mahasiswa'];
  return ['Mahasiswa', 'Karyawan', 'Remote Worker'];
}

// ─── Page Nav ──────────────────────────────────────────────────────────────────
// Fixed top bar: property name left, Owner Login right.
// Owner workspace entry lives here — out of the hero CTA cluster.

function PageNav({ propertyName }: { propertyName: string }) {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-10 bg-slate-900/85 backdrop-blur-sm border-b border-white/[0.06]"
      aria-label="Navigasi halaman"
    >
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-white truncate">
          {propertyName || 'Kosku'}
        </span>
        <a
          href="/workspace"
          className="shrink-0 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Owner Login
        </a>
      </div>
    </nav>
  );
}

// ─── Stat Block ────────────────────────────────────────────────────────────────

interface StatBlockProps {
  icon:     string;
  value:    number;
  label:    string;
  accent?:  boolean;
}

function StatBlock({ icon, value, label, accent }: StatBlockProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] min-w-[72px]">
      <span className="text-base leading-none" aria-hidden>{icon}</span>
      <span className={[
        'text-[1.65rem] font-bold tabular-nums leading-none',
        accent ? 'text-emerald-400' : 'text-white',
      ].join(' ')}>
        {value}
      </span>
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mt-0.5">
        {label}
      </span>
    </div>
  );
}

// ─── Section: Hero ─────────────────────────────────────────────────────────────

interface HeroProps {
  name:           string;
  tagline?:       string;
  address?:       string;
  type?:          PropertyType;
  waUrl?:         string;
  totalRooms:     number;
  availableRooms: number;
  floorCount:     number;
  typeCount:      number;
  trustSignals:   string[];
}

function HeroSection({
  name, tagline, address, type, waUrl,
  totalRooms, availableRooms, floorCount, typeCount,
  trustSignals,
}: HeroProps) {
  return (
    // pt-20 clears the 48px fixed nav bar + provides breathing room
    <section className="bg-slate-900 text-white">
      <div className="max-w-[1440px] mx-auto px-6 pt-20 pb-24 sm:pt-24 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-4 items-center">

          {/* ── Content ─────────────────────────────────────────────────────── */}
          <div className="lg:col-start-2 lg:col-span-5">

            {/* Eyebrow */}
            {type && (
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-5">
                {PROPERTY_TYPE_LABEL[type]}
              </p>
            )}

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] mb-4">
              {name || 'Kos Kami'}
            </h1>

            {/* Tagline */}
            {tagline ? (
              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-5 max-w-lg">
                {tagline}
              </p>
            ) : (
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-5">
                Hunian nyaman, fasilitas lengkap.
              </p>
            )}

            {/* Address */}
            {address && (
              <p className="flex items-start gap-1.5 text-slate-400 text-sm mb-7">
                <span className="shrink-0 mt-px">📍</span>
                <span>{address}</span>
              </p>
            )}

            {/* Stat blocks — live counts */}
            {totalRooms > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                <StatBlock icon="🏠" value={totalRooms}     label="Kamar"    />
                {availableRooms > 0 && (
                  <StatBlock icon="🟢" value={availableRooms} label="Tersedia" accent />
                )}
                {typeCount > 0 && (
                  <StatBlock icon="🛏" value={typeCount}      label="Tipe"     />
                )}
                {floorCount > 1 && (
                  <StatBlock icon="🏢" value={floorCount}     label="Lantai"   />
                )}
              </div>
            )}

            {/* Trust indicators — from property amenities or sensible defaults */}
            {trustSignals.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
                {trustSignals.map((signal, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-emerald-500 font-bold leading-none">✓</span>
                    {signal}
                  </span>
                ))}
              </div>
            )}

            {/* Primary CTA — single action only */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base"
              >
                <span>💬</span> Hubungi via WhatsApp
              </a>
            )}
          </div>

          {/* ── Hero illustration ───────────────────────────────────────────── */}
          <div className="hidden lg:col-start-7 lg:col-span-6 lg:flex items-center justify-center relative">
            {/* Soft radial glow anchors the image to the dark background */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: '-24%',
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.045) 0%, transparent 68%)',
              }}
            />
            <Image
              src="/images/hero-building-dark.png"
              alt=""
              width={1536}
              height={1024}
              className="relative w-full h-auto"
              style={{
                filter: 'drop-shadow(0 6px 28px rgba(0,0,0,0.45))',
                opacity: 0.97,
              }}
              priority
              draggable={false}
            />
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Section: Interactive Map ──────────────────────────────────────────────────

function MapSection() {
  return (
    <section id="peta">
      <div className="bg-slate-800 px-6 pt-16 pb-10 sm:pt-20 sm:pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-4">
            Denah
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">Peta Kamar</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg">
            Klik kamar atau fasilitas untuk melihat detailnya.
          </p>
        </div>
      </div>
      <UsageModeProvider mode="public">
        <BoardingHouseMap />
      </UsageModeProvider>
    </section>
  );
}

// ─── Section: About ────────────────────────────────────────────────────────────

function AboutSection({ description }: { description: string }) {
  return (
    <section id="tentang" className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">Tentang</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">Tentang Kos Ini</h2>
        <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line max-w-2xl">
          {description}
        </p>
      </div>
    </section>
  );
}

// ─── Section: Property Amenities ──────────────────────────────────────────────

function AmenitiesSection({ amenities }: { amenities: PropertyAmenity[] }) {
  return (
    <section id="fasilitas" className="bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">Fasilitas</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">Fasilitas Umum</h2>
        <p className="text-slate-500 text-sm sm:text-base mb-10">Tersedia untuk seluruh penghuni.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {amenities.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-amber-200 hover:shadow-md transition-all duration-200"
            >
              <span className="text-2xl leading-none">{a.icon}</span>
              <span className="text-sm font-medium text-slate-700">{a.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Room Types ──────────────────────────────────────────────────────

function RoomTypeCard({ type, waUrl, photoUrl }: { type: RoomType; waUrl?: string; photoUrl?: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const availableAmenities: RoomAmenity[] = type.amenities.filter(a => a.available);
  const suitableFor = getSuitableFor(type.name);

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-amber-200 hover:shadow-lg transition-all duration-200 group">
      {/* Photo */}
      <div className="w-full aspect-video bg-slate-100 overflow-hidden">
        {photoUrl && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`Foto ${type.name}`}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <circle cx="12" cy="12" r="4" />
              <path d="M7.5 5 9 3h6l1.5 2" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{type.name}</h3>
          {type.price && (
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-amber-600">{formatPrice(type.price)}</p>
              <p className="text-xs text-slate-400">/ bulan</p>
            </div>
          )}
        </div>

        {/* Size + Capacity */}
        {(type.size || type.capacity) && (
          <div className="flex flex-wrap gap-4 mb-3 text-sm text-slate-500">
            {type.size     && <span>📐 {type.size} m²</span>}
            {type.capacity && <span>👤 Maks. {type.capacity} orang</span>}
          </div>
        )}

        {/* Description */}
        {type.description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {type.description}
          </p>
        )}

        {/* Amenities */}
        {availableAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {availableAmenities.map(a => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-600"
              >
                {a.icon} {a.name}
              </span>
            ))}
          </div>
        )}

        {/* Cocok untuk */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Cocok untuk
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {suitableFor.map(s => (
              <span key={s} className="flex items-center gap-1 text-xs text-slate-600">
                <span className="text-emerald-500 font-bold">✓</span> {s}
              </span>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
          <a
            href="#peta"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            🗺️ Lihat kamar pada denah
          </a>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-green-600 hover:text-green-500 text-sm font-medium transition-colors"
            >
              💬 Tanya ketersediaan
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomTypesSection({
  types,
  waUrl,
  photoMap,
}: {
  types: RoomType[];
  waUrl?: string;
  photoMap: Record<string, string | undefined>;
}) {
  return (
    <section id="tipe-kamar" className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">Tipe Kamar</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">Pilih Kamar yang Sesuai</h2>
        <p className="text-slate-500 text-sm sm:text-base mb-10">
          Semua tipe kamar dilengkapi dengan fasilitas yang tertera.
        </p>
        <div className="flex flex-col gap-8">
          {types.map(rt => (
            <RoomTypeCard key={rt.id} type={rt} waUrl={waUrl} photoUrl={photoMap[rt.id]} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Contact ─────────────────────────────────────────────────────────

interface ContactProps {
  waUrl?:   string;
  phone?:   string;
  address?: string;
}

function ContactSection({ waUrl, phone, address }: ContactProps) {
  return (
    <section id="kontak" className="bg-slate-900 text-white py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-4">Kontak</p>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Tertarik Tinggal di Sini?</h2>
        <p className="text-slate-400 text-base sm:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          Hubungi kami untuk informasi ketersediaan kamar dan jadwal survei.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              <span>💬</span> Hubungi via WhatsApp
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              <span>📞</span> {phone}
            </a>
          )}
        </div>

        {!waUrl && !phone && (
          <p className="text-slate-600 text-sm mt-2">
            Informasi kontak belum tersedia.
          </p>
        )}

        {address && (
          <p className="flex items-center gap-1.5 justify-center text-slate-500 text-sm mt-10">
            <span aria-hidden>📍</span>
            <span>{address}</span>
          </p>
        )}

        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <p className="text-slate-600 text-xs tracking-wide">
            Dibuat dengan <span className="text-amber-600 font-medium">Kosku</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Floating Map Shortcut ────────────────────────────────────────────────────
// Appears only when the map section (#peta) has scrolled out of the viewport.
// Uses IntersectionObserver so no scroll listener is needed.

function MapShortcut() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById('peta');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function scrollToMap() {
    document.getElementById('peta')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={scrollToMap}
      aria-label="Kembali ke denah"
      className={[
        'fixed bottom-6 right-6 z-50',
        'inline-flex items-center gap-1.5 px-3.5 py-2',
        'bg-slate-800/90 backdrop-blur-sm text-white text-sm font-medium',
        'rounded-full shadow-lg border border-slate-700/50',
        'hover:bg-slate-700 transition-all duration-200',
        show
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none',
      ].join(' ')}
    >
      🗺 Denah
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PublicExperiencePage() {
  const { boardingHouse, isLoading } = usePropertyProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-slate-500 text-sm tracking-wide">Memuat…</p>
        </div>
      </div>
    );
  }

  const publishedTypes = (boardingHouse.roomTypes ?? [])
    .filter(rt => rt.publishStatus === 'published')
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

  const availableAmenities = (boardingHouse.amenities ?? []).filter(a => a.available);

  const rawWa   = boardingHouse.contact?.whatsapp?.trim() ?? '';
  const waUrl   = rawWa ? buildWaUrl(rawWa, boardingHouse.name) : undefined;
  const phone   = boardingHouse.contact?.phone?.trim() || undefined;
  const address = boardingHouse.address?.full?.trim() || undefined;

  // Hero stats — derived from existing data, no new business logic
  const allRooms       = boardingHouse.floors.flatMap(f => f.objects.filter(isRoom));
  const totalRooms     = allRooms.length;
  const availableRooms = allRooms.filter(r => r.status === 'available').length;
  const floorCount     = boardingHouse.floors.length;
  const typeCount      = publishedTypes.length;

  // Trust signals — use available property amenities (top 4); fall back to
  // sensible defaults when the owner hasn't configured amenities yet.
  const amenitySignals = (boardingHouse.amenities ?? [])
    .filter(a => a.available)
    .slice(0, 4)
    .map(a => `${a.icon} ${a.name}`);

  const trustSignals = amenitySignals.length >= 2
    ? amenitySignals
    : ['📶 WiFi Cepat', '🅿️ Parkir Tersedia', '🔒 Lingkungan Aman'];

  // First photo URL per published room type — for premium cards
  const roomTypePhotoMap: Record<string, string | undefined> = {};
  for (const type of publishedTypes) {
    const firstRoom = allRooms.find(r => r.roomTypeId === type.id);
    if (firstRoom) {
      const resolved = resolveRoomProfile(firstRoom, boardingHouse.roomTypes ?? []);
      roomTypePhotoMap[type.id] = resolved.photos[0]?.url;
    } else {
      roomTypePhotoMap[type.id] = getDummyGallery(type.name)[0]?.url;
    }
  }

  return (
    <main className="scroll-smooth">
      <PageNav propertyName={boardingHouse.name} />

      <HeroSection
        name={boardingHouse.name}
        tagline={boardingHouse.tagline?.trim() || undefined}
        address={address}
        type={boardingHouse.type}
        waUrl={waUrl}
        totalRooms={totalRooms}
        availableRooms={availableRooms}
        floorCount={floorCount}
        typeCount={typeCount}
        trustSignals={trustSignals}
      />

      <MapSection />

      {boardingHouse.description?.trim() && (
        <AboutSection description={boardingHouse.description.trim()} />
      )}

      {availableAmenities.length > 0 && (
        <AmenitiesSection amenities={availableAmenities} />
      )}

      {publishedTypes.length > 0 && (
        <RoomTypesSection types={publishedTypes} waUrl={waUrl} photoMap={roomTypePhotoMap} />
      )}

      <ContactSection waUrl={waUrl} phone={phone} address={address} />

      <MapShortcut />
    </main>
  );
}
