import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type {
    PatientSearchFilters,
    PatientSearchResponse,
    VaccinationSearchFilters,
    VaccinationSearchResponse,
    PaymentSearchFilters,
    PaymentSearchResponse,
    VaccineSearchFilters,
    VaccineSearchResponse
} from '../types/search';
import { searchService } from '../services/searchService';

// Query Keys - IMPORTANT: Each search type must have COMPLETELY unique keys
export const searchKeys = {
    // Each key builder creates a UNIQUE array structure for that search type
    patients: (filters: PatientSearchFilters) =>
        ['search', 'patients', { ...filters }] as const,
    vaccinations: (filters: VaccinationSearchFilters) =>
        ['search', 'vaccinations', { ...filters }] as const,
    payments: (filters: PaymentSearchFilters) =>
        ['search', 'payments', { ...filters }] as const,
    vaccines: (filters: VaccineSearchFilters) =>
        ['search', 'vaccines', { ...filters }] as const,
};

// Patient Search Hook
export const usePatientSearch = (filters: PatientSearchFilters = {}, enabled: boolean = true) => {
    return useQuery<PatientSearchResponse>({
        queryKey: searchKeys.patients(filters),
        queryFn: () => searchService.searchPatients(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        enabled,
        // Add this to help with debugging
        meta: {
            searchType: 'patients'
        }
    });
};

// Vaccination Search Hook
export const useVaccinationSearch = (filters: VaccinationSearchFilters = {}, enabled: boolean = true) => {
    return useQuery<VaccinationSearchResponse>({
        queryKey: searchKeys.vaccinations(filters),
        queryFn: () => searchService.searchVaccinations(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        enabled,
        meta: {
            searchType: 'vaccinations'
        }
    });
};

// Payment Search Hook
export const usePaymentSearch = (filters: PaymentSearchFilters = {}, enabled: boolean = true) => {
    return useQuery<PaymentSearchResponse>({
        queryKey: searchKeys.payments(filters),
        queryFn: () => searchService.searchPayments(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        enabled,
        meta: {
            searchType: 'payments'
        }
    });
};

// Vaccine Search Hook
export const useVaccineSearch = (filters: VaccineSearchFilters = {}, enabled: boolean = true) => {
    return useQuery<VaccineSearchResponse>({
        queryKey: searchKeys.vaccines(filters),
        queryFn: () => searchService.searchVaccines(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        enabled,
        meta: {
            searchType: 'vaccines'
        }
    });
};