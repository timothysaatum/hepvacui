// src/hooks/useSearch.ts

import { useQuery } from '@tanstack/react-query';
import { searchService } from '../services/searchService';
import type {
    PatientSearchFilters,
    VaccinationSearchFilters,
    PaymentSearchFilters,
} from '../types/search';

export const usePatientSearch = (filters: PatientSearchFilters, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['search', 'patients', filters],
        queryFn: () => searchService.searchPatients(filters),
        enabled,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

export const useVaccinationSearch = (filters: VaccinationSearchFilters, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['search', 'vaccinations', filters],
        queryFn: () => searchService.searchVaccinations(filters),
        enabled,
        staleTime: 1 * 60 * 1000,
    });
};

export const usePaymentSearch = (filters: PaymentSearchFilters, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['search', 'payments', filters],
        queryFn: () => searchService.searchPayments(filters),
        enabled,
        staleTime: 1 * 60 * 1000,
    });
};