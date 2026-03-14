import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { DeviceTrustBanner } from '../../components/auth/DeviceTrustBanner';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle, LogIn } from 'lucide-react';
import type { LoginError } from '../../hooks/useLogin';
import { clearFingerprintCache, getFingerprint, warmFingerprintCache } from '../../services/fingerPrintService';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Credential errors (wrong password, account locked, etc.)
  const [credentialError, setCredentialError] = useState('');

  // Device-trust errors — drives the DeviceTrustBanner
  const [deviceError, setDeviceError] = useState<LoginError | null>(null);

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialError('');
    setDeviceError(null);
    setLoading(true);

    // ── Step 1: generate (or retrieve cached) hardware fingerprint ─────────
    // This runs in parallel with the user waiting for the button press to
    // register, so it adds negligible latency to perceived login time.
    let fingerprintHeader = 'v2:' + '0'.repeat(64); // safe fallback
    try {
      const { fingerprint, version } = await getFingerprint();
      fingerprintHeader = `${version}:${fingerprint}`;
    } catch (fpErr) {
      // Fingerprinting failure is non-fatal — the server will register this
      // as an unknown device and require admin approval, which is the safe
      // default behaviour. Log and continue.
      console.warn('[Drive4Health] Fingerprint generation failed:', fpErr);
    }

    // ── Step 2: call the auth context login with the fingerprint header ────
    // useAuth().login must accept an optional `headers` argument and forward
    // it to the POST /auth/login request (see note below).
    try {
      await login(
        { username, password },
        { 'X-Device-Fingerprint': fingerprintHeader },
      );
      navigate('/patients');

    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      // ── 403 = device trust rejection ────────────────────────────────────
      if (status === 403 && detail?.error) {
        // Clear the cache so a re-attempt re-fingerprints from scratch.
        clearFingerprintCache();
        setDeviceError({
          type: 'device_trust',
          deviceTrustCode: detail.error,
          deviceId: detail.device_id,
          requiresApproval: detail.requires_approval ?? false,
          message: detail.message ?? 'Device not trusted.',
        });
        return;
      }

      // ── 401 = bad credentials ────────────────────────────────────────────
      if (status === 401) {
        setCredentialError('Invalid username or password.');
        return;
      }

      // ── 400 = malformed fingerprint header ───────────────────────────────
      if (status === 400 && detail?.error === 'invalid_fingerprint_format') {
        clearFingerprintCache();
        setCredentialError('Device verification failed. Please refresh and try again.');
        return;
      }

      // ── Fallback ─────────────────────────────────────────────────────────
      setCredentialError(
        detail || 'Login failed. Please check your credentials and try again.',
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full space-y-8">

        {/* Logo/Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">D4H</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your Drive4Health account
          </p>
        </div>

        {/* Device trust banner — rendered OUTSIDE the card so it can expand */}
        {deviceError && (
          <DeviceTrustBanner error={deviceError} />
        )}

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>

            {/* Credential error */}
            {credentialError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">Login Failed</h3>
                    <p className="text-sm text-red-700 mt-0.5">{credentialError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onFocus={warmFingerprintCache}
                  onChange={(e) => { setUsername(e.target.value); setDeviceError(null); }}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setDeviceError(null); }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              © 2026 Drive4Health. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};