import React, { useState, useEffect } from 'react';
import { deviceService } from '../../services/deviceService';
import type { Device } from '../../types/device';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../components/common/ConfirmDialog';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading pending devices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded">
        {error}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-5xl mb-4">✓</div>
        <p className="text-gray-600">No pending device approvals</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Device Approvals</h3>
            <p className="text-sm text-gray-600">{devices.length} device(s) awaiting approval</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {devices.map((device) => (
          <div key={device.id} className="p-6 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{device.device_name}</h4>
                  <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    PENDING
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Browser</p>
                    <p className="font-medium text-gray-900">{device.browser}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Operating System</p>
                    <p className="font-medium text-gray-900">{device.os}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Device Type</p>
                    <p className="font-medium text-gray-900">{device.device_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">IP Address</p>
                    <p className="font-medium text-gray-900">{device.last_ip_address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">First Seen</p>
                    <p className="font-medium text-gray-900">{formatDate(device.first_seen)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Seen</p>
                    <p className="font-medium text-gray-900">{formatDate(device.last_seen)}</p>
                  </div>
                </div>
              </div>

              <div className="ml-6 flex flex-col gap-2">
                <button
                  onClick={() => handleApprove(device.id)}
                  disabled={approvingId === device.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-medium"
                >
                  {approvingId === device.id ? 'Processing...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleDeny(device.id, device.device_name)}
                  disabled={approvingId === device.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 font-medium"
                >
                  ✕ Deny
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};