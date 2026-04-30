import api from './api';
import type { FacilityNotification, UpdateFacilityNotificationPayload } from '../types/notification';

export const notificationService = {
    list: async (params?: {
        status_filter?: string;
        unresolved_only?: boolean;
        limit?: number;
    }): Promise<FacilityNotification[]> => {
        const response = await api.get('/api/v1/facility-notifications', { params });
        return response.data;
    },

    update: async (
        id: string,
        data: UpdateFacilityNotificationPayload
    ): Promise<FacilityNotification> => {
        const response = await api.patch(`/api/v1/facility-notifications/${id}`, data);
        return response.data;
    },
};
