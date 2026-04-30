export type FacilityNotificationStatus =
    | 'unread'
    | 'acknowledged'
    | 'in_progress'
    | 'resolved'
    | 'dismissed';

export type FacilityNotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface FacilityNotification {
    id: string;
    facility_id: string;
    patient_id: string;
    reminder_id: string | null;
    title: string;
    message: string;
    notification_type: string;
    priority: FacilityNotificationPriority;
    status: FacilityNotificationStatus;
    action_label: string | null;
    action_url: string | null;
    due_date: string | null;
    patient_phone: string | null;
    patient_name: string | null;
    created_at: string;
    acknowledged_at: string | null;
    resolved_at: string | null;
    assigned_to: { id: string; name: string } | null;
}

export interface UpdateFacilityNotificationPayload {
    status?: FacilityNotificationStatus;
    assigned_to_id?: string | null;
}
