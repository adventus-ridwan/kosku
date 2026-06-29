import type { UserRole } from '@/features/auth/types';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[]; // undefined = visible to all authorized roles; populate for per-item RBAC
  hidden?: boolean;   // true = omit from sidebar; page still accessible by direct URL
}

export const NAV_ITEMS: NavItem[] = [
  // Operational — owner + penjaga
  { label: 'Denah',       href: '/workspace/denah',       icon: '🗺️' },
  { label: 'Kamar',       href: '/workspace/rooms',       icon: '🚪' },
  { label: 'Penghuni',    href: '/workspace/tenants',     icon: '👤',  hidden: true },
  { label: 'Kontrak',     href: '/workspace/contracts',   icon: '📋',  hidden: true },
  // Management — owner only
  { label: 'Dashboard',   href: '/workspace/dashboard',   icon: '📊',  roles: ['owner'], hidden: true },
  { label: 'Properti',    href: '/workspace/property',    icon: '🏠',  roles: ['owner'] },
  { label: 'Tipe Kamar',  href: '/workspace/room-types',  icon: '🏷️', roles: ['owner'] },
  { label: 'Pengaturan',  href: '/workspace/settings',    icon: '⚙️',  roles: ['owner'], hidden: true },
];
