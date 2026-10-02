import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest, setCsrfToken } from '../lib/api';
import type { AuthenticatedUser } from './types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  sessionExpired: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  updateProfile(input: { version: number; name: string; email: string; avatarUrl: string | null }): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  can(permission: string): boolean;
}

interface UserResponse {
  data: { user: AuthenticatedUser };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const clear = useCallback((expired = false) => {
    setCsrfToken(null);
    setUser(null);
    setStatus('unauthenticated');
    setSessionExpired(expired);
  }, []);

  useEffect(() => {
    const unauthorized = () => clear(true);
    window.addEventListener('auth:unauthorized', unauthorized);
    return () => window.removeEventListener('auth:unauthorized', unauthorized);
  }, [clear]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const me = await apiRequest<UserResponse>('/auth/me', { notifyUnauthorized: false });
        const csrf = await apiRequest<{ data: { csrfToken: string } }>('/auth/csrf', {
          notifyUnauthorized: false,
        });
        if (cancelled) return;
        setCsrfToken(csrf.data.csrfToken);
        setUser(me.data.user);
        setStatus('authenticated');
      } catch {
        if (!cancelled) clear(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clear]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<
      UserResponse & { data: { user: AuthenticatedUser; csrfToken: string } }
    >('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      notifyUnauthorized: false,
    });
    setCsrfToken(response.data.csrfToken);
    setUser(response.data.user);
    setSessionExpired(false);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
    } finally {
      clear(false);
    }
  }, [clear]);

  const logoutAll = useCallback(async () => {
    try {
      await apiRequest<void>('/auth/logout-all', { method: 'POST' });
    } finally {
      clear(false);
    }
  }, [clear]);

  const updateProfile = useCallback(async (input: { version: number; name: string; email: string; avatarUrl: string | null }) => {
    const response = await apiRequest<UserResponse>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    setUser(response.data.user);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiRequest<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    clear(false);
  }, [clear]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    sessionExpired,
    login,
    logout,
    logoutAll,
    updateProfile,
    changePassword,
    can: (permission) => user?.permissions.includes(permission) ?? false,
  }), [status, user, sessionExpired, login, logout, logoutAll, updateProfile, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}
