import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import axiosInstance from '../service/api';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

interface ApiAuthResponse {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  avatar: string | null;
  phone: string;
  access_token: string;
  refresh_token: string;
  role: {
    name: string;
    Permission: Array<{
      roleId: number;
      appModuleId: number;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      module: {
        name: string;
        path: string;
      }
    }>
  };
  inspector?: Array<{
    userId: number;
    working_start_hour: string;
    working_end_hour: string;
    branch_id: number | null;
    status: string;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('baddelha_user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('baddelha_user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Integrated login function with API
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: any = await axiosInstance.post<ApiAuthResponse>('auth/sign-in', {
        email,
        password
      });

  
      if(response.status === 200 || response.status === 201){
        const { data } = response;
      
        // Store tokens
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Map API response to AuthUser format
        const userData: AuthUser = {
          id: data.id.toString(),
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          role: data.role.name.toLowerCase() === 'inspector' ? 'inspector' : data.role.name.includes('Support Agent') ? 'call-center' : 'admin'
        };
        
        localStorage.setItem('baddelha_user', JSON.stringify(userData));
        setUser(userData);
      
        // Return the role for redirection in the Login component
        return userData.role;
      } else {
        // Extract error message from response
        const errorMessage = typeof response.data.message === 'string' 
          ? response.data.message 
          : 'Failed to login. Please check your credentials.';
        
        setError(errorMessage);
        return null;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Extract error message from error response
      let errorMessage = 'Failed to login. Please check your credentials.';
      
      if (err.response?.data) {
        if (typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        } else if (err.response.data.message && typeof err.response.data.message === 'object') {
          // If message is an object, try to extract a useful string
          errorMessage = JSON.stringify(err.response.data.message);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('baddelha_user');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    // Navigation will be handled by the protected routes
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}