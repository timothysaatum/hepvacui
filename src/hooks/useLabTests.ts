import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    labTestService,
    type CreateLabTestPayload,
    type LabResultPayload,
    type LabTestType,
    type UpdateLabResultPayload,
    type UpdateLabTestPayload,
} from '../services/labTestService';

export function useLabTests(patientId: string, testType?: LabTestType) {
    return useQuery({
        queryKey: ['lab-tests', patientId, testType ?? 'all'],
        queryFn: () => labTestService.list(patientId, testType),
        enabled: !!patientId,
    });
}

export function useCreateLabTest(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLabTestPayload) => labTestService.create(patientId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-tests', patientId] }),
    });
}

export function useUpdateLabTest(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLabTestPayload }) =>
            labTestService.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-tests', patientId] }),
    });
}

export function useAddLabResult(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ testId, data }: { testId: string; data: LabResultPayload }) =>
            labTestService.addResult(testId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-tests', patientId] }),
    });
}

export function useUpdateLabResult(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ resultId, data }: { resultId: string; data: UpdateLabResultPayload }) =>
            labTestService.updateResult(resultId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-tests', patientId] }),
    });
}
