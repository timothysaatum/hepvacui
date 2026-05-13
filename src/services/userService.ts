import api from './api';
import type { Permission, User, CreateUserPayload, UpdateUserPayload, PaginatedUsers } from '../types/user';

export const userService = {
  createUser: async (data: CreateUserPayload): Promise<User> => {
    const response = await api.post('/api/v1/users', data);
    return response.data;
  },

  createStaff: async (data: CreateUserPayload): Promise<User> => {
    const response = await api.post('/api/v1/users/create-staff', data);
    return response.data;
  },

  getUsers: async (page: number = 1, pageSize: number = 10): Promise<PaginatedUsers> => {
    const response = await api.get('/api/v1/users', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/api/v1/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserPayload): Promise<User> => {
    const response = await api.patch(`/api/v1/users/${userId}`, data);
    return response.data;
  },

  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get('/api/v1/users/permissions/catalog');
    return response.data;
  },

  createPermission: async (data: { name: string; description?: string }): Promise<Permission> => {
    const response = await api.post('/api/v1/users/permissions/catalog', data);
    return response.data;
  },

  updateUserPermissions: async (userId: string, permissionIds: number[]): Promise<User> => {
    const response = await api.put(`/api/v1/users/${userId}/permissions`, {
      permission_ids: permissionIds,
    });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/api/v1/users/${userId}`);
  }
};
