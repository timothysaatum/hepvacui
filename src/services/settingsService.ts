import api from './api';

export interface Settings {
    id: number;
    notification_target: string;
    reminder_interval_days: number;
    reminder_message: string | null;
    dashboard_refresh_rate_seconds: number;
    enable_dashboard_auto_refresh: boolean;
    system_status: string;
    maintenance_message: string | null;
    maintenance_start: string | null;
    maintenance_end: string | null;
    require_device_approval: boolean;
    session_timeout_minutes: number;
    max_login_attempts: number;
    lockout_duration_minutes: number;
    created_at: string;
    updated_at: string;
    updated_by_id: string | null;
}

export interface PublicSettings {
    system_status: string;
    maintenance_message: string | null;
    maintenance_start: string | null;
    maintenance_end: string | null;
    dashboard_refresh_rate_seconds: number;
    enable_dashboard_auto_refresh: boolean;
}

export interface UpdateSettingsPayload {
    notification_target?: string;
    reminder_interval_days?: number;
    reminder_message?: string | null;
    dashboard_refresh_rate_seconds?: number;
    enable_dashboard_auto_refresh?: boolean;
    require_device_approval?: boolean;
    session_timeout_minutes?: number;
    max_login_attempts?: number;
    lockout_duration_minutes?: number;
}

export interface SystemStatusUpdate {
    status: string;
    message?: string | null;
    start_time?: string | null;
    end_time?: string | null;
}

export const settingsService = {
    /**
     * Get public settings (no authentication required)
     */
    getPublicSettings: async (): Promise<PublicSettings> => {
        const response = await api.get('/api/v1/settings/public');
        return response.data;
    },

    /**
     * Get all settings (authenticated users)
     */
    getSettings: async (): Promise<Settings> => {
        const response = await api.get('/api/v1/settings');
        return response.data;
    },

    /**
     * Update settings (admin only) - Using PATCH method
     */
    updateSettings: async (data: UpdateSettingsPayload): Promise<Settings> => {
        const response = await api.patch('/api/v1/settings', data);
        return response.data;
    },

    /**
     * Update system status (admin only)
     */
    updateSystemStatus: async (data: SystemStatusUpdate): Promise<Settings> => {
        const response = await api.post('/api/v1/settings/system-status', data);
        return response.data;
    },

    /**
     * Invalidate settings cache (admin only)
     */
    invalidateCache: async (): Promise<{ message: string }> => {
        const response = await api.post('/api/v1/settings/invalidate-cache');
        return response.data;
    },

    /**
     * Check settings health
     */
    healthCheck: async (): Promise<{
        settings_exist: boolean;
        system_accessible: boolean;
        system_status: string;
        cache_active: boolean;
    }> => {
        const response = await api.get('/api/v1/settings/health');
        return response.data;
    },
};