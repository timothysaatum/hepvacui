import React, { useState, useEffect } from 'react';
import { deviceService } from '../../services/deviceService';
import type { Device, DeviceStatus } from '../../types/device';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../common/ConfirmDialog';

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

  const getStatusColor = (status: DeviceStatus) => {
    const colors = {
      trusted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
      suspicious: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('mobile')) return '📱';
    if (type.includes('tablet')) return '📱';
    if (type.includes('desktop')) return '🖥️';
    return '💻';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading your devices...</div>
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
        <div className="text-gray-400 text-5xl mb-4">📱</div>
        <p className="text-gray-600">No devices registered</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">My Devices</h3>
        <p className="text-sm text-gray-600 mt-1">Manage devices with access to your account</p>
      </div>

      <div className="divide-y divide-gray-200">
        {devices.map((device) => (
          <div key={device.id} className="p-6 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex items-start flex-1">
                <div className="text-4xl mr-4">
                  {getDeviceIcon(device.device_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{device.device_name}</h4>
                    <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.status)}`}>
                      {device.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Browser: </span>
                      <span className="font-medium text-gray-900">{device.browser}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">OS: </span>
                      <span className="font-medium text-gray-900">{device.os}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type: </span>
                      <span className="font-medium text-gray-900">{device.device_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">IP: </span>
                      <span className="font-medium text-gray-900">{device.last_ip_address}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">First Seen: </span>
                      <span className="font-medium text-gray-900">{formatDate(device.first_seen)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Active: </span>
                      <span className="font-medium text-gray-900">{formatDate(device.last_seen)}</span>
                    </div>
                  </div>

                  {device.approved_at && (
                    <div className="mt-2 text-sm text-gray-500">
                      Approved on {formatDate(device.approved_at)}
                    </div>
                  )}
                </div>
              </div>

              {device.status === 'trusted' && (
                <button
                  onClick={() => handleRevoke(device.id, device.device_name)}
                  disabled={revokingId === device.id}
                  className="ml-4 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {revokingId === device.id ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};