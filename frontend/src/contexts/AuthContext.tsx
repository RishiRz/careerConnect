import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { api } from '../lib/api';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.data?.userId) {
        const userRes = await api.get('/users/me');
        if (userRes.data.success) {
          setUser(userRes.data.data);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      await refreshUser();
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
