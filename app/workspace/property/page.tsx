import { OwnerRoute } from '@/features/auth/OwnerRoute';
import { PropertyPage } from '@/features/property/PropertyPage';

export default function PropertyRoutePage() {
  return (
    <OwnerRoute>
      <PropertyPage />
    </OwnerRoute>
  );
}
