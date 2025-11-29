import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type { DashboardFilters } from '../types/dashboard';

export const useDashboardOverview = (facilityId?: string) => {
    return useQuery({
        queryKey: ['dashboard', 'overview', facilityId],
        queryFn: () => dashboardService.getOverview(facilityId),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useVaccineUsage = (filters: DashboardFilters) => {
    return useQuery({
        queryKey: ['dashboard', 'vaccine-usage', filters],
        queryFn: () => dashboardService.getVaccineUsage(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useRevenueAnalytics = (filters: DashboardFilters) => {
    return useQuery({
        queryKey: ['dashboard', 'revenue', filters],
        queryFn: () => dashboardService.getRevenue(filters),
        staleTime: 5 * 60 * 1000,
    });
};

export const useFacilityPerformance = () => {
    return useQuery({
        queryKey: ['dashboard', 'facility-performance'],
        queryFn: () => dashboardService.getFacilityPerformance(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useDeviceAnalytics = () => {
    return useQuery({
        queryKey: ['dashboard', 'devices'],
        queryFn: () => dashboardService.getDeviceAnalytics(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useVaccinationTrends = (filters: DashboardFilters) => {
    return useQuery({
        queryKey: ['dashboard', 'vaccination-trends', filters],
        queryFn: () => dashboardService.getVaccinationTrends(filters),
        staleTime: 5 * 60 * 1000,
    });
};
