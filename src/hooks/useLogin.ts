/**
 *
 * Wraps the authentication flow with device fingerprinting.
 *
 * Before the credentials are sent to the server:
 *   1. Generate (or retrieve cached) hardware fingerprint
 *   2. Attach it as X-Device-Fingerprint: <version>:<sha256>
 *
 * Error handling covers all five device-trust rejection states the
 * server can return, so the UI can display the correct message.
 */

import { useState, useCallback } from 'react';
import api from '../services/api';
import { clearFingerprintCache, getFingerprint } from '../services/fingerPrintService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DeviceTrustError =
    | 'new_device_detected'
    | 'device_pending'
    | 'device_blocked'
    | 'device_suspicious'
    | 'device_expired';

export interface LoginError {
    type: 'credentials' | 'device_trust' | 'network' | 'unknown';
    deviceTrustCode?: DeviceTrustError;
    deviceId?: string;
    requiresApproval?: boolean;
    message: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResult {
    success: boolean;
    error?: LoginError;
}

const DEVICE_TRUST_MESSAGES: Record<DeviceTrustError, string> = {
    new_device_detected:
        'This device has not been registered before. An administrator must approve it before you can log in.',
    device_pending:
        'Your device is awaiting administrator approval. You will be notified once approved.',
    device_blocked:
        'This device has been blocked. Please contact your administrator.',
    device_suspicious:
        'This device is currently under security review. Please contact your administrator.',
    device_expired:
        'Your device trust has expired and requires re-approval. Please contact your administrator.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<LoginError | null>(null);

    const login = useCallback(async (
        credentials: LoginCredentials,
    ): Promise<LoginResult> => {
        setLoading(true);
        setError(null);

        try {
            // ── 1. Compute fingerprint (cached after first call) ───────────────
            let fingerprintHeader: string;
            try {
                const { fingerprint, version } = await getFingerprint();
                fingerprintHeader = `${version}:${fingerprint}`;
            } catch (fpErr) {
                // If fingerprinting itself fails (e.g. CSP blocks canvas), send a
                // sentinel value so the server registers a fallback-only device
                // rather than crashing.
                console.warn('[Drive4Health] Fingerprint generation failed:', fpErr);
                fingerprintHeader = 'v2:' + '0'.repeat(64);
            }

            // ── 2. Send login request with fingerprint header ─────────────────
            await api.post(
                '/auth/login',
                credentials,
                {
                    headers: {
                        'X-Device-Fingerprint': fingerprintHeader,
                    },
                },
            );

            return { success: true };

        } catch (err: any) {
            const status = err?.response?.status;
            const detail = err?.response?.data?.detail;

            // ── 403 = device trust rejection ──────────────────────────────────
            if (status === 403 && detail?.error) {
                const code = detail.error as DeviceTrustError;
                const loginErr: LoginError = {
                    type: 'device_trust',
                    deviceTrustCode: code,
                    deviceId: detail.device_id,
                    requiresApproval: detail.requires_approval ?? false,
                    message: DEVICE_TRUST_MESSAGES[code] ?? detail.message ?? 'Device not trusted.',
                };
                setError(loginErr);
                // Clear the fingerprint cache so the next attempt re-fingerprints.
                // This matters if the user switches browsers or profiles.
                clearFingerprintCache();
                return { success: false, error: loginErr };
            }

            // ── 401 = bad credentials ─────────────────────────────────────────
            if (status === 401) {
                const loginErr: LoginError = {
                    type: 'credentials',
                    message: 'Invalid username or password.',
                };
                setError(loginErr);
                return { success: false, error: loginErr };
            }

            // ── 400 = fingerprint header malformed ────────────────────────────
            if (status === 400 && detail?.error === 'invalid_fingerprint_format') {
                clearFingerprintCache();
                const loginErr: LoginError = {
                    type: 'unknown',
                    message: 'Device verification failed. Please refresh and try again.',
                };
                setError(loginErr);
                return { success: false, error: loginErr };
            }

            // ── Network / unexpected ──────────────────────────────────────────
            const loginErr: LoginError = {
                type: err?.code === 'ERR_NETWORK' ? 'network' : 'unknown',
                message: err?.code === 'ERR_NETWORK'
                    ? 'Could not reach the server. Check your connection and try again.'
                    : 'An unexpected error occurred. Please try again.',
            };
            setError(loginErr);
            return { success: false, error: loginErr };

        } finally {
            setLoading(false);
        }
    }, []);

    return { login, loading, error, clearError: () => setError(null) };
}