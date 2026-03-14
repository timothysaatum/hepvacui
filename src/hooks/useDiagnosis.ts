import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diagnosisService, type CreateDiagnosisPayload, type UpdateDiagnosisPayload } from '../services/diagnosisService';

export function useDiagnoses(patientId: string) {
    return useQuery({
        queryKey: ['diagnoses', patientId],
        queryFn: () => diagnosisService.list(patientId),
        enabled: !!patientId,
    });
}

export function useCreateDiagnosis(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDiagnosisPayload) =>
            diagnosisService.create(patientId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['diagnoses', patientId] }),
    });
}

export function useUpdateDiagnosis(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDiagnosisPayload }) =>
            diagnosisService.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['diagnoses', patientId] }),
    });
}

export function useDeleteDiagnosis(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => diagnosisService.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['diagnoses', patientId] }),
    });
}