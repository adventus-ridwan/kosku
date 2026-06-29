'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import type { UserRole } from '@/features/auth/types';

type LoginRole = Exclude<UserRole, 'public'>;

const ROLES: { value: LoginRole; label: string; description: string }[] = [
  { value: 'owner',   label: 'Owner',   description: 'Akses penuh ke semua fitur' },
  { value: 'penjaga', label: 'Penjaga', description: 'Kelola kamar dan fasilitas' },
];

export default function LoginPage() {
  const [selected, setSelected] = useState<LoginRole>('owner');
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/workspace/denah');
    }
  }, [isLoading, isAuthenticated, router]);

  function handleLogin() {
    login(selected);
    router.push('/workspace/denah');
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-400">Memuat…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Kosku</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kos lebih mudah dengan denah interaktif.</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Pilih peran</p>
          <div className="space-y-2">
            {ROLES.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                className={[
                  'w-full text-left px-4 py-3 rounded-xl border-2 transition-colors',
                  selected === opt.value
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <p className={`text-sm font-semibold ${selected === opt.value ? 'text-gray-900' : 'text-gray-700'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Masuk sebagai {ROLES.find(o => o.value === selected)?.label}
        </button>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <a
            href="/kos"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
          >
            ← Kembali ke Halaman Publik
          </a>
        </div>
      </div>
    </div>
  );
}
