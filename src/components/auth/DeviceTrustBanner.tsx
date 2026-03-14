/**
 * DeviceTrustBanner.tsx
 *
 * Renders the correct UI for each of the five device-trust rejection states
 * returned by the server after a login attempt.
 */

import type { DeviceTrustError, LoginError } from "../../hooks/useLogin";


const ICONS: Record<DeviceTrustError | 'default', string> = {
    new_device_detected: '🔐',
    device_pending: '⏳',
    device_blocked: '🚫',
    device_suspicious: '⚠️',
    device_expired: '🔄',
    default: '⚠️',
};

const TITLES: Record<DeviceTrustError, string> = {
    new_device_detected: 'New Device Detected',
    device_pending: 'Approval Pending',
    device_blocked: 'Device Blocked',
    device_suspicious: 'Security Review',
    device_expired: 'Trust Expired',
};

const COLORS: Record<DeviceTrustError, { bg: string; border: string; title: string; body: string; badge: string }> = {
    new_device_detected: {
        bg: 'bg-blue-50', border: 'border-blue-200',
        title: 'text-blue-900', body: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800',
    },
    device_pending: {
        bg: 'bg-amber-50', border: 'border-amber-200',
        title: 'text-amber-900', body: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800',
    },
    device_blocked: {
        bg: 'bg-red-50', border: 'border-red-200',
        title: 'text-red-900', body: 'text-red-700',
        badge: 'bg-red-100 text-red-800',
    },
    device_suspicious: {
        bg: 'bg-orange-50', border: 'border-orange-200',
        title: 'text-orange-900', body: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800',
    },
    device_expired: {
        bg: 'bg-slate-50', border: 'border-slate-200',
        title: 'text-slate-900', body: 'text-slate-600',
        badge: 'bg-slate-100 text-slate-700',
    },
};

interface Props {
    error: LoginError;
}

export function DeviceTrustBanner({ error }: Props) {
    if (error.type !== 'device_trust' || !error.deviceTrustCode) return null;

    const code = error.deviceTrustCode;
    const colors = COLORS[code];
    const icon = ICONS[code];
    const title = TITLES[code];

    return (
        <div className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
            {/* Header */}
            <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${colors.title}`}>{title}</p>
                    <p className={`text-sm mt-1 leading-snug ${colors.body}`}>
                        {error.message}
                    </p>
                </div>
            </div>

            {/* Metadata */}
            <div className="mt-3 space-y-1.5">
                {error.requiresApproval && (
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                            Admin approval required
                        </span>
                    </div>
                )}

                {error.deviceId && (
                    <p className={`text-[10px] font-mono ${colors.body} opacity-60`}>
                        Device ID: {error.deviceId}
                    </p>
                )}
            </div>

            {/* State-specific help text */}
            {code === 'new_device_detected' && (
                <div className={`mt-3 text-xs ${colors.body} border-t ${colors.border} pt-3`}>
                    <p className="font-semibold mb-1">What happens next?</p>
                    <ol className="list-decimal list-inside space-y-0.5 opacity-80">
                        <li>Your device has been registered and is pending review.</li>
                        <li>An administrator will approve or reject it shortly.</li>
                        <li>You will be able to log in once approved.</li>
                    </ol>
                </div>
            )}

            {code === 'device_expired' && (
                <div className={`mt-3 text-xs ${colors.body} border-t ${colors.border} pt-3`}>
                    <p className="opacity-80">
                        Periodic re-approval is required for security. Contact your administrator
                        to restore access from this device.
                    </p>
                </div>
            )}

            {(code === 'device_blocked' || code === 'device_suspicious') && (
                <div className={`mt-3 text-xs ${colors.body} border-t ${colors.border} pt-3`}>
                    <p className="opacity-80">
                        Contact your facility administrator for assistance. Do not attempt
                        to log in repeatedly — further attempts may escalate restrictions.
                    </p>
                </div>
            )}
        </div>
    );
}