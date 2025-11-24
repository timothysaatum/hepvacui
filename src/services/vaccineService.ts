import api from './api';
import type {
  Vaccine,
  VaccineStockInfo,
  CreateVaccinePayload,
  UpdateVaccinePayload,
  AddStockPayload,
  PublishVaccinePayload,
  PaginatedVaccines,
} from '../types/vaccine';

export const vaccineService = {
  // Create vaccine
  createVaccine: async (data: CreateVaccinePayload): Promise<Vaccine> => {
    const response = await api.post('/api/v1/vaccines', data);
    return response.data;
  },

  // Get paginated vaccines
  getVaccines: async (
    page: number = 1,
    pageSize: number = 10,
    publishedOnly: boolean = false,
    lowStockOnly: boolean = false
  ): Promise<PaginatedVaccines> => {
    const response = await api.get('/api/v1/vaccines', {
      params: {
        page,
        page_size: pageSize,
        published_only: publishedOnly,
        low_stock_only: lowStockOnly,
      },
    });
    return response.data;
  },

  // Search vaccines
  searchVaccines: async (
    searchTerm: string,
    publishedOnly: boolean = false
  ): Promise<Vaccine[]> => {
    const response = await api.get('/api/v1/vaccines/search', {
      params: {
        search: searchTerm,
        published_only: publishedOnly,
      },
    });
    return response.data;
  },

  // Get low stock vaccines
  getLowStockVaccines: async (): Promise<Vaccine[]> => {
    const response = await api.get('/api/v1/vaccines/low-stock');
    return response.data;
  },

  // Get single vaccine
  getVaccine: async (vaccineId: string): Promise<Vaccine> => {
    const response = await api.get(`/api/v1/vaccines/${vaccineId}`);
    return response.data;
  },

  // Update vaccine
  updateVaccine: async (
    vaccineId: string,
    data: UpdateVaccinePayload
  ): Promise<Vaccine> => {
    const response = await api.patch(`/api/v1/vaccines/${vaccineId}`, data);
    return response.data;
  },

  // Delete vaccine
  deleteVaccine: async (vaccineId: string): Promise<void> => {
    await api.delete(`/api/v1/vaccines/${vaccineId}`);
  },

  // Add stock
  addStock: async (
    vaccineId: string,
    data: AddStockPayload
  ): Promise<Vaccine> => {
    const response = await api.post(`/api/v1/vaccines/${vaccineId}/stock`, data);
    return response.data;
  },

  // Get stock info
  getStockInfo: async (vaccineId: string): Promise<VaccineStockInfo> => {
    const response = await api.get(`/api/v1/vaccines/${vaccineId}/stock`);
    return response.data;
  },

  // Publish/unpublish vaccine
  publishVaccine: async (
    vaccineId: string,
    data: PublishVaccinePayload
  ): Promise<Vaccine> => {
    const response = await api.patch(`/api/v1/vaccines/${vaccineId}/publish`, data);
    return response.data;
  },
};