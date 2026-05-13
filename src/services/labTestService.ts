import api from './api';

export type LabTestType = 'hep_b' | 'rft' | 'lft';
export type LabTestStatus = 'draft' | 'filed' | 'verified' | 'ordered' | 'in_progress' | 'completed' | 'cancelled';
export type LabResultFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' | 'abnormal';
export type LabValueType = 'numeric' | 'text' | 'both';
export type LabPaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue';

export interface LabTestParameterDefinition {
    id: string;
    lab_test_definition_id: string;
    code: string;
    name: string;
    value_type: LabValueType;
    unit: string | null;
    reference_min: string | number | null;
    reference_max: string | number | null;
    normal_values: string[];
    abnormal_values: string[];
    display_order: number;
    is_required: boolean;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface LabTestDefinition {
    id: string;
    code: string;
    name: string;
    short_name: string | null;
    category: string | null;
    description: string | null;
    specimen: string | null;
    method: string | null;
    price: string | number;
    is_active: boolean;
    parameters: LabTestParameterDefinition[];
    created_at: string;
    updated_at: string;
}

export interface LabTestParameterDefinitionPayload {
    code: string;
    name: string;
    value_type: LabValueType;
    unit?: string | null;
    reference_min?: number | null;
    reference_max?: number | null;
    normal_values?: string[];
    abnormal_values?: string[];
    display_order?: number;
    is_required?: boolean;
    is_active?: boolean;
    notes?: string | null;
}

export interface LabTestDefinitionPayload {
    code: string;
    name: string;
    short_name?: string | null;
    category?: string | null;
    description?: string | null;
    specimen?: string | null;
    method?: string | null;
    price?: number | null;
    is_active?: boolean;
    parameters?: LabTestParameterDefinitionPayload[];
}

export interface LabResult {
    id: string;
    lab_test_id: string;
    parameter_definition_id: string | null;
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
    test_definition_id: string | null;
    test_definition: LabTestDefinition | null;
    test_type: LabTestType | null;
    test_name: string;
    status: LabTestStatus;
    ordered_by: { id: string; name: string } | null;
    reviewed_by: { id: string; name: string } | null;
    payment_recorded_by: { id: string; name: string } | null;
    ordered_at: string;
    collected_at: string | null;
    reported_at: string | null;
    total_price: string | number;
    amount_paid: string | number;
    payment_status: LabPaymentStatus;
    payment_method: string | null;
    payment_reference: string | null;
    paid_at: string | null;
    payment_balance: string | number;
    has_abnormal_results: boolean;
    notes: string | null;
    clinical_history: string | null;
    attachments: LabTestAttachment[];
    results: LabResult[];
    created_at: string;
    updated_at: string;
}

export interface LabTestAttachment {
    file_name: string;
    content_type: string;
    size: number;
    description?: string;
}

export interface LabResultPayload {
    parameter_definition_id?: string;
    component_name?: string;
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
    test_definition_id?: string;
    test_type?: LabTestType;
    test_name?: string;
    collected_at?: string;
    reported_at?: string;
    status?: LabTestStatus;
    total_price?: number | null;
    amount_paid?: number;
    payment_status?: LabPaymentStatus;
    payment_method?: string | null;
    payment_reference?: string | null;
    paid_at?: string | null;
    notes?: string;
    clinical_history?: string;
    attachments?: LabTestAttachment[];
    results?: LabResultPayload[];
}

export type UpdateLabTestPayload = Partial<Omit<CreateLabTestPayload, 'results'>>;
export type UpdateLabResultPayload = Partial<LabResultPayload>;

const BASE = '/api/v1/patient-tests';
const DEFINITIONS_BASE = '/api/v1/lab-test-definitions';

export const labTestService = {
    list: (patientId: string, testType?: LabTestType): Promise<LabTest[]> =>
        api.get(`${BASE}/${patientId}`, { params: testType ? { test_type: testType } : undefined }).then(r => r.data),

    create: (patientId: string, data: CreateLabTestPayload): Promise<LabTest> =>
        api.post(`${BASE}/${patientId}`, data).then(r => r.data),

    update: (testId: string, data: UpdateLabTestPayload): Promise<LabTest> =>
        api.patch(`${BASE}/record/${testId}`, data).then(r => r.data),

    delete: (testId: string): Promise<void> =>
        api.delete(`${BASE}/record/${testId}`).then(r => r.data),

    addResult: (testId: string, data: LabResultPayload): Promise<LabTest> =>
        api.post(`${BASE}/record/${testId}/results`, data).then(r => r.data),

    updateResult: (resultId: string, data: UpdateLabResultPayload): Promise<LabTest> =>
        api.patch(`${BASE}/results/${resultId}`, data).then(r => r.data),

    listDefinitions: (includeInactive = false): Promise<LabTestDefinition[]> =>
        api.get(DEFINITIONS_BASE, { params: includeInactive ? { include_inactive: true } : undefined }).then(r => r.data),

    createDefinition: (data: LabTestDefinitionPayload): Promise<LabTestDefinition> =>
        api.post(DEFINITIONS_BASE, data).then(r => r.data),

    updateDefinition: (id: string, data: Partial<LabTestDefinitionPayload>): Promise<LabTestDefinition> =>
        api.patch(`${DEFINITIONS_BASE}/${id}`, data).then(r => r.data),

    deleteDefinition: (id: string): Promise<void> =>
        api.delete(`${DEFINITIONS_BASE}/${id}`).then(r => r.data),

    createParameter: (testDefinitionId: string, data: LabTestParameterDefinitionPayload): Promise<LabTestParameterDefinition> =>
        api.post(`${DEFINITIONS_BASE}/${testDefinitionId}/parameters`, data).then(r => r.data),

    updateParameter: (id: string, data: Partial<LabTestParameterDefinitionPayload>): Promise<LabTestParameterDefinition> =>
        api.patch(`${DEFINITIONS_BASE}/parameters/${id}`, data).then(r => r.data),

    deactivateParameter: (id: string): Promise<LabTestParameterDefinition> =>
        api.delete(`${DEFINITIONS_BASE}/parameters/${id}`).then(r => r.data),
};
