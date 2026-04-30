import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { allergyService, type CreateAllergyPayload, type UpdateAllergyPayload } from '../services/allergyService';
import { patientKeys } from './usePatients';
import type { PatientType } from '../types/patient';

export const allergyKeys = {
    all: ['allergies'] as const,
    patient: (patientId: string) => ['allergies', patientId] as const,
    list: (patientId: string, activeOnly?: boolean) => ['allergies', patientId, activeOnly] as const,
};

export function useAllergies(patientId: string, activeOnly = false) {
    return useQuery({
        queryKey: allergyKeys.list(patientId, activeOnly),
        queryFn: () => allergyService.list(patientId, activeOnly),
        enabled: !!patientId,
    });
}

export function useCreateAllergy(patientId: string, patientType?: PatientType) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAllergyPayload) => allergyService.create(patientId, data),
        onSuccess: (created) => {
            qc.setQueryData(
                allergyKeys.list(patientId, false),
                (current: Awaited<ReturnType<typeof allergyService.list>> | undefined) => {
                    if (!current) return [created];
                    if (current.some(allergy => allergy.id === created.id)) return current;
                    return [...current, created];
                },
            );
            if (created.is_active !== false) {
                qc.setQueryData(
                    allergyKeys.list(patientId, true),
                    (current: Awaited<ReturnType<typeof allergyService.list>> | undefined) => {
                        if (!current) return [created];
                        if (current.some(allergy => allergy.id === created.id)) return current;
                        return [...current, created];
                    },
                );
            }
            qc.invalidateQueries({ queryKey: allergyKeys.patient(patientId) });
            if (patientType) qc.invalidateQueries({ queryKey: patientKeys.detail(patientId, patientType) });
            qc.invalidateQueries({ queryKey: patientKeys.detailUnified(patientId) });
        },
    });
}

export function useUpdateAllergy(patientId: string, patientType?: PatientType) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAllergyPayload }) =>
            allergyService.update(id, data),
        onSuccess: (updated) => {
            const replace = (current: Awaited<ReturnType<typeof allergyService.list>> | undefined) =>
                current?.map(allergy => allergy.id === updated.id ? updated : allergy);
            qc.setQueryData(allergyKeys.list(patientId, false), replace);
            qc.setQueryData(
                allergyKeys.list(patientId, true),
                (current: Awaited<ReturnType<typeof allergyService.list>> | undefined) => {
                    const next = replace(current);
                    return next?.filter(allergy => allergy.is_active !== false);
                },
            );
            qc.invalidateQueries({ queryKey: allergyKeys.patient(patientId) });
            if (patientType) qc.invalidateQueries({ queryKey: patientKeys.detail(patientId, patientType) });
            qc.invalidateQueries({ queryKey: patientKeys.detailUnified(patientId) });
        },
    });
}
