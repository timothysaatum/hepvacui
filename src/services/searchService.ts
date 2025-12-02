import api from './api';
import type {
    PatientSearchFilters,
    PatientSearchResponse,
    VaccinationSearchFilters,
    VaccinationSearchResponse,
    PaymentSearchFilters,
    PaymentSearchResponse,
} from '../types/search';

export const searchService = {
    // Search patients
    searchPatients: async (filters: PatientSearchFilters): Promise<PatientSearchResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get(`/api/v1/search/patients?${params.toString()}`);
        return response.data;
    },

    // Search vaccinations
    searchVaccinations: async (filters: VaccinationSearchFilters): Promise<VaccinationSearchResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get(`/api/v1/search/vaccinations?${params.toString()}`);
        return response.data;
    },

    // Search payments
    searchPayments: async (filters: PaymentSearchFilters): Promise<PaymentSearchResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get(`/api/v1/search/payments?${params.toString()}`);
        return response.data;
    },
};