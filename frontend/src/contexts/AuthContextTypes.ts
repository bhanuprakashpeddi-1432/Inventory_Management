import { createContext } from 'react';

export interface AuthContextType {
  user: import('../services/auth').User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
