import api from './api';
import type { Facility, CreateFacilityPayload, UpdateFacilityPayload, PaginatedFacilities } from '../types/facility';
import type { User, PaginatedUsers } from '../types/user';

export const facilityService = {
  createFacility: async (data: CreateFacilityPayload): Promise<Facility> => {
    const response = await api.post('/api/v1/facility', data);
    return response.data;
  },

  getFacilities: async (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    managerId?: string
  ): Promise<PaginatedFacilities> => {
    const params: any = { page, page_size: pageSize };
    if (search) params.search = search;
    if (managerId) params.manager_id = managerId;
    
    const response = await api.get('/api/v1/facility', { params });
    return response.data;
  },

  getFacility: async (facilityId: string): Promise<Facility> => {
    const response = await api.get(`/api/v1/facility/${facilityId}`);
    return response.data;
  },

  updateFacility: async (facilityId: string, data: UpdateFacilityPayload): Promise<Facility> => {
    const response = await api.patch(`/api/v1/facility/${facilityId}`, data);
    return response.data;
  },

  deleteFacility: async (facilityId: string): Promise<void> => {
    await api.delete(`/api/v1/facility/${facilityId}`);
  },

  assignManager: async (facilityId: string, managerId: string): Promise<Facility> => {
    const response = await api.post(`/api/v1/facility/${facilityId}/assign-manager/${managerId}`);
    return response.data;
  },

  assignStaff: async (facilityId: string, userId: string): Promise<User> => {
    const response = await api.post(`/api/v1/facility/${facilityId}/assign-staff/${userId}`);
    return response.data;
  },

  removeStaff: async (userId: string): Promise<void> => {
    await api.delete(`/api/v1/facility/staff/${userId}`);
  },

  getFacilityStaff: async (facilityId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedUsers> => {
    const response = await api.get(`/api/v1/facility/${facilityId}/staff`, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  }
};