// src/types/search.ts

export interface PatientSearchFilters {
    name?: string;
    phone?: string;
    facility_id?: string;
    patient_type?: 'pregnant' | 'regular';
    status?: 'active' | 'inactive' | 'converted' | 'postpartum' | 'completed';
    sex?: 'male' | 'female';
    age_min?: number;
    age_max?: number;
    created_from?: string;
    created_to?: string;
    page?: number;
    page_size?: number;
}

export interface PatientSearchResult {
    id: string;
    name: string;
    phone: string;
    age: number;
    sex: 'male' | 'female';
    patient_type: 'pregnant' | 'regular';
    status: string;
    facility_id: string;
    created_at: string;
    expected_delivery_date?: string;
    actual_delivery_date?: string;
    diagnosis_date?: string;
    treatment_start_date?: string;
    viral_load?: string;
}

export interface PatientSearchResponse {
    items: PatientSearchResult[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    query_time_ms?: number;
}

export interface VaccinationSearchFilters {
    patient_id?: string;
    patient_name?: string;
    patient_phone?: string;
    vaccine_name?: string;
    batch_number?: string;
    dose_number?: '1st dose' | '2nd dose' | '3rd dose';
    dose_date_from?: string;
    dose_date_to?: string;
    administered_by_id?: string;
    facility_id?: string;
    page?: number;
    page_size?: number;
}

export interface VaccinationSearchResult {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_phone: string;
    vaccine_purchase_id: string;
    vaccine_name: string;
    dose_number: string;
    dose_date: string;
    batch_number: string;
    vaccine_price: number;
    administered_by_id?: string;
    notes?: string;
    created_at: string;
}

export interface VaccinationSearchResponse {
    items: VaccinationSearchResult[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    query_time_ms?: number;
}

export interface PaymentSearchFilters {
    patient_id?: string;
    patient_name?: string;
    patient_phone?: string;
    vaccine_purchase_id?: string;
    payment_method?: string;
    payment_date_from?: string;
    payment_date_to?: string;
    amount_min?: number;
    amount_max?: number;
    received_by_id?: string;
    facility_id?: string;
    reference_number?: string;
    page?: number;
    page_size?: number;
}

export interface PaymentSearchResult {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_phone: string;
    vaccine_purchase_id: string;
    vaccine_name: string;
    amount: number;
    payment_date: string;
    payment_method?: string;
    reference_number?: string;
    received_by_id?: string;
    notes?: string;
    created_at: string;
}

export interface PaymentSearchResponse {
    items: PaymentSearchResult[];
    total_count: number;
    total_amount: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    query_time_ms?: number;
}