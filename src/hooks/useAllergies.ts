import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { allergyService, type CreateAllergyPayload, type UpdateAllergyPayload } from '../services/allergyService';
import { patientKeys } from './usePatients';
import type { PatientType } from '../types/patient';

export const allergyKeys = {
    all: ['allergies'] as const,
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
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: allergyKeys.list(patientId) });
            qc.invalidateQueries({ queryKey: allergyKeys.list(patientId, true) });
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
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: allergyKeys.list(patientId) });
            qc.invalidateQueries({ queryKey: allergyKeys.list(patientId, true) });
            if (patientType) qc.invalidateQueries({ queryKey: patientKeys.detail(patientId, patientType) });
            qc.invalidateQueries({ queryKey: patientKeys.detailUnified(patientId) });
        },
    });
}
