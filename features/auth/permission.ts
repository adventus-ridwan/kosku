import type { UserRole } from './types';

export function canEditRoom(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canAddRoom(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canDeleteRoom(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canEditFacility(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canAddFacility(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canDeleteFacility(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canViewRevenue(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canViewAnalytics(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canViewFinancials(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canAccessAdmin(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canManageUsers(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canManageSettings(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canAddTenant(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canEditTenant(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canFinishContract(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}

export function canViewTenantInfo(role: UserRole | null): boolean {
  return role === 'penjaga' || role === 'owner';
}
