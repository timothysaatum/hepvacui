import React, { useState } from 'react';
import { PendingDevicesList } from '../../components/devices/PendingDevicesList';
import { MyDevicesList } from '../../components/devices/MyDevicesList';
import { useAuth } from '../../context/AuthContext';

export const DevicesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'myDevices'>('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.roles?.some(role => role.name.toLowerCase() === 'admin');

  const handleApprove = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Device Logins</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isAdmin 
            ? 'Approve or deny device access' 
            : 'Your Device'}
        </p>
      </div>

      {/* Tabs */}
      {isAdmin && (
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚠️ Pending Approvals
            </button>
            <button
              onClick={() => setActiveTab('myDevices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'myDevices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📱 My Devices
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
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900"> New device logins</h3>
            <div className="mt-2 text-sm text-blue-700">
              {isAdmin && (
                <p>
                  New device login requires admin approval to access systemm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};