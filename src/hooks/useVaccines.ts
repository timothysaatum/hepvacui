import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { vaccineService } from '../services/vaccineService';
import type {
  CreateVaccinePayload,
  UpdateVaccinePayload,
  AddStockPayload,
  PublishVaccinePayload,
} from '../types/vaccine';
import { useToast } from '../context/ToastContext';

// Query Keys
export const vaccineKeys = {
  all: ['vaccines'] as const,
  lists: () => [...vaccineKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, publishedOnly: boolean, lowStockOnly: boolean) =>
    [...vaccineKeys.lists(), { page, pageSize, publishedOnly, lowStockOnly }] as const,
  lowStock: () => [...vaccineKeys.all, 'low-stock'] as const,
  search: (searchTerm: string, publishedOnly: boolean) =>
    [...vaccineKeys.all, 'search', { searchTerm, publishedOnly }] as const,
  details: () => [...vaccineKeys.all, 'detail'] as const,
  detail: (id: string) => [...vaccineKeys.details(), id] as const,
  stock: (id: string) => [...vaccineKeys.all, 'stock', id] as const,
};

// Fetch Vaccines List with Pagination and Filters
export const useVaccines = (
  page: number = 1,
  pageSize: number = 10,
  publishedOnly: boolean = false,
  lowStockOnly: boolean = false
) => {
  return useQuery({
    queryKey: vaccineKeys.list(page, pageSize, publishedOnly, lowStockOnly),
    queryFn: () => vaccineService.getVaccines(page, pageSize, publishedOnly, lowStockOnly),
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: keepPreviousData,
  });
};

// Fetch Low Stock Vaccines
export const useLowStockVaccines = () => {
  return useQuery({
    queryKey: vaccineKeys.lowStock(),
    queryFn: () => vaccineService.getLowStockVaccines(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Search Vaccines
export const useSearchVaccines = (searchTerm: string, publishedOnly: boolean = false) => {
  return useQuery({
    queryKey: vaccineKeys.search(searchTerm, publishedOnly),
    queryFn: () => vaccineService.searchVaccines(searchTerm, publishedOnly),
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
};

// Fetch Single Vaccine
export const useVaccine = (vaccineId: string | null) => {
  return useQuery({
    queryKey: vaccineKeys.detail(vaccineId!),
    queryFn: () => vaccineService.getVaccine(vaccineId!),
    enabled: !!vaccineId,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch Vaccine Stock Info
export const useVaccineStock = (vaccineId: string | null) => {
  return useQuery({
    queryKey: vaccineKeys.stock(vaccineId!),
    queryFn: () => vaccineService.getStockInfo(vaccineId!),
    enabled: !!vaccineId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create Vaccine Mutation
export const useCreateVaccine = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateVaccinePayload) => vaccineService.createVaccine(data),
    onSuccess: () => {
      // queryClient.invalidateQueries(vaccineKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lists() });
      // queryClient.invalidateQueries(vaccineKeys.lowStock());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lowStock() });
      showSuccess('Vaccine created successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to create vaccine';
      showError(errorMsg);
    },
  });
};

// Update Vaccine Mutation
export const useUpdateVaccine = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ vaccineId, data }: { vaccineId: string; data: UpdateVaccinePayload }) =>
      vaccineService.updateVaccine(vaccineId, data),
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries(vaccineKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lists() });
      // queryClient.invalidateQueries(vaccineKeys.detail(variables.vaccineId));
      queryClient.invalidateQueries({ queryKey: vaccineKeys.detail(variables.vaccineId) });
      // queryClient.invalidateQueries(vaccineKeys.stock(variables.vaccineId));
      queryClient.invalidateQueries({ queryKey: vaccineKeys.stock(variables.vaccineId) });
      // queryClient.invalidateQueries(vaccineKeys.lowStock());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lowStock() });
      showSuccess('Vaccine updated successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to update vaccine';
      showError(errorMsg);
    },
  });
};

// Delete Vaccine Mutation
export const useDeleteVaccine = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (vaccineId: string) => vaccineService.deleteVaccine(vaccineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lists() });
      // queryClient.invalidateQueries(vaccineKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lowStock() });
      // queryClient.invalidateQueries(vaccineKeys.lowStock());
      showSuccess('Vaccine deleted successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to delete vaccine';
      showError(errorMsg);
    },
  });
};

// Add Stock Mutation
export const useAddStock = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ vaccineId, data }: { vaccineId: string; data: AddStockPayload }) =>
      vaccineService.addStock(vaccineId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lists() });
      // queryClient.invalidateQueries(vaccineKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.detail(variables.vaccineId) });
      // queryClient.invalidateQueries(vaccineKeys.detail(variables.vaccineId));
      // queryClient.invalidateQueries(vaccineKeys.stock(variables.vaccineId));
      queryClient.invalidateQueries({ queryKey: vaccineKeys.stock(variables.vaccineId) });
      // queryClient.invalidateQueries(vaccineKeys.lowStock());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lowStock() });
      showSuccess('Stock added successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to add stock';
      showError(errorMsg);
    },
  });
};

// Publish/Unpublish Vaccine Mutation
export const usePublishVaccine = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ vaccineId, data }: { vaccineId: string; data: PublishVaccinePayload }) =>
      vaccineService.publishVaccine(vaccineId, data),
    onSuccess: (data, variables) => {
      // queryClient.invalidateQueries(vaccineKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccineKeys.lists() });
      // queryClient.invalidateQueries(vaccineKeys.detail(variables.vaccineId));
      queryClient.invalidateQueries({ queryKey: vaccineKeys.detail(variables.vaccineId) });
      const action = data.is_published ? 'published' : 'unpublished';
      showSuccess(`Vaccine ${action} successfully`);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to update vaccine status';
      showError(errorMsg);
    },
  });
};