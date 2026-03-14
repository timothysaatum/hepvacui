import api from './api';

export interface Diagnosis {
    id: string;
    patient_id: string;
    diagnosed_by: { id: string; name: string } | null;
    history: string | null;
    preliminary_diagnosis: string | null;
    actual_diagnosis: string | null;
    diagnosed_on: string;
    is_deleted: boolean;
    deleted_at: string | null;
    updated_at: string;
}

export interface CreateDiagnosisPayload {
    history?: string;
    preliminary_diagnosis?: string;
    actual_diagnosis?: string;
}

export interface UpdateDiagnosisPayload {
    history?: string;
    preliminary_diagnosis?: string;
    actual_diagnosis?: string;
}

const BASE = '/api/v1/patient-diagnosis';

export const diagnosisService = {
    list: (patientId: string): Promise<Diagnosis[]> =>
        api.get(`${BASE}/${patientId}`).then(r => r.data),

    create: (patientId: string, data: CreateDiagnosisPayload): Promise<Diagnosis> =>
        api.post(`${BASE}/${patientId}`, data).then(r => r.data),

    update: (diagnosisId: string, data: UpdateDiagnosisPayload): Promise<Diagnosis> =>
        api.patch(`${BASE}/record/${diagnosisId}`, data).then(r => r.data),

    delete: (diagnosisId: string): Promise<void> =>
        api.delete(`${BASE}/record/${diagnosisId}`).then(r => r.data),
};