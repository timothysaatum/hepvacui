import React, { useState } from 'react';
import { UserList } from '../../components/users/UserList';
import { CreateUserForm } from '../../components/users/CreateUserForm';
import { EditUserForm } from '../../components/users/EditUserForm';
import type { User } from '../../types/user';
import { Plus, X } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleCreateSuccess = () => {
    setShowStaffForm(false);
  };

  const handleEditSuccess = () => {
    setEditingUserId(null);
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setShowStaffForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showStaffForm ? 'Add New Staff' : editingUserId ? 'Edit Staff' : 'Staff Management'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {showStaffForm ? 'Create a new staff member account' : editingUserId ? 'Update staff member information' : 'Manage staff members and user accounts'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowStaffForm(!showStaffForm);
            setEditingUserId(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all shadow-sm ${showStaffForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
              : 'bg-black text-white hover:bg-gray-900 focus:ring-black hover:scale-105'
            }`}
        >
          {showStaffForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Staff
            </>
          )}
        </button>
      </div>

      {/* Create Form */}
      {showStaffForm && (
        <CreateUserForm
          isStaff={true}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowStaffForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingUserId && (
        <EditUserForm
          userId={editingUserId}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingUserId(null)}
        />
      )}

      {/* User List - Only show when not creating or editing */}
      {!showStaffForm && !editingUserId && (
        <UserList onEdit={handleEdit} />
      )}
    </div>
  );
};