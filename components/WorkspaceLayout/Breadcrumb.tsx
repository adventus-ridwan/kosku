'use client';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/features/workspace/navConfig';

export function Breadcrumb() {
  const pathname = usePathname();
  const match = NAV_ITEMS.find(item => pathname.startsWith(item.href));
  const label = match?.label ?? pathname.split('/').filter(Boolean).pop() ?? '';

  return <span className="text-sm font-medium text-gray-700">{label}</span>;
}
