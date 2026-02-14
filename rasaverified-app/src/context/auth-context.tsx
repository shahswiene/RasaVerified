'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface User {
  userId: Id<"users">;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('rasaverified_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation(api.auth.login);
  const registerMutation = useMutation(api.auth.register);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginMutation({ email, password });
      const userData: User = { userId: result.userId, name: result.name, email: result.email };
      setUser(userData);
      localStorage.setItem('rasaverified_user', JSON.stringify(userData));
      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] Login success:', userData.email);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginMutation]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerMutation({ name, email, password });
      const userData: User = { userId: result.userId, name: result.name, email: result.email };
      setUser(userData);
      localStorage.setItem('rasaverified_user', JSON.stringify(userData));
      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] Register success:', userData.email);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [registerMutation]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('rasaverified_user');
    if (process.env.NODE_ENV === 'development') {
      console.log('[auth] Logged out');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
