import api from './api';

export type LabTestType = 'hep_b' | 'rft' | 'lft';
export type LabTestStatus = 'ordered' | 'in_progress' | 'completed' | 'cancelled';
export type LabResultFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' | 'abnormal';

export interface LabResult {
    id: string;
    lab_test_id: string;
    component_name: string;
    component_code: string | null;
    value_numeric: string | number | null;
    value_text: string | null;
    unit: string | null;
    reference_min: string | number | null;
    reference_max: string | number | null;
    abnormal_flag: LabResultFlag;
    is_abnormal: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface LabTest {
    id: string;
    patient_id: string;
    test_type: LabTestType;
    test_name: string;
    status: LabTestStatus;
    ordered_by: { id: string; name: string } | null;
    reviewed_by: { id: string; name: string } | null;
    ordered_at: string;
    collected_at: string | null;
    reported_at: string | null;
    has_abnormal_results: boolean;
    notes: string | null;
    results: LabResult[];
    created_at: string;
    updated_at: string;
}

export interface LabResultPayload {
    component_name: string;
    component_code?: string;
    value_numeric?: number;
    value_text?: string;
    unit?: string;
    reference_min?: number;
    reference_max?: number;
    abnormal_flag?: LabResultFlag;
    is_abnormal?: boolean;
    notes?: string;
}

export interface CreateLabTestPayload {
    test_type: LabTestType;
    test_name?: string;
    collected_at?: string;
    reported_at?: string;
    status?: LabTestStatus;
    notes?: string;
    results?: LabResultPayload[];
}

export type UpdateLabTestPayload = Partial<Omit<CreateLabTestPayload, 'results'>>;
export type UpdateLabResultPayload = Partial<LabResultPayload>;

const BASE = '/api/v1/patient-tests';

export const labTestService = {
    list: (patientId: string, testType?: LabTestType): Promise<LabTest[]> =>
        api.get(`${BASE}/${patientId}`, { params: testType ? { test_type: testType } : undefined }).then(r => r.data),

    create: (patientId: string, data: CreateLabTestPayload): Promise<LabTest> =>
        api.post(`${BASE}/${patientId}`, data).then(r => r.data),

    update: (testId: string, data: UpdateLabTestPayload): Promise<LabTest> =>
        api.patch(`${BASE}/record/${testId}`, data).then(r => r.data),

    addResult: (testId: string, data: LabResultPayload): Promise<LabTest> =>
        api.post(`${BASE}/record/${testId}/results`, data).then(r => r.data),

    updateResult: (resultId: string, data: UpdateLabResultPayload): Promise<LabTest> =>
        api.patch(`${BASE}/results/${resultId}`, data).then(r => r.data),
};
