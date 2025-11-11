import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse } from '@types/auth';

type AuthContextType = {
  token: string | null;
  user: AuthResponse['user'] | null;
  login: (payload: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cinema_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: AuthResponse = JSON.parse(raw);
        setToken(parsed.token);
        setUser(parsed.user);
      } catch (error) {
        console.warn('Session invalide, réinitialisation.', error);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (payload: AuthResponse) => {
    setToken(payload.token);
    setUser(payload.user);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: Boolean(token)
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

