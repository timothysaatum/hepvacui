import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    labTestService,
    type CreateLabTestPayload,
    type LabTestDefinitionPayload,
    type LabTestParameterDefinitionPayload,
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

export function useLabTestDefinitions(includeInactive = false) {
    return useQuery({
        queryKey: ['lab-test-definitions', includeInactive],
        queryFn: () => labTestService.listDefinitions(includeInactive),
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

export function useDeleteLabTest(patientId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => labTestService.delete(id),
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

export function useCreateLabTestDefinition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: LabTestDefinitionPayload) => labTestService.createDefinition(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-test-definitions'] }),
    });
}

export function useUpdateLabTestDefinition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<LabTestDefinitionPayload> }) =>
            labTestService.updateDefinition(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-test-definitions'] }),
    });
}

export function useDeleteLabTestDefinition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => labTestService.deleteDefinition(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-test-definitions'] }),
    });
}

export function useCreateLabTestParameter() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ testDefinitionId, data }: { testDefinitionId: string; data: LabTestParameterDefinitionPayload }) =>
            labTestService.createParameter(testDefinitionId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-test-definitions'] }),
    });
}

export function useUpdateLabTestParameter() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<LabTestParameterDefinitionPayload> }) =>
            labTestService.updateParameter(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-test-definitions'] }),
    });
}
