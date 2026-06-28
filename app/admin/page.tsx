import { UsageModeProvider } from '@/context/UsageModeContext';
import BoardingHouseMap from '@/components/BoardingHouseMap';

export default function AdminPage() {
  return (
    <UsageModeProvider mode="admin">
      <BoardingHouseMap />
    </UsageModeProvider>
  );
}
