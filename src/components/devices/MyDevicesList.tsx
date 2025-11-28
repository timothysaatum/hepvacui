import React, { useState, useEffect } from 'react';
import { deviceService } from '../../services/deviceService';
import type { Device, DeviceStatus } from '../../types/device';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../common/ConfirmDialog';
import {
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Globe,
  Wifi,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Trash2,
  Loader2
} from 'lucide-react';

export const MyDevicesList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await deviceService.getMyDevices();
      setDevices(data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRevoke = async (deviceId: string, deviceName: string) => {
    const confirmed = await confirm({
      title: 'Revoke Device Access',
      message: `Are you sure you want to revoke access for "${deviceName}"? You will need to re-authenticate from this device.`,
      confirmText: 'Revoke Access',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      setRevokingId(deviceId);
      await deviceService.revokeDevice(deviceId);
      showSuccess('Device access revoked successfully');
      fetchDevices();
    } catch (err) {
      showError('Failed to revoke device access');
    } finally {
      setRevokingId(null);
    }
  };

  const getStatusDisplay = (status: DeviceStatus) => {
    const displays = {
      trusted: {
        className: 'bg-green-50 text-green-700 border border-green-200',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
        label: 'Trusted'
      },
      pending: {
        className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        icon: Clock,
        iconColor: 'text-yellow-600',
        label: 'Pending'
      },
      blocked: {
        className: 'bg-red-50 text-red-700 border border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600',
        label: 'Blocked'
      },
      suspicious: {
        className: 'bg-gray-50 text-gray-700 border border-gray-200',
        icon: AlertTriangle,
        iconColor: 'text-gray-600',
        label: 'Suspicious'
      }
    };
    return displays[status] || displays.suspicious;
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('mobile')) return Smartphone;
    if (type.includes('tablet')) return Tablet;
    if (type.includes('desktop')) return Monitor;
    return Laptop;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading your devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Failed to load devices</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices registered</h3>
          <p className="text-sm text-gray-500">You haven't connected any devices yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Devices</h3>
            <p className="text-sm text-gray-600">Manage devices with access to your account</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {devices.map((device) => {
          const DeviceIcon = getDeviceIcon(device.device_type);
          const statusDisplay = getStatusDisplay(device.status);
          const StatusIcon = statusDisplay.icon;

          return (
            <div key={device.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Device Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DeviceIcon className="w-6 h-6 text-white" />
                </div>

                {/* Device Info */}
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
                        <p className="text-xs text-gray-500">Last Active</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{formatDate(device.last_seen)}</p>
                      </div>
                    </div>
                  </div>

                  {device.approved_at && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2.5">
                      <p className="text-xs text-green-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved on {formatDate(device.approved_at)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {device.status === 'trusted' && (
                  <button
                    onClick={() => handleRevoke(device.id, device.device_name)}
                    disabled={revokingId === device.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                  >
                    {revokingId === device.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Revoke
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};