import type { UserRole } from '@/features/auth/types';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[]; // undefined = visible to all authorized roles; populate for per-item RBAC
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/workspace/dashboard',  icon: '📊' },
  { label: 'Properti',   href: '/workspace/property',   icon: '🏠' },
  { label: 'Kamar',      href: '/workspace/rooms',      icon: '🚪' },
  { label: 'Penghuni',   href: '/workspace/tenants',    icon: '👤' },
  { label: 'Kontrak',    href: '/workspace/contracts',  icon: '📋' },
  { label: 'Pengaturan', href: '/workspace/settings',   icon: '⚙️' },
];
