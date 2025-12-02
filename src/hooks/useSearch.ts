import { useQuery } from '@tanstack/react-query';
import { searchService } from '../services/searchService';
import type {
    PatientSearchFilters,
    VaccinationSearchFilters,
    PaymentSearchFilters,
} from '../types/search';

// export const usePatientSearch = (filters: PatientSearchFilters, enabled: boolean = true) => {
//     return useQuery({
//         queryKey: ['search', 'patients', filters],
//         queryFn: () => searchService.searchPatients(filters),
//         enabled,
//         staleTime: 1 * 60 * 1000, // 1 minute
//     });
// };
export const usePatientSearch = (filters: PatientSearchFilters, enabled: boolean = true) => {
    const query = useQuery({
        queryKey: ['search', 'patients', filters],
        queryFn: () => searchService.searchPatients(filters),
        enabled,
        staleTime: 1 * 60 * 1000,
    });

    return {
        ...query,
        isFetching: query.isFetching,   // for loading spinner
        isLoading: query.isLoading,     // first load
        isError: query.isError,
    };
};

// export const useVaccinationSearch = (filters: VaccinationSearchFilters, enabled: boolean = true) => {
//     return useQuery({
//         queryKey: ['search', 'vaccinations', filters],
//         queryFn: () => searchService.searchVaccinations(filters),
//         enabled,
//         staleTime: 1 * 60 * 1000,
//     });
// };
export const useVaccinationSearch = (filters: VaccinationSearchFilters, enabled: boolean = true) => {
    const query = useQuery({
        queryKey: ['search', 'vaccinations', filters],
        queryFn: () => searchService.searchVaccinations(filters),
        enabled,
        staleTime: 1 * 60 * 1000,
    });

    return {
        ...query,
        isFetching: query.isFetching,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};


// export const usePaymentSearch = (filters: PaymentSearchFilters, enabled: boolean = true) => {
//     return useQuery({
//         queryKey: ['search', 'payments', filters],
//         queryFn: () => searchService.searchPayments(filters),
//         enabled,
//         staleTime: 1 * 60 * 1000,
//     });
// };
export const usePaymentSearch = (filters: PaymentSearchFilters, enabled: boolean = true) => {
    const query = useQuery({
        queryKey: ['search', 'payments', filters],
        queryFn: () => searchService.searchPayments(filters),
        enabled,
        staleTime: 1 * 60 * 1000,
    });

    return {
        ...query,
        isFetching: query.isFetching,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};