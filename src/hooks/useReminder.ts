import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '../services/reminderService';
import type { CreateReminderPayload, UpdateReminderPayload } from '../types/reminder';

export function useReminders(patientId: string, pendingOnly?: boolean) {
    return useQuery({
        queryKey: ['reminders', patientId, pendingOnly],
        queryFn: () => reminderService.listReminders(patientId, pendingOnly),
        enabled: !!patientId,
    });
}

export function useCreateReminder(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReminderPayload) =>
            reminderService.createReminder(patientId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders', patientId] }),
    });
}

export function useUpdateReminder(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReminderPayload }) =>
            reminderService.updateReminder(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders', patientId] }),
    });
}
