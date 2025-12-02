import { createContext } from 'react';
import type { UserWithToken, LoginPayload } from '../types/user';

export interface AuthContextType {
  user: UserWithToken | null;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);