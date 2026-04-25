import type { CreateReminderPayload, PatientReminder, UpdateReminderPayload } from '../types/reminder';
import api from './api';

export interface PaginatedRemindersResponse {
    items: PatientReminder[];
    page_info: {
        total_items: number;
        total_pages: number;
        current_page: number;
        page_size: number;
        has_next: boolean;
        has_previous: boolean;
        next_page: number | null;
        previous_page: number | null;
    };
}

export const reminderService = {
    createReminder: async (
        patientId: string,
        data: CreateReminderPayload
    ): Promise<PatientReminder> => {
        const response = await api.post(`/api/v1/patient-reminders/${patientId}`, data);
        return response.data;
    },

    listReminders: async (
        patientId: string,
        pendingOnly = false
    ): Promise<PatientReminder[]> => {
        const response = await api.get(`/api/v1/patient-reminders/${patientId}`, {
            params: { pending_only: pendingOnly },
        });
        return response.data;
    },

    listRemindersPaginated: async (
        patientId: string,
        page: number = 1,
        pageSize: number = 10,
        statusFilter?: string,
        upcomingOnly: boolean = false
    ): Promise<PaginatedRemindersResponse> => {
        const response = await api.get(
            `/api/v1/patient-reminders/${patientId}/paginated`,
            {
                params: {
                    page,
                    page_size: pageSize,
                    status_filter: statusFilter,
                    upcoming_only: upcomingOnly,
                },
            }
        );
        return response.data;
    },

    updateReminder: async (
        reminderId: string,
        data: UpdateReminderPayload
    ): Promise<PatientReminder> => {
        const response = await api.patch(
            `/api/v1/patient-reminders/${reminderId}`,
            data
        );
        return response.data;
    },
};
