import type { CreateReminderPayload, PatientReminder, UpdateReminderPayload } from '../types/reminder';
import api from './api';

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
