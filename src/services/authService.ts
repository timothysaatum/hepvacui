import api from './api';
import type { LoginPayload, UserWithToken } from '../types/user';

export const authService = {
  login: async (credentials: LoginPayload): Promise<UserWithToken> => {
    const response = await api.post('/api/v1/users/login', credentials);
    const data = response.data;
    
    // Store token in localStorage
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/v1/users/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async (): Promise<UserWithToken> => {
    const response = await api.post('/api/v1/users/refresh');
    const data = response.data;
    
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  getCurrentUser: (): UserWithToken | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};