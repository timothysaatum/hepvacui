import React, { useState } from 'react';
import type { UserWithToken, LoginPayload } from '../types/user';
import { authService } from '../services/authService';
import { AuthContext } from './authContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithToken | null>(() => authService.getCurrentUser());

  const login = async (credentials: LoginPayload) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};