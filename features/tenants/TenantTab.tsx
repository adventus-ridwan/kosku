'use client';

import { useState } from 'react';
import type { RoomStatus, AppMode } from '@/types';
import type { Gender } from './types';
import { useTenant } from './useTenant';
import { useAuth } from '@/features/auth/useAuth';
import { canAddTenant } from '@/features/auth/permission';

const FIELD =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
  'focus:border-gray-900 transition-shadow';

interface TenantTabProps {
  roomId: string;
  roomStatus: RoomStatus;
  mode: AppMode;
  onRoomOccupied: () => void;
}

interface FormState {
  name: string;
  gender: Gender;
  phone: string;
  occupation: string;
  emergencyContact: string;
  tenantNotes: string;
  monthlyRent: string;
  deposit: string;
  startDate: string;
  endDate: string;
  contractNotes: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  gender: 'MALE',
  phone: '',
  occupation: '',
  emergencyContact: '',
  tenantNotes: '',
  monthlyRent: '',
  deposit: '',
  startDate: '',
  endDate: '',
  contractNotes: '',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(dateStr + 'T00:00:00'));
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(amount);
}

export function TenantTab({ roomId, roomStatus, mode, onRoomOccupied }: TenantTabProps) {
  const { role } = useAuth();
  const { tenant, contract, isLoading, createTenantAndContract } = useTenant(roomId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Nama tidak boleh kosong';
    if (!form.startDate) e.startDate = 'Tanggal mulai harus diisi';
    if (!form.endDate) e.endDate = 'Tanggal selesai harus diisi';
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      e.endDate = 'Tanggal selesai harus setelah tanggal mulai';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!canAddTenant(role)) return;
    if (roomStatus !== 'available') return;
    if (!validate()) return;

    createTenantAndContract(
      {
        name: form.name.trim(),
        gender: form.gender,
        phone: form.phone.trim(),
        occupation: form.occupation.trim(),
        emergencyContact: form.emergencyContact.trim(),
        notes: form.tenantNotes.trim(),
      },
      {
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyRent: form.monthlyRent === '' ? 0 : Math.max(0, Number(form.monthlyRent) || 0),
        deposit: form.deposit === '' ? 0 : Math.max(0, Number(form.deposit) || 0),
        notes: form.contractNotes.trim(),
      },
      onRoomOccupied,
    );

    setShowForm(false);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function handleCancel() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="text-sm text-gray-400">Memuat…</span>
      </div>
    );
  }

  // ── Occupied: show current tenant + contract ─────────────────────────────────
  if (tenant && contract) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Penghuni
          </p>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">Nama</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{tenant.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Jenis Kelamin</dt>
              <dd className="text-sm text-gray-900 mt-0.5">
                {tenant.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
              </dd>
            </div>
            {tenant.phone && (
              <div>
                <dt className="text-xs text-gray-500">No. Telepon</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{tenant.phone}</dd>
              </div>
            )}
            {tenant.occupation && (
              <div>
                <dt className="text-xs text-gray-500">Pekerjaan</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{tenant.occupation}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Kontrak
          </p>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">Mulai</dt>
              <dd className="text-sm text-gray-900 mt-0.5">{formatDate(contract.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Selesai</dt>
              <dd className="text-sm text-gray-900 mt-0.5">{formatDate(contract.endDate)}</dd>
            </div>
            {contract.monthlyRent > 0 && (
              <div>
                <dt className="text-xs text-gray-500">Harga / Bulan</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">
                  {formatCurrency(contract.monthlyRent)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    );
  }

  // ── Vacant: form ─────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-800">Tambah Penghuni</p>

        {/* Penghuni section */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nama <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Nama lengkap"
            className={FIELD}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis Kelamin</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['MALE', 'FEMALE'] as Gender[]).map((g, i) => (
              <button
                key={g}
                type="button"
                onClick={() => set('gender', g)}
                className={[
                  'flex-1 py-1.5 text-xs font-medium transition-colors',
                  i > 0 ? 'border-l border-gray-200' : '',
                  form.gender === g
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50',
                ].join(' ')}
              >
                {g === 'MALE' ? 'Laki-laki' : 'Perempuan'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">No. Telepon</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="08xxxxxxxxxx"
            className={FIELD}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Pekerjaan</label>
          <input
            type="text"
            value={form.occupation}
            onChange={e => set('occupation', e.target.value)}
            placeholder="Mahasiswa, Karyawan, dll"
            className={FIELD}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kontak Darurat</label>
          <input
            type="text"
            value={form.emergencyContact}
            onChange={e => set('emergencyContact', e.target.value)}
            placeholder="Nama – No. Telepon"
            className={FIELD}
          />
        </div>

        {/* Contract section */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Kontrak
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tanggal Mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            className={FIELD}
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tanggal Selesai <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.endDate}
            onChange={e => set('endDate', e.target.value)}
            className={FIELD}
          />
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Harga / Bulan (Rp)
          </label>
          <input
            type="number"
            value={form.monthlyRent}
            onChange={e => set('monthlyRent', e.target.value)}
            min={0}
            placeholder="0"
            className={FIELD}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Deposit (Rp)</label>
          <input
            type="number"
            value={form.deposit}
            onChange={e => set('deposit', e.target.value)}
            min={0}
            placeholder="0"
            className={FIELD}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Catatan</label>
          <textarea
            value={form.contractNotes}
            onChange={e => set('contractNotes', e.target.value)}
            rows={2}
            placeholder="Catatan tambahan…"
            className={`${FIELD} resize-none`}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  // ── Vacant: empty state ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm font-medium text-gray-600 mb-1">No Active Tenant</p>
      <p className="text-xs text-gray-400 mb-5">
        {roomStatus === 'available' ? 'Kamar kosong' : 'Kamar tidak tersedia untuk disewa'}
      </p>
      {roomStatus === 'available' && mode === 'edit' && canAddTenant(role) && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="text-base leading-none" aria-hidden>+</span>
          Add Tenant
        </button>
      )}
    </div>
  );
}
