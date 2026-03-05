import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, Company } from '../types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          setCompany(response.data.company);
        } catch (error: any) {
          // If 401 or 403 or 404, it means token is invalid or user deleted
          if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 404)) {
            localStorage.removeItem('token');
          } else {
            console.error('Auth check failed', error);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    // Ideally fetch full user data again to get company info, or pass it from login response
    // For now, let's trigger a reload or re-fetch
    api.get('/auth/me').then(res => {
      setUser(res.data.user);
      setCompany(res.data.company);
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
