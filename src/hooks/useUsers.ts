import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { CreateUserPayload, UpdateUserPayload } from '../types/user';
import { useToast } from '../context/ToastContext';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...userKeys.lists(), { page, pageSize }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Fetch Users List with Pagination
export const useUsers = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: userKeys.list(page, pageSize),
    queryFn: () => userService.getUsers(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

// Fetch Single User
export const useUser = (userId: string | null) => {
  return useQuery({
    queryKey: userKeys.detail(userId!),
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create User Mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.lists());
      showSuccess('User created successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to create user';
      showError(errorMsg);
    },
  });
};

// Create Staff Mutation
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.lists());
      showSuccess('Staff user created successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to create staff';
      showError(errorMsg);
    },
  });
};

// Update User Mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPayload }) => 
      userService.updateUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(userKeys.lists());
      queryClient.invalidateQueries(userKeys.detail(variables.userId));
      showSuccess('User updated successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to update user';
      showError(errorMsg);
    },
  });
};

// Delete User Mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.lists());
      showSuccess('User deleted successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to delete user';
      showError(errorMsg);
    },
  });
};