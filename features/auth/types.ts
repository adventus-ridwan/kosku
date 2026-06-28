export type UserRole = 'public' | 'penjaga' | 'owner';

export interface AuthState {
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}
