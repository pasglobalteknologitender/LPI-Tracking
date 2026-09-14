'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SystemLoader from '@/components/loader';
import { canRole, type Permission, type UserRole, isUserRole } from './permissions';
import { loginRequest, logoutRequest, meRequest } from './api';
import { ApiClientError } from './api-client';

type User = {
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function toAuthUser(user: { name: string; email: string; role: UserRole }): User {
  return {
    name: user.name,
    email: user.email,
    role: isUserRole(user.role) ? user.role : 'viewer',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const currentUser = await meRequest();
        if (!mounted) return;
        setUser(toAuthUser(currentUser));
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === '/login';

    if (!user && !isLoginPage) {
      router.push('/login');
    } else if (user && isLoginPage) {
      router.push('/shipments');
    }
  }, [user, pathname, isLoading, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await loginRequest(email, password);
      setUser(toAuthUser(authenticatedUser));
      return true;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        return false;
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  if (isLoading) {
    return <SystemLoader />;
  }

  const can = (permission: Permission) => canRole(user?.role, permission);
  const hasRole = (role: UserRole) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, can, hasRole, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
