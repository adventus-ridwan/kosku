'use client';

import { UsageModeProvider } from '@/context/UsageModeContext';
import BoardingHouseMap from '@/components/BoardingHouseMap';

export default function DenahPage() {
  return (
    <UsageModeProvider mode="admin">
      <BoardingHouseMap />
    </UsageModeProvider>
  );
}
