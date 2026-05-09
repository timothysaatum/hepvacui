import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilityService } from '../services/facilityService';
import type { CreateFacilityPayload, UpdateFacilityPayload } from '../types/facility';
import { useToast } from '../context/ToastContext';
import { keepPreviousData } from '@tanstack/react-query';

const getErrorDetail = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    if (typeof response?.data?.detail === 'string') return response.data.detail;
  }
  return fallback;
};

// Query Keys
export const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, search?: string) => 
    [...facilityKeys.lists(), { page, pageSize, search }] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...facilityKeys.details(), id] as const,
  staff: (id: string, page: number) => [...facilityKeys.all, 'staff', id, { page }] as const,
};

// Fetch Facilities List with Pagination and Search
export const useFacilities = (page: number = 1, pageSize: number = 10, search?: string, enabled = true) => {
  return useQuery({
    queryKey: facilityKeys.list(page, pageSize, search),
    queryFn: () => facilityService.getFacilities(page, pageSize, search),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
};

// Fetch Single Facility
export const useFacility = (facilityId: string | null) => {
  return useQuery({
    queryKey: facilityKeys.detail(facilityId!),
    queryFn: () => facilityService.getFacility(facilityId!),
    enabled: !!facilityId,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch Facility Staff
export const useFacilityStaff = (facilityId: string, page: number = 1) => {
  return useQuery({
    queryKey: facilityKeys.staff(facilityId, page),
    queryFn: () => facilityService.getFacilityStaff(facilityId, page, 10),
    enabled: !!facilityId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: keepPreviousData,
  });
};

// Create Facility Mutation
export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateFacilityPayload) => facilityService.createFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['facilities', 'list']
      });
      showSuccess('Facility created successfully');
    },
    onError: (error: unknown) => {
      const errorMsg = getErrorDetail(error, 'Failed to create facility');
      showError(errorMsg);
    },
  });
};

// Update Facility Mutation
export const useUpdateFacility = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ facilityId, data }: { facilityId: string; data: UpdateFacilityPayload }) => 
      facilityService.updateFacility(facilityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['facilities', 'list']
      });
      // queryClient.invalidateQueries(facilityKeys.detail(variables.facilityId));
      queryClient.invalidateQueries({ queryKey: facilityKeys.detail(variables.facilityId) });
      showSuccess('Facility updated successfully');
    },
    onError: (error: unknown) => {
      const errorMsg = getErrorDetail(error, 'Failed to update facility');
      showError(errorMsg);
    },
  });
};

// Delete Facility Mutation
export const useDeleteFacility = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (facilityId: string) => facilityService.deleteFacility(facilityId),
    onSuccess: () => {
      // queryClient.invalidateQueries(facilityKeys.lists());
      queryClient.invalidateQueries({
        queryKey: ['facilities', 'list']
      });
      showSuccess('Facility deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMsg = getErrorDetail(error, 'Failed to delete facility');
      showError(errorMsg);
    },
  });
};

export const useAssignFacilityManager = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ facilityId, managerId }: { facilityId: string; managerId: string }) =>
      facilityService.assignManager(facilityId, managerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: facilityKeys.detail(variables.facilityId) });
      showSuccess('Facility manager assigned successfully');
    },
    onError: (error: unknown) => {
      const errorMsg = getErrorDetail(error, 'Failed to assign facility manager');
      showError(errorMsg);
    },
  });
};

export const useAssignFacilityStaff = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ facilityId, userId }: { facilityId: string; userId: string }) =>
      facilityService.assignStaff(facilityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.staff(variables.facilityId, 1) });
      showSuccess('Staff assigned successfully');
    },
    onError: (error: unknown) => {
      const errorMsg = getErrorDetail(error, 'Failed to assign staff');
      showError(errorMsg);
    },
  });
};

// Remove Staff Mutation
export const useRemoveStaff = (facilityId: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => facilityService.removeStaff(userId),
    onSuccess: () => {
      // queryClient.invalidateQueries(facilityKeys.staff(facilityId, 1));
      queryClient.invalidateQueries({ queryKey: facilityKeys.staff(facilityId, 1) });
      showSuccess('Staff member removed successfully');
    },
    onError: (error: unknown) => {
      const errorMsg = getErrorDetail(error, 'Failed to remove staff member');
      showError(errorMsg);
    },
  });
};
