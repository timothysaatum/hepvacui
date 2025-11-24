import React, { useState } from 'react';
import { UserList } from '../../components/users/UserList';
import { CreateUserForm } from '../../components/users/CreateUserForm';
import { EditUserForm } from '../../components/users/EditUserForm';
import type { User } from '../../types/user';

export const UsersPage: React.FC = () => {
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleCreateSuccess = () => {
    setShowStaffForm(false);
    // No need for refreshKey - React Query handles cache invalidation
  };

  const handleEditSuccess = () => {
    setEditingUserId(null);
    // No need for refreshKey - React Query handles cache invalidation
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setShowStaffForm(false);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          {/* <p className="text-sm text-gray-600 mt-1">Manage staff members and user accounts</p> */}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowStaffForm(!showStaffForm);
              setEditingUserId(null);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm font-medium transition-colors"
          >
            {showStaffForm ? '✕ Cancel' : '+ Add Staff'}
          </button>
        </div>
      </div>

      {showStaffForm && (
        <div className="mb-6">
          <CreateUserForm
            isStaff={true}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowStaffForm(false)}
          />
        </div>
      )}

      {editingUserId && (
        <div className="mb-6">
          <EditUserForm
            userId={editingUserId}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingUserId(null)}
          />
        </div>
      )}

      <UserList onEdit={handleEdit} />
    </div>
  );
};