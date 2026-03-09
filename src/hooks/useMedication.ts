import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '../services/medicationService';
import type { CreatePrescriptionPayload, UpdatePrescriptionPayload, CreateSchedulePayload, UpdateSchedulePayload } from '../types/medication';

export function usePrescriptions(patientId: string, activeOnly?: boolean) {
    return useQuery({
        queryKey: ['prescriptions', patientId, activeOnly],
        queryFn: () => medicationService.listPrescriptions(patientId, activeOnly),
        enabled: !!patientId,
    });
}

export function useSchedules(patientId: string) {
    return useQuery({
        queryKey: ['schedules', patientId],
        queryFn: () => medicationService.listSchedules(patientId),
        enabled: !!patientId,
    });
}

export function useCreatePrescription(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePrescriptionPayload) =>
            medicationService.createPrescription(patientId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions', patientId] }),
    });
}

export function useUpdatePrescription(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePrescriptionPayload }) =>
            medicationService.updatePrescription(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions', patientId] }),
    });
}

export function useCreateSchedule(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateSchedulePayload) =>
            medicationService.createSchedule(patientId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules', patientId] }),
    });
}

export function useUpdateSchedule(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSchedulePayload }) =>
            medicationService.updateSchedule(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules', patientId] }),
    });
}
