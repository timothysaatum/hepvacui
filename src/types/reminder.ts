export type ReminderType =
    | 'delivery_week'
    | 'child_6month_checkup'
    | 'medication_due'
    | 'payment_due'
    | 'vaccination_due';

export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface PatientReminder {
    id: string;
    patient_id: string;
    reminder_type: ReminderType;
    scheduled_date: string;
    message: string;
    status: ReminderStatus;
    sent_at: string | null;
    child_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateReminderPayload {
    reminder_type: ReminderType;
    scheduled_date: string;
    message: string;
    child_id?: string;
}

export interface UpdateReminderPayload {
    scheduled_date?: string;
    message?: string;
    status?: ReminderStatus;
}
