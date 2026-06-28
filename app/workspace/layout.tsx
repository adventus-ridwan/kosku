import { OwnerRoute } from '@/features/auth/OwnerRoute';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';

export default function WorkspaceRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerRoute>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </OwnerRoute>
  );
}
