import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { login, logout } from '../services/LoginService';

interface AuthContextType {
  user: any;
  loading: boolean;
  loginFun: (username: string, password?: string) => Promise<any>;
  logoutFun: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginFun: async () => {},
  logoutFun: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = localStorage.getItem('token');
          setUser(token ? { token } : null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const loginFun = async (username: string, password?: string) => {
    const data = await login({ username, password });
    if (data?.result?.access_token) {
      localStorage.setItem('token', data.result.access_token);
      if (data.result.refresh_token) {
        localStorage.setItem('refreshToken', data.result.refresh_token);
      }
      setUser(data.result);
    }
    return data;
  };

  const logoutFun = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || '';
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('adminInfo');
      }
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginFun, logoutFun }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
