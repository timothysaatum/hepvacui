import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type UpdateSettingsPayload, type SystemStatusUpdate } from '../services/settingsService';

/**
 * Hook to fetch public settings (no auth required)
 */
export const usePublicSettings = () => {
    return useQuery({
        queryKey: ['settings', 'public'],
        queryFn: settingsService.getPublicSettings,
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 60 * 1000, // Refetch every minute
    });
};

/**
 * Hook to fetch settings (auth required)
 */
export const useSettings = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        staleTime: 30 * 1000, // 30 seconds
    });
};

/**
 * Hook to update settings (admin only)
 */
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateSettingsPayload) => settingsService.updateSettings(data),
        onSuccess: () => {
            // Invalidate both regular and public settings
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
        },
    });
};

/**
 * Hook to update system status (admin only)
 */
export const useUpdateSystemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SystemStatusUpdate) => settingsService.updateSystemStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
        },
    });
};

/**
 * Hook to invalidate settings cache (admin only)
 */
export const useInvalidateSettingsCache = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: settingsService.invalidateCache,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};

/**
 * Hook to check settings health
 */
export const useSettingsHealth = () => {
    return useQuery({
        queryKey: ['settings', 'health'],
        queryFn: settingsService.healthCheck,
        staleTime: 30 * 1000,
        retry: 1,
    });
};