import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/dashboardService';

export const useDashboardSummary = () => {
    return useQuery({
        queryKey: ['analytics', 'summary'],
        queryFn: () => analyticsService.getSummary(),
        staleTime: 2 * 60 * 1000,
    });
};

export const useRevenueTrend = (days: number = 30) => {
    return useQuery({
        queryKey: ['analytics', 'revenue-trend', days],
        queryFn: () => analyticsService.getRevenueTrend(days),
        staleTime: 5 * 60 * 1000,
    });
};

export const useAcquisitionTrend = (days: number = 30) => {
    return useQuery({
        queryKey: ['analytics', 'acquisition', days],
        queryFn: () => analyticsService.getAcquisitionTrend(days),
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpcomingDeliveries = (daysAhead: number = 30) => {
    return useQuery({
        queryKey: ['analytics', 'upcoming-deliveries', daysAhead],
        queryFn: () => analyticsService.getUpcomingDeliveries(daysAhead),
        staleTime: 2 * 60 * 1000,
    });
};