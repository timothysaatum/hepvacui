import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useAuth } from '../../context/AuthContext';
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../context/ToastContext';
import {
    Bell,
    Clock,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Save,
    Info,
    RefreshCw,
    Lock,
    Users,
    Activity
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import type { UpdateSettingsPayload } from '../../services/settingsService';
import { AxiosError } from 'axios';

export const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<UpdateSettingsPayload>({});

    const isAdmin = user?.roles?.some(role => role.name.toLowerCase() === 'admin');

    // Fetch settings
    const { data: settings, isPending } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const data = await settingsService.getSettings();
            setFormData({
                notification_target: data.notification_target,
                reminder_interval_days: data.reminder_interval_days,
                reminder_message: data.reminder_message,
                dashboard_refresh_rate_seconds: data.dashboard_refresh_rate_seconds,
                enable_dashboard_auto_refresh: data.enable_dashboard_auto_refresh,
                require_device_approval: data.require_device_approval,
                session_timeout_minutes: data.session_timeout_minutes,
                max_login_attempts: data.max_login_attempts,
                lockout_duration_minutes: data.lockout_duration_minutes,
            });
            return data;
        },
    });

    // Update settings mutation
    const updateMutation = useMutation({
        mutationFn: async (data: UpdateSettingsPayload) => {
            return await settingsService.updateSettings(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            showSuccess('Settings updated successfully');
        },
        onError: (error: unknown) => {
            // safer than any
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.detail
                    : 'Failed to update settings';
            showError(message);
        },
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleChange = <K extends keyof UpdateSettingsPayload>(field: K, value: UpdateSettingsPayload[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    if (isPending) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <div>
                        <h3 className="font-semibold text-yellow-900">Admin Access Required</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            You need administrator privileges to access settings.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure application behavior and security settings
                    </p>
                </div>

                {settings && (
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date(settings.updated_at).toLocaleString()}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Notification Settings */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                                <p className="text-sm text-gray-600">Configure reminder notifications</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Notification Target */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Users className="w-4 h-4 inline mr-2" />
                                Notification Target
                            </label>
                            <select
                                value={formData.notification_target || ''}
                                onChange={(e) => handleChange('notification_target', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            >
                                <option value="all_patients">All Patients</option>
                                <option value="pregnant_only">Pregnant Only</option>
                                <option value="mothers_only">Mothers Only</option>
                                <option value="regular_only">Regular Only</option>
                                <option value="staff_only">Staff Only</option>
                            </select>
                        </div>

                        {/* Reminder Interval */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-2" />
                                Reminder Interval (days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={formData.reminder_interval_days || 3}
                                onChange={(e) => handleChange('reminder_interval_days', parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Days between vaccination reminders (1-30)
                            </p>
                        </div>

                        {/* Reminder Message */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Custom Reminder Message
                            </label>
                            <textarea
                                value={formData.reminder_message || ''}
                                onChange={(e) => handleChange('reminder_message', e.target.value)}
                                rows={3}
                                placeholder="Enter custom reminder message..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Dashboard Settings */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Dashboard Settings</h2>
                                <p className="text-sm text-gray-600">Configure dashboard behavior</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Auto Refresh Toggle */}
                        <div>
                            <label className="flex items-start cursor-pointer group">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={formData.enable_dashboard_auto_refresh ?? true}
                                        onChange={(e) => handleChange('enable_dashboard_auto_refresh', e.target.checked)}
                                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                                    />
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Enable Auto-Refresh</span>
                                        <RefreshCw className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Automatically refresh dashboard data
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Refresh Rate */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-2" />
                                Refresh Rate (seconds)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="300"
                                value={formData.dashboard_refresh_rate_seconds || 30}
                                onChange={(e) => handleChange('dashboard_refresh_rate_seconds', parseInt(e.target.value))}
                                disabled={!formData.enable_dashboard_auto_refresh}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Auto-refresh interval in seconds (10-300)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                                <p className="text-sm text-gray-600">Configure authentication and access control</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Device Approval */}
                        <div>
                            <label className="flex items-start cursor-pointer group">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={formData.require_device_approval ?? true}
                                        onChange={(e) => handleChange('require_device_approval', e.target.checked)}
                                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                                    />
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Require Device Approval</span>
                                        <Lock className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        New devices must be approved by admin before access
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Session Timeout */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-2" />
                                Session Timeout (minutes)
                            </label>
                            <input
                                type="number"
                                min="30"
                                max="1440"
                                value={formData.session_timeout_minutes || 480}
                                onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                User session timeout in minutes (30-1440)
                            </p>
                        </div>

                        {/* Max Login Attempts */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                Maximum Login Attempts
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="10"
                                value={formData.max_login_attempts || 5}
                                onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Failed login attempts before lockout (3-10)
                            </p>
                        </div>

                        {/* Lockout Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Lockout Duration (minutes)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="120"
                                value={formData.lockout_duration_minutes || 30}
                                onChange={(e) => handleChange('lockout_duration_minutes', parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Account lockout duration in minutes (10-120)
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Status Info */}
                <div className={`rounded-lg border p-4 ${settings?.system_status === 'active'
                        ? 'bg-green-50 border-green-200'
                        : settings?.system_status === 'maintenance'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        {settings?.system_status === 'active' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                System Status: {settings?.system_status?.toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Use the system status controls to change operational mode
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};