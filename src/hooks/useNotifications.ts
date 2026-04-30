import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { UpdateFacilityNotificationPayload } from '../types/notification';

export const notificationKeys = {
    all: ['facility-notifications'] as const,
    list: (params?: unknown) => [...notificationKeys.all, 'list', params] as const,
};

export function useFacilityNotifications(params?: {
    status_filter?: string;
    unresolved_only?: boolean;
    limit?: number;
}) {
    return useQuery({
        queryKey: notificationKeys.list(params),
        queryFn: () => notificationService.list(params),
        refetchInterval: 60_000,
    });
}

export function useUpdateFacilityNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFacilityNotificationPayload }) =>
            notificationService.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    });
}
