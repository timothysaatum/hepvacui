import api from './api';
import type {
    DashboardOverview,
    VaccineUsageResponse,
    RevenueAnalyticsResponse,
    FacilityPerformanceResponse,
    DeviceAnalyticsResponse,
    VaccinationTrendResponse,
    DashboardFilters,
} from '../types/dashboard';

export const dashboardService = {
    getOverview: async (facilityId?: string): Promise<DashboardOverview> => {
        const params = new URLSearchParams();
        if (facilityId) params.append('facility_id', facilityId);

        const response = await api.get(`/api/v1/dashboard/overview?${params.toString()}`);
        return response.data;
    },

    getVaccineUsage: async (filters: DashboardFilters): Promise<VaccineUsageResponse> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await api.get(`/api/v1/dashboard/vaccine-usage?${params.toString()}`);
        return response.data;
    },

    getRevenue: async (filters: DashboardFilters): Promise<RevenueAnalyticsResponse> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await api.get(`/api/v1/dashboard/revenue?${params.toString()}`);
        return response.data;
    },

    getFacilityPerformance: async (): Promise<FacilityPerformanceResponse> => {
        const response = await api.get('/api/v1/dashboard/facility-performance');
        return response.data;
    },

    getDeviceAnalytics: async (): Promise<DeviceAnalyticsResponse> => {
        const response = await api.get('/api/v1/dashboard/devices');
        return response.data;
    },

    getVaccinationTrends: async (filters: DashboardFilters): Promise<VaccinationTrendResponse> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await api.get(`/api/v1/dashboard/vaccination-trends?${params.toString()}`);
        return response.data;
    },
};
