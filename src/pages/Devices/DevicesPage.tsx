import React, { useState } from 'react';
import { PendingDevicesList } from '../../components/devices/PendingDevicesList';
import { MyDevicesList } from '../../components/devices/MyDevicesList';
import { useAuth } from '../../context/useAuth'
import { AlertTriangle, Smartphone, Info } from 'lucide-react';

export const DevicesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'myDevices'>('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.roles?.some(role => role.name.toLowerCase() === 'admin');

  const handleApprove = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isAdmin
            ? 'Review and manage device access to the system'
            : 'View and manage your connected devices'}
        </p>
      </div>

      {/* Tabs */}
      {isAdmin && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pending'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Pending Approvals
            </button>
            <button
              onClick={() => setActiveTab('myDevices')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'myDevices'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Smartphone className="w-4 h-4" />
              My Devices
            </button>
          </nav>
        </div>
      )}

      {/* Content */}
      <div>
        {isAdmin && activeTab === 'pending' && (
          <PendingDevicesList key={refreshKey} onApprove={handleApprove} />
        )}

        {(activeTab === 'myDevices' || !isAdmin) && (
          <MyDevicesList key={refreshKey} />
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">About Device Security</h3>
            <div className="text-sm text-blue-700 space-y-1">
              {isAdmin ? (
                <>
                  <p>• All new device logins require admin approval before gaining system access</p>
                  <p>• Review device details carefully before approving access requests</p>
                  <p>• Approved devices are trusted for 30 days by default</p>
                  <p>• You can revoke access to any device at any time</p>
                </>
              ) : (
                <>
                  <p>• Your devices need admin approval for initial access</p>
                  <p>• Approved devices remain trusted for secure access</p>
                  <p>• You can revoke access to devices you no longer use</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};