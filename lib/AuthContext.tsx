import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { apiRequest, getQueryFn, queryClient } from './query-client';
import { useQuery, useMutation } from '@tanstack/react-query';

interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  currency: string;
  monthlyBudget: number;
  dailyBudgetTarget: number;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<AuthUser, 'displayName' | 'currency' | 'monthlyBudget' | 'dailyBudgetTarget'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useQuery<AuthUser | null>({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    staleTime: Infinity,
  });

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiRequest('POST', '/api/auth/login', { username, password });
    const data = await res.json();
    queryClient.setQueryData(['/api/auth/me'], data);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await apiRequest('POST', '/api/auth/register', { username, password });
    const data = await res.json();
    queryClient.setQueryData(['/api/auth/me'], data);
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('POST', '/api/auth/logout');
    queryClient.setQueryData(['/api/auth/me'], null);
    queryClient.clear();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<AuthUser, 'displayName' | 'currency' | 'monthlyBudget' | 'dailyBudgetTarget'>>) => {
    const res = await apiRequest('PUT', '/api/auth/profile', updates);
    const data = await res.json();
    queryClient.setQueryData(['/api/auth/me'], data);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiRequest('PUT', '/api/auth/password', { currentPassword, newPassword });
  }, []);

  const value = useMemo(() => ({
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  }), [user, isLoading, login, register, logout, updateProfile, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
