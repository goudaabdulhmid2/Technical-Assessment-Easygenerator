import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError } from '../api/client';
import { authApi } from '../api/auth.api';
import type { AuthStatus, Credentials, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  logoutNotice: string | null;
  signIn: (credentials: Credentials) => Promise<User>;
  signOut: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);
  const checkStarted = useRef(false);

  const refresh = useCallback(async () => {
    setStatus('checking');
    try {
      const current = await authApi.currentUser();
      setUser(current);
      setStatus('authenticated');
    } catch (error) {
      setUser(null);
      setStatus(error instanceof ApiError && error.status !== 401 ? 'error' : 'unauthenticated');
    }
  }, []);

  useEffect(() => {
    if (checkStarted.current) return;
    checkStarted.current = true;
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (credentials: Credentials) => {
    const signedInUser = await authApi.signIn(credentials);
    setUser(signedInUser);
    setStatus('authenticated');
    setLogoutNotice(null);
    return signedInUser;
  }, []);

  const signOut = useCallback(async () => {
    let confirmed = true;
    try {
      await authApi.signOut();
    } catch {
      confirmed = false;
    }
    setUser(null);
    setStatus('unauthenticated');
    setLogoutNotice(confirmed ? null : 'You were signed out here, but the server could not confirm logout.');
    return confirmed;
  }, []);

  const value = useMemo(() => ({ user, status, logoutNotice, signIn, signOut, refresh }), [user, status, logoutNotice, signIn, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
