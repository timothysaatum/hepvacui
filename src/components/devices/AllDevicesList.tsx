import React, { useState, useEffect } from 'react';
import { deviceService } from '../../services/deviceService';
import type { Device, DeviceStatus } from '../../types/device';
import { useToast } from '../../context/ToastContext';
import {
    Smartphone, Tablet, Monitor, Laptop, Globe, Wifi,
    Calendar, Clock, CheckCircle2, AlertTriangle, XCircle,
    Shield, Trash2, Loader2
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: DeviceStatus | undefined }[] = [
    { label: 'All', value: undefined },
    { label: 'Trusted', value: 'trusted' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Suspicious', value: 'suspicious' },
];

export const AllDevicesList: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<DeviceStatus | undefined>(undefined);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { showSuccess, showError } = useToast();

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const data = await deviceService.getAllDevices(statusFilter);
            setDevices(data);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch devices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [statusFilter]);

    const handleApprove = async (deviceId: string) => {
        try {
            setProcessingId(deviceId);
            await deviceService.approveDevice(deviceId, { status: 'trusted', expires_in_days: 30 });
            showSuccess('Device approved successfully');
            fetchDevices();
        } catch {
            showError('Failed to approve device');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeny = async (deviceId: string) => {
        try {
            setProcessingId(deviceId);
            await deviceService.approveDevice(deviceId, {
                status: 'blocked',
                notes: 'Access denied by administrator'
            });
            showSuccess('Device access denied');
            fetchDevices();
        } catch {
            showError('Failed to deny device');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRevoke = async (deviceId: string) => {
        try {
            setProcessingId(deviceId);
            await deviceService.revokeDevice(deviceId);
            showSuccess('Device revoked successfully');
            fetchDevices();
        } catch {
            showError('Failed to revoke device');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusDisplay = (status: DeviceStatus) => {
        const displays = {
            trusted: { className: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2, iconColor: 'text-green-600', label: 'Trusted' },
            pending: { className: 'bg-yellow-50 text-yellow-700 border border-yellow-200', icon: Clock, iconColor: 'text-yellow-600', label: 'Pending' },
            blocked: { className: 'bg-red-50 text-red-700 border border-red-200', icon: XCircle, iconColor: 'text-red-600', label: 'Blocked' },
            suspicious: { className: 'bg-gray-50 text-gray-700 border border-gray-200', icon: AlertTriangle, iconColor: 'text-gray-600', label: 'Suspicious' },
        };
        return displays[status] || displays.suspicious;
    };

    const getDeviceIcon = (deviceType: string) => {
        const type = deviceType?.toLowerCase() || '';
        if (type.includes('mobile')) return Smartphone;
        if (type.includes('tablet')) return Tablet;
        if (type.includes('desktop')) return Monitor;
        return Laptop;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Count pending devices for badge — only meaningful when showing all
    const pendingCount = devices.filter(d => d.status === 'pending').length;

    return (
        <div className="space-y-4">
            {/* Status filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map(({ label, value }) => (
                    <button
                        key={label}
                        onClick={() => setStatusFilter(value)}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === value
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {label}
                        {/* Red badge on Pending button when there are pending devices and not already filtered */}
                        {label === 'Pending' && pendingCount > 0 && statusFilter !== 'pending' && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Loading devices...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : devices.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices found</h3>
                    <p className="text-sm text-gray-500">No devices match the selected filter</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {statusFilter
                                        ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Devices`
                                        : 'All Devices'}
                                </h3>
                                <p className="text-sm text-gray-600">{devices.length} device(s)</p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {devices.map((device) => {
                            const DeviceIcon = getDeviceIcon(device.device_type);
                            const statusDisplay = getStatusDisplay(device.status);
                            const StatusIcon = statusDisplay.icon;
                            const isProcessing = processingId === device.id;

                            return (
                                <div key={device.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${device.status === 'pending'
                                                ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                                                : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                            }`}>
                                            <DeviceIcon className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h4 className="text-base font-semibold text-gray-900 truncate">
                                                    {device.device_name}
                                                </h4>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${statusDisplay.className}`}>
                                                    <StatusIcon className={`w-3 h-3 ${statusDisplay.iconColor}`} />
                                                    {statusDisplay.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <div className="flex items-start gap-2">
                                                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Browser</p>
                                                        <p className="text-sm font-medium text-gray-900 truncate">{device.browser}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Monitor className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Operating System</p>
                                                        <p className="text-sm font-medium text-gray-900 truncate">{device.os}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Smartphone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Device Type</p>
                                                        <p className="text-sm font-medium text-gray-900 truncate">{device.device_type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Wifi className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">IP Address</p>
                                                        <p className="text-sm font-medium text-gray-900 truncate">{device.last_ip_address}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">First Seen</p>
                                                        <p className="text-sm font-medium text-gray-900 truncate">{formatDate(device.first_seen)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Last Seen</p>
                                                        <p className="text-sm font-medium text-gray-900 truncate">{formatDate(device.last_seen)}</p>
                                                    </div>
                                                </div>
                                                {device.approved_at && (
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-gray-500">Approved At</p>
                                                            <p className="text-sm font-medium text-gray-900 truncate">{formatDate(device.approved_at)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 shrink-0">
                                            {device.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(device.id)}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm whitespace-nowrap"
                                                    >
                                                        {isProcessing
                                                            ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                                                            : <><CheckCircle2 className="w-4 h-4" />Approve</>
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeny(device.id)}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm whitespace-nowrap"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Deny
                                                    </button>
                                                </>
                                            )}
                                            {device.status === 'trusted' && (
                                                <button
                                                    onClick={() => handleRevoke(device.id)}
                                                    disabled={isProcessing}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm whitespace-nowrap"
                                                >
                                                    {isProcessing
                                                        ? <><Loader2 className="w-4 h-4 animate-spin" />Revoking...</>
                                                        : <><Trash2 className="w-4 h-4" />Revoke</>
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};