/**
 * analyticsService.ts
 *
 * Typed client for all /analytics/* endpoints.
 * Replaces the per-patient N+1 data aggregation in the old DashboardPage.
 */

import api from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Response types  (mirror analytics_schemas.py)
// ─────────────────────────────────────────────────────────────────────────────

export interface PatientCounts {
    total: number;
    pregnant: number;
    regular: number;
    active: number;
    inactive: number;
    postpartum: number;
    completed: number;
    new_this_month: number;
    new_last_month: number;
}

export interface PaymentStatusCounts {
    completed: number;
    partial: number;
    pending: number;
    total_purchases: number;
}

export interface FinancialSummary {
    total_revenue: string;        // Decimal serialised as string
    total_outstanding: string;
    month_revenue: string;
    last_month_revenue: string;
    total_doses: number;
    administered_doses: number;
    payment_status_counts: PaymentStatusCounts;
}

export interface VaccineDoseCompletion {
    vaccine_name: string;
    total_doses: number;
    administered_doses: number;
    completion_rate: number;      // 0-100
}

export interface HepBResultCounts {
    positive: number;
    negative: number;
    indeterminate: number;
    untested: number;
}

export interface ClinicalSummary {
    upcoming_deliveries_30d: number;
    overdue_deliveries: number;
    checkups_pending: number;
    checkups_completed: number;
    hep_b_results: HepBResultCounts;
}

export interface DashboardSummary {
    patients: PatientCounts;
    financials: FinancialSummary;
    dose_completion_by_vaccine: VaccineDoseCompletion[];
    clinical: ClinicalSummary;
}

export interface RevenueDay {
    date: string;         // ISO date string "YYYY-MM-DD"
    revenue: string;      // Decimal as string
    sales_count: number;
}

export interface RevenueTrend {
    days: number;
    series: RevenueDay[];
}

export interface AcquisitionDay {
    date: string;
    pregnant: number;
    regular: number;
    total: number;
}

export interface AcquisitionTrend {
    days: number;
    series: AcquisitionDay[];
}

export interface UpcomingDelivery {
    patient_id: string;
    name: string;
    phone: string;
    expected_delivery_date: string;
    days_until_delivery: number;  // negative = overdue
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Parse a Decimal-serialised string safely (backend returns strings for Decimal). */
export const toNumber = (value: string | number): number =>
    typeof value === 'number' ? value : parseFloat(value) || 0;

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'api/v1/analytics';

export const analyticsService = {
    /**
     * All KPI numbers in a single request.
     * Replaces: per-patient patient list + N purchase fetches.
     */
    getSummary: async (): Promise<DashboardSummary> => {
        const { data } = await api.get<DashboardSummary>(`${BASE}/summary`);
        return data;
    },

    /**
     * Daily revenue time series for the last `days` days.
     * Only days with sales are returned; fill zeros client-side.
     */
    getRevenueTrend: async (days: 7 | 30 | number = 30): Promise<RevenueTrend> => {
        const { data } = await api.get<RevenueTrend>(`${BASE}/revenue-trend`, {
            params: { days },
        });
        return data;
    },

    /**
     * Daily new-patient counts (split by type) for the last `days` days.
     */
    getAcquisitionTrend: async (days: 7 | 30 | number = 30): Promise<AcquisitionTrend> => {
        const { data } = await api.get<AcquisitionTrend>(`${BASE}/acquisition`, {
            params: { days },
        });
        return data;
    },

    /**
     * Patients with active pregnancies due within `daysAhead` days, plus overdue.
     * Returns [] when there are no upcoming deliveries.
     */
    getUpcomingDeliveries: async (daysAhead = 30): Promise<UpcomingDelivery[]> => {
        const { data } = await api.get<UpcomingDelivery[]>(`${BASE}/upcoming-deliveries`, {
            params: { days_ahead: daysAhead },
        });
        return data;
    },
};