import api from './api';
import type { AllergySeverity, PatientAllergy } from '../types/patient';

export interface CreateAllergyPayload {
    allergen: string;
    reaction?: string;
    severity?: AllergySeverity;
    notes?: string;
    is_active?: boolean;
}

export interface UpdateAllergyPayload {
    allergen?: string;
    reaction?: string;
    severity?: AllergySeverity;
    notes?: string;
    is_active?: boolean;
}

export const allergyService = {
    list: async (patientId: string, activeOnly = false): Promise<PatientAllergy[]> => {
        const response = await api.get(`/api/v1/patients/${patientId}/allergies`, {
            params: { active_only: activeOnly },
        });
        return response.data;
    },

    create: async (patientId: string, data: CreateAllergyPayload): Promise<PatientAllergy> => {
        const response = await api.post(`/api/v1/patients/${patientId}/allergies`, data);
        return response.data;
    },

    update: async (allergyId: string, data: UpdateAllergyPayload): Promise<PatientAllergy> => {
        const response = await api.patch(`/api/v1/patients/allergies/${allergyId}`, data);
        return response.data;
    },
};
