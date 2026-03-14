import { createContext } from 'react';
import type { User, LoginPayload } from '../types/user';

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginPayload, extraHeaders?: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);