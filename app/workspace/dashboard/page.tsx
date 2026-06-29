import { OwnerRoute } from '@/features/auth/OwnerRoute';

export default function DashboardPage() {
  return (
    <OwnerRoute>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">Diimplementasi di ET-010.</p>
      </div>
    </OwnerRoute>
  );
}
