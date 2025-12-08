// import { useQuery, keepPreviousData } from '@tanstack/react-query';
// import { searchService } from '../services/searchService';
// import type {
//     PatientSearchFilters,
//     VaccinationSearchFilters,
//     PaymentSearchFilters,
//     VaccineSearchFilters,
// } from '../types/search';


// export const searchKeys = {
//     patients: (filters: PatientSearchFilters) => ['search', 'patients', filters] as const,
//     vaccinations: (filters: VaccinationSearchFilters) => ['search', 'vaccinations', filters] as const,
//     payments: (filters: PaymentSearchFilters) => ['search', 'payments', filters] as const,
//     vaccines: (filters: VaccineSearchFilters) => ['search', 'vaccines', filters] as const,
// };


// export const usePatientSearch = (filters: PatientSearchFilters) => {
//     return useQuery({
//         queryKey: searchKeys.patients(filters),
//         queryFn: () => searchService.searchPatients(filters),
//         staleTime: 3 * 60 * 1000, // 3 minutes - matches usePatients
//         placeholderData: keepPreviousData, // Smooth pagination/filtering
//     });
// };

// export const useVaccinationSearch = (filters: VaccinationSearchFilters) => {
//     return useQuery({
//         queryKey: searchKeys.vaccinations(filters),
//         queryFn: () => searchService.searchVaccinations(filters),
//         staleTime: 1 * 60 * 1000,
//         placeholderData: keepPreviousData,
//     });
// };

// export const usePaymentSearch = (filters: PaymentSearchFilters) => {
//     return useQuery({
//         queryKey: searchKeys.payments(filters),
//         queryFn: () => searchService.searchPayments(filters),
//         staleTime: 1 * 60 * 1000,
//         placeholderData: keepPreviousData,
//     });
// };


// export const useVaccineSearch = (filters: VaccineSearchFilters) => {
//     return useQuery({
//         queryKey: searchKeys.vaccines(filters),
//         queryFn: () => searchService.searchVaccines(filters),
//         staleTime: 3 * 60 * 1000,
//         placeholderData: keepPreviousData,
//     });
// };
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
// The problem was likely that filter objects were being compared by reference,
// causing cache collisions between different search types
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
export const usePatientSearch = (filters: PatientSearchFilters = {}) => {
    return useQuery<PatientSearchResponse>({
        queryKey: searchKeys.patients(filters),
        queryFn: () => searchService.searchPatients(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        // Add this to help with debugging
        meta: {
            searchType: 'patients'
        }
    });
};

// Vaccination Search Hook
export const useVaccinationSearch = (filters: VaccinationSearchFilters = {}) => {
    return useQuery<VaccinationSearchResponse>({
        queryKey: searchKeys.vaccinations(filters),
        queryFn: () => searchService.searchVaccinations(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        meta: {
            searchType: 'vaccinations'
        }
    });
};

// Payment Search Hook
export const usePaymentSearch = (filters: PaymentSearchFilters = {}) => {
    return useQuery<PaymentSearchResponse>({
        queryKey: searchKeys.payments(filters),
        queryFn: () => searchService.searchPayments(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        meta: {
            searchType: 'payments'
        }
    });
};

// Vaccine Search Hook
export const useVaccineSearch = (filters: VaccineSearchFilters = {}) => {
    return useQuery<VaccineSearchResponse>({
        queryKey: searchKeys.vaccines(filters),
        queryFn: () => searchService.searchVaccines(filters),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        meta: {
            searchType: 'vaccines'
        }
    });
};