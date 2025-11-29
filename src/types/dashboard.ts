export interface DashboardOverview {
    total_patients: number;
    active_patients: number;
    pregnant_patients: number;
    regular_patients: number;
    total_vaccinations: number;
    vaccinations_this_month: number;
    vaccinations_this_year: number;
    total_revenue: number;
    revenue_this_month: number;
    revenue_this_year: number;
    outstanding_balance: number;
    active_vaccine_purchases: number;
    completed_vaccine_purchases: number;
    low_stock_vaccines: number;
    total_vaccines: number;
    trusted_devices: number;
    pending_devices: number;
}

export interface VaccineUsageItem {
    vaccine_name: string;
    total_doses_administered: number;
    unique_patients: number;
    total_revenue: number;
}

export interface VaccineUsageResponse {
    items: VaccineUsageItem[];
    total_doses: number;
    total_revenue: number;
    period: string;
}

export interface RevenueByMonth {
    year: number;
    month: number;
    month_name: string;
    total_revenue: number;
    payment_count: number;
    average_payment: number;
}

export interface RevenueByYear {
    year: number;
    total_revenue: number;
    payment_count: number;
    monthly_breakdown: RevenueByMonth[];
}

export interface RevenueAnalyticsResponse {
    total_revenue: number;
    yearly_breakdown: RevenueByYear[];
    payment_methods: Array<{
        method: string;
        total: number;
        count: number;
    }>;
}

export interface FacilityPerformanceItem {
    facility_id: string;
    facility_name: string;
    total_patients: number;
    active_patients: number;
    total_vaccinations: number;
    total_revenue: number;
    outstanding_balance: number;
    average_revenue_per_patient: number;
    staff_count: number;
}

export interface FacilityPerformanceResponse {
    items: FacilityPerformanceItem[];
    total_revenue_all_facilities: number;
    top_performing_facility: FacilityPerformanceItem | null;
}

export interface DeviceAnalyticsResponse {
    total_devices: number;
    by_status: Array<{ status: string; count: number }>;
    by_browser: Array<{ browser: string; count: number }>;
    by_os: Array<{ os: string; count: number }>;
    recently_approved: number;
    pending_approval: number;
}

export interface VaccinationTrendItem {
    year: number;
    month: number;
    month_name: string;
    total_vaccinations: number;
    first_dose: number;
    second_dose: number;
    third_dose: number;
    unique_patients: number;
}

export interface VaccinationTrendResponse {
    items: VaccinationTrendItem[];
    total_vaccinations: number;
    average_per_month: number;
}

export interface DashboardFilters {
    facility_id?: string;
    year?: number;
    month?: number;
    start_date?: string;
    end_date?: string;
}