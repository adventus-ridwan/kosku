'use client';

import { useMemo } from 'react';
import type { ContractStatus } from '@/features/tenants/types';
import {
  buildHistoryEntries,
  buildHistorySummary,
  formatDuration,
} from './historyUtils';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ContractStatus, string> = {
  ACTIVE:    'Aktif',
  FINISHED:  'Selesai',
  CANCELLED: 'Dibatalkan',
};

const STATUS_BADGE: Record<ContractStatus, string> = {
  ACTIVE:    'bg-blue-100 text-blue-700',
  FINISHED:  'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
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

// Compact currency for summary cards: abbreviates millions as "jt".
function formatRevenueSummary(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  }
  return formatCurrency(amount);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface HistoryTabProps {
  roomId: string;
}

export function HistoryTab({ roomId }: HistoryTabProps) {
  const entries = useMemo(() => buildHistoryEntries(roomId), [roomId]);
  const summary = useMemo(() => buildHistorySummary(entries), [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">No Contract History</p>
        <p className="text-xs text-gray-400">This room has never been rented.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gray-900 leading-tight">{summary.totalContracts}</p>
          <p className="text-[11px] text-gray-500 mt-1">Kontrak</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm font-bold text-gray-900 leading-tight break-words">
            {formatRevenueSummary(summary.lifetimeRevenue)}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Pendapatan</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {formatDuration(summary.averageStayDays)}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Rata-rata</p>
        </div>
      </div>

      {/* Contract list */}
      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.contractId} className="border border-gray-100 rounded-xl p-4 space-y-3">

            {/* Header: name + status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{entry.tenantName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {entry.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[entry.status]}`}
              >
                {STATUS_LABEL[entry.status]}
              </span>
            </div>

            {/* Details grid */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <div>
                <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mulai</dt>
                <dd className="text-xs text-gray-700 mt-0.5">{formatDate(entry.startDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Selesai</dt>
                <dd className="text-xs text-gray-700 mt-0.5">{formatDate(entry.endDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Durasi</dt>
                <dd className="text-xs text-gray-700 mt-0.5">{formatDuration(entry.durationDays)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Harga / Bln</dt>
                <dd className="text-xs font-medium text-gray-700 mt-0.5">
                  {entry.monthlyRent > 0 ? formatCurrency(entry.monthlyRent) : '—'}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
