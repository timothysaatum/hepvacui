import type { UserInfo } from './patient';

// ── Prescription ─────────────────────────────────────────────────────────────

export interface Prescription {
    id: string;
    patient_id: string;
    prescribed_by: UserInfo | null;
    updated_by: UserInfo | null;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration_months: number;
    prescription_date: string;
    start_date: string;
    end_date: string | null;
    instructions: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePrescriptionPayload {
    medication_name: string;
    dosage: string;
    frequency: string;
    duration_months?: number;
    prescription_date: string;
    start_date: string;
    end_date?: string;
    instructions?: string;
}

export interface UpdatePrescriptionPayload {
    medication_name?: string;
    dosage?: string;
    frequency?: string;
    duration_months?: number;
    end_date?: string;
    instructions?: string;
    is_active?: boolean;
}

// ── Medication Schedule ───────────────────────────────────────────────────────

export interface MedicationSchedule {
    id: string;
    patient_id: string;
    prescription_id: string | null;
    medication_name: string;
    scheduled_date: string;
    quantity_purchased: number | null;
    months_supply: number | null;
    next_dose_due_date: string | null;
    is_completed: boolean;
    completed_date: string | null;
    lab_review_scheduled: boolean;
    lab_review_date: string | null;
    lab_review_completed: boolean;
    notes: string | null;
    updated_by: UserInfo | null;
    created_at: string;
    updated_at: string;
}

export interface CreateSchedulePayload {
    medication_name: string;
    scheduled_date: string;
    prescription_id?: string;
    quantity_purchased?: number;
    months_supply?: number;
    notes?: string;
}

export interface UpdateSchedulePayload {
    quantity_purchased?: number;
    months_supply?: number;
    next_dose_due_date?: string;
    is_completed?: boolean;
    completed_date?: string;
    lab_review_scheduled?: boolean;
    lab_review_date?: string;
    lab_review_completed?: boolean;
    notes?: string;
}
