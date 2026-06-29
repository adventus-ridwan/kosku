import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';

export default function WorkspaceRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </ProtectedRoute>
  );
}
