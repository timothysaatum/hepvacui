import api from './api';
import type { Child, CreateChildPayload, UpdateChildPayload } from '../types/child';

export const childrenService = {
  // Get all children for a mother
  getMotherChildren: async (motherId: string): Promise<Child[]> => {
    const response = await api.get(`/api/v1/pregnant-patient-child/${motherId}/children`);
    return response.data;
  },

  // Create a new child
  createChild: async (motherId: string, data: CreateChildPayload): Promise<Child> => {
    const response = await api.post(`/api/v1/pregnant-patient-child/${motherId}/children`, data);
    return response.data;
  },

  // Update a child
  updateChild: async (childId: string, data: UpdateChildPayload): Promise<Child> => {
    const response = await api.patch(`/api/v1/pregnant-patient-child/children/${childId}`, data);
    return response.data;
  },
};