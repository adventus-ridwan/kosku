import { OwnerRoute } from '@/features/auth/OwnerRoute';
import { RoomTypesPage } from '@/features/roomTypes/RoomTypesPage';

export default function RoomTypesRoutePage() {
  return (
    <OwnerRoute>
      <RoomTypesPage />
    </OwnerRoute>
  );
}
