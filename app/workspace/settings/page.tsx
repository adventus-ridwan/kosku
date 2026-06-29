import { OwnerRoute } from '@/features/auth/OwnerRoute';

export default function SettingsPage() {
  return (
    <OwnerRoute>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-400">Segera hadir di v0.5.</p>
      </div>
    </OwnerRoute>
  );
}
