import api, { setAccessToken, getAccessToken } from './api';
import type { LoginPayload, UserWithToken, User } from '../types/user';

// Module-level user store (in memory only)
let _currentUser: User | null = null;

export const authService = {
  login: async (
    credentials: LoginPayload,
    extraHeaders?: Record<string, string>,
  ): Promise<UserWithToken> => {
    const response = await api.post('/api/v1/users/login', credentials, {
      headers: extraHeaders,
    });
    const data: UserWithToken = response.data;

    if (data.access_token) {
      setAccessToken(data.access_token);
      _currentUser = data;
    }

    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/v1/users/logout');
    } finally {
      setAccessToken(null);
      _currentUser = null;
    }
  },

  /**
   * Called on app mount to restore the session using the HTTP-only
   * refresh-token cookie. Returns the user if the session is valid.
   */
  restoreSession: async (): Promise<UserWithToken | null> => {
    try {
      const response = await api.post('/api/v1/users/refresh');
      const data: UserWithToken = response.data;

      if (data.access_token) {
        setAccessToken(data.access_token);
        _currentUser = data;
        return data;
      }
      return null;
    } catch {
      return null;
    }
  },

  getCurrentUser: (): User | null => _currentUser,

  isAuthenticated: (): boolean => !!getAccessToken(),
};