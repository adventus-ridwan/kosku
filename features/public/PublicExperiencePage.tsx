'use client';

import { usePropertyProfile } from '@/features/property/usePropertyProfile';
import { UsageModeProvider } from '@/context/UsageModeContext';
import BoardingHouseMap from '@/components/BoardingHouseMap';
import type { RoomType, RoomAmenity } from '@/types';
import type { PropertyAmenity, PropertyType } from '@/features/property/types';

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

// ─── Section: Hero ─────────────────────────────────────────────────────────────

interface HeroProps {
  name:       string;
  tagline?:   string;
  address?:   string;
  type?:      PropertyType;
  waUrl?:     string;
}

function HeroSection({ name, tagline, address, type, waUrl }: HeroProps) {
  return (
    <section className="bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
        {type && (
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-5">
            {PROPERTY_TYPE_LABEL[type]}
          </p>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
          {name || 'Kos Kami'}
        </h1>
        {tagline && (
          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            {tagline}
          </p>
        )}
        {address && (
          <p className="flex items-start gap-1.5 text-slate-400 text-sm mb-10">
            <span className="shrink-0 mt-px">📍</span>
            <span>{address}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <span>💬</span> Hubungi Owner
            </a>
          )}
          <a
            href="#peta"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Jelajahi Kos ↓
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Interactive Map ──────────────────────────────────────────────────

function MapSection() {
  return (
    <section id="peta">
      <div className="bg-slate-800 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-1">Denah Kos</h2>
          <p className="text-slate-400 text-sm">
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
    <section id="tentang" className="bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Tentang Kos</h2>
        <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
          {description}
        </p>
      </div>
    </section>
  );
}

// ─── Section: Property Amenities ──────────────────────────────────────────────

function AmenitiesSection({ amenities }: { amenities: PropertyAmenity[] }) {
  return (
    <section id="fasilitas" className="bg-slate-50 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Fasilitas Umum</h2>
        <p className="text-slate-500 text-sm mb-8">Tersedia untuk seluruh penghuni.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {amenities.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
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

function RoomTypeCard({ type, waUrl }: { type: RoomType; waUrl?: string }) {
  const availableAmenities: RoomAmenity[] = type.amenities.filter(a => a.available);

  return (
    <div className="border border-slate-200 rounded-2xl p-6 hover:border-amber-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-slate-900">{type.name}</h3>
        {type.price && (
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-amber-600">{formatPrice(type.price)}</p>
            <p className="text-xs text-slate-400">/ bulan</p>
          </div>
        )}
      </div>

      {(type.size || type.capacity) && (
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-500">
          {type.size     && <span>📐 {type.size} m²</span>}
          {type.capacity && <span>👤 Maks. {type.capacity} orang</span>}
        </div>
      )}

      {type.description && (
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          {type.description}
        </p>
      )}

      {availableAmenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-500 text-sm font-medium transition-colors"
        >
          <span>💬</span> Tanya ketersediaan
        </a>
      )}
    </div>
  );
}

function RoomTypesSection({ types, waUrl }: { types: RoomType[]; waUrl?: string }) {
  return (
    <section id="tipe-kamar" className="bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Tipe Kamar</h2>
        <p className="text-slate-500 text-sm mb-8">
          Pilih tipe kamar yang sesuai dengan kebutuhanmu.
        </p>
        <div className="flex flex-col gap-5">
          {types.map(rt => (
            <RoomTypeCard key={rt.id} type={rt} waUrl={waUrl} />
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
    <section id="kontak" className="bg-slate-900 text-white py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-3">Tertarik Tinggal di Sini?</h2>
        <p className="text-slate-400 text-base mb-10">
          Hubungi kami untuk informasi ketersediaan kamar dan jadwal survei.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
            >
              <span>💬</span> Hubungi via WhatsApp
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-4 rounded-xl transition-colors text-base"
            >
              <span>📞</span> {phone}
            </a>
          )}
        </div>

        {!waUrl && !phone && (
          <p className="text-slate-500 text-sm">
            Informasi kontak belum tersedia.
          </p>
        )}

        {address && (
          <p className="flex items-start gap-1.5 justify-center text-slate-500 text-sm mt-8">
            <span className="shrink-0 mt-px">📍</span>
            <span>{address}</span>
          </p>
        )}

        <p className="text-slate-700 text-xs mt-12">
          Dibuat dengan Kosku
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PublicExperiencePage() {
  const { boardingHouse, isLoading } = usePropertyProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-500 text-sm">Memuat…</p>
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

  return (
    <main className="scroll-smooth">
      <HeroSection
        name={boardingHouse.name}
        tagline={boardingHouse.tagline?.trim() || undefined}
        address={address}
        type={boardingHouse.type}
        waUrl={waUrl}
      />

      <MapSection />

      {boardingHouse.description?.trim() && (
        <AboutSection description={boardingHouse.description.trim()} />
      )}

      {availableAmenities.length > 0 && (
        <AmenitiesSection amenities={availableAmenities} />
      )}

      {publishedTypes.length > 0 && (
        <RoomTypesSection types={publishedTypes} waUrl={waUrl} />
      )}

      <ContactSection waUrl={waUrl} phone={phone} address={address} />
    </main>
  );
}
