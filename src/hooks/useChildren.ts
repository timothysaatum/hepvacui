import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenService } from '../services/childService';
import type { CreateChildPayload, UpdateChildPayload } from '../types/child';
import { useToast } from '../context/ToastContext';

// Query keys
export const childrenKeys = {
  all: ['children'] as const,
  motherChildren: (motherId: string) => [...childrenKeys.all, 'mother', motherId] as const,
};

// Fetch mother's children
export const useMotherChildren = (motherId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: childrenKeys.motherChildren(motherId!),
    queryFn: () => childrenService.getMotherChildren(motherId!),
    enabled: !!motherId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Create child mutation
export const useCreateChild = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ motherId, data }: { motherId: string; data: CreateChildPayload }) =>
      childrenService.createChild(motherId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: childrenKeys.motherChildren(variables.motherId) });
      showSuccess('Child added successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to add child';
      showError(errorMsg);
    },
  });
};

// Update child mutation
export const useUpdateChild = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ childId, data }: { 
      childId: string; 
      motherId: string;
      data: UpdateChildPayload 
    }) => childrenService.updateChild(childId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: childrenKeys.motherChildren(variables.motherId) });
      showSuccess('Child information updated successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to update child information';
      showError(errorMsg);
    },
  });
};