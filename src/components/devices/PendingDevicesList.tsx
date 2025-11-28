import React, { useState, useEffect } from 'react';
import { deviceService } from '../../services/deviceService';
import type { Device } from '../../types/device';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../components/common/ConfirmDialog';
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
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface PendingDevicesListProps {
  onApprove?: (deviceId: string) => void;
}

export const PendingDevicesList: React.FC<PendingDevicesListProps> = ({ onApprove }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await deviceService.getPendingDevices();
      setDevices(data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch pending devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleApprove = async (deviceId: string) => {
    try {
      setApprovingId(deviceId);
      await deviceService.approveDevice(deviceId, {
        status: 'trusted',
        expires_in_days: 30
      });
      showSuccess('Device approved successfully');
      fetchDevices();
      if (onApprove) onApprove(deviceId);
    } catch (err) {
      showError('Failed to approve device. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeny = async (deviceId: string, deviceName: string) => {
    const confirmed = await confirm({
      title: 'Deny Device Access',
      message: `Are you sure you want to deny access for "${deviceName}"? This action cannot be undone.`,
      confirmText: 'Deny Access',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      setApprovingId(deviceId);
      await deviceService.approveDevice(deviceId, {
        status: 'blocked',
        notes: 'Access denied by administrator'
      });
      showSuccess('Device access denied');
      fetchDevices();
    } catch (err) {
      showError('Failed to deny device access');
    } finally {
      setApprovingId(null);
    }
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
          <p className="text-sm text-gray-500 font-medium">Loading pending devices...</p>
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
            <h3 className="text-sm font-semibold text-red-900">Failed to load pending devices</h3>
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending device approvals</h3>
          <p className="text-sm text-gray-500">All devices have been reviewed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-amber-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Device Approvals</h3>
            <p className="text-sm text-gray-600">{devices.length} device(s) awaiting approval</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {devices.map((device) => {
          const DeviceIcon = getDeviceIcon(device.device_type);
          const isProcessing = approvingId === device.id;

          return (
            <div key={device.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Device Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DeviceIcon className="w-6 h-6 text-white" />
                </div>

                {/* Device Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-base font-semibold text-gray-900 truncate">
                      {device.device_name}
                    </h4>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Pending
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
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(device.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm whitespace-nowrap"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeny(device.id, device.device_name)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm whitespace-nowrap"
                  >
                    <XCircle className="w-4 h-4" />
                    Deny
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};