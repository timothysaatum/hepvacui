import axios from 'axios';
import type { AxiosInstance } from 'axios';

// ── In-memory token store (never localStorage) ────────────────────────────────
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ── Axios instance ────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || '';
const REFRESH_URL = `${BASE_URL}/api/v1/users/refresh`;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory on every request
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Silent refresh on 401 — but NEVER retry the refresh endpoint itself
let _refreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Skip retry logic if:
    //  - the request that failed IS the refresh endpoint (avoids infinite loop)
    //  - or we've already retried this request once
    const isRefreshEndpoint = original?.url?.includes('/users/refresh');
    if (error.response?.status !== 401 || original._retry || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (_refreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push((token) => {
          if (token) {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          } else {
            reject(error);
          }
        });
      });
    }

    _refreshing = true;

    try {
      const { data } = await axios.post(REFRESH_URL, {}, { withCredentials: true });
      const newToken: string = data.access_token;
      setAccessToken(newToken);

      _refreshQueue.forEach((cb) => cb(newToken));
      _refreshQueue = [];

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      setAccessToken(null);
      _refreshQueue.forEach((cb) => cb(null));
      _refreshQueue = [];
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return Promise.reject(error);
    } finally {
      _refreshing = false;
    }
  }
);

export default api;