import React, { useEffect, useState } from 'react';
import authService from '../services/auth';
import type { User } from '../services/auth';
import websocketService from '../services/websocket';
import { AuthContext } from './AuthContextTypes';
import type { AuthContextType } from './AuthContextTypes';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.verifyToken();
        if (currentUser) {
          setUser(currentUser);
          websocketService.connect();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser } = await authService.login({ email, password });
    setUser(loggedInUser);
    websocketService.connect();
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      websocketService.disconnect();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAuthenticated = !!user;

  const hasRole = (role: string | string[]): boolean => {
    return authService.hasRole(role);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
