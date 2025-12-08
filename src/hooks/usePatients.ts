import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import type {
  CreatePregnantPatientPayload,
  CreateRegularPatientPayload,
  UpdatePregnantPatientPayload,
  UpdateRegularPatientPayload,
  ConvertToRegularPayload,
  PatientFilters,
} from '../types/patient';
import { useToast } from '../context/ToastContext';

// Query Keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: PatientFilters) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string, type: 'pregnant' | 'regular') => 
    [...patientKeys.details(), id, type] as const,
  // OPTIMIZATION: New unified query key
  detailUnified: (id: string) => [...patientKeys.details(), id] as const,
};

// Fetch Patients List with Pagination and Filters
export const usePatients = (filters: PatientFilters = {}) => {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => patientService.getPatients(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: keepPreviousData,
  });
};

export const usePatient = (patientId: string | null) => {
  return useQuery({
    queryKey: patientKeys.detailUnified(patientId!),
    queryFn: async () => {
      if (!patientId) return null;
      
      // Try pregnant endpoint first
      try {
        return await patientService.getPregnantPatient(patientId);
      } catch (error: any) {
        // If 404 or 400, try regular endpoint
        if (error.response?.status === 404 || error.response?.status === 400) {
          return await patientService.getRegularPatient(patientId);
        }
        throw error;
      }
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: false, // Let our fallback logic handle retries
  });
};

// Fetch Single Pregnant Patient (keep for backward compatibility)
export const usePregnantPatient = (patientId: string | null) => {
  return useQuery({
    queryKey: patientKeys.detail(patientId!, 'pregnant'),
    queryFn: () => patientService.getPregnantPatient(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch Single Regular Patient (keep for backward compatibility)
export const useRegularPatient = (patientId: string | null) => {
  return useQuery({
    queryKey: patientKeys.detail(patientId!, 'regular'),
    queryFn: () => patientService.getRegularPatient(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create Pregnant Patient Mutation
export const useCreatePregnantPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreatePregnantPatientPayload) => 
      patientService.createPregnantPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Pregnant patient created successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to create pregnant patient';
      showError(errorMsg);
    },
  });
};

// Create Regular Patient Mutation
export const useCreateRegularPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateRegularPatientPayload) => 
      patientService.createRegularPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Regular patient created successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to create regular patient';
      showError(errorMsg);
    },
  });
};

// Update Pregnant Patient Mutation
export const useUpdatePregnantPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ patientId, data }: { 
      patientId: string; 
      data: UpdatePregnantPatientPayload 
    }) => patientService.updatePregnantPatient(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.patientId, 'pregnant') });
      queryClient.invalidateQueries({ queryKey: patientKeys.detailUnified(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Pregnant patient updated successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to update pregnant patient';
      showError(errorMsg);
    },
  });
};

// Update Regular Patient Mutation
export const useUpdateRegularPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ patientId, data }: { 
      patientId: string; 
      data: UpdateRegularPatientPayload 
    }) => patientService.updateRegularPatient(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.patientId, 'regular') });
      // OPTIMIZATION: Also invalidate unified query
      queryClient.invalidateQueries({ queryKey: patientKeys.detailUnified(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Regular patient updated successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to update regular patient';
      showError(errorMsg);
    },
  });
};

// Convert Pregnant to Regular Patient Mutation
export const useConvertToRegular = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ patientId, data }: { 
      patientId: string; 
      data: ConvertToRegularPayload 
    }) => patientService.convertToRegular(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.patientId, 'pregnant') });
      queryClient.invalidateQueries({ queryKey: patientKeys.detailUnified(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Patient converted to regular successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to convert patient';
      showError(errorMsg);
    },
  });
};

// Delete Patient Mutation
export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (patientId: string) => patientService.deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Patient deleted successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to delete patient';
      showError(errorMsg);
    },
  });
};