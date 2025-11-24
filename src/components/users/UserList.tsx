import React, { useState, memo } from 'react';
import type { User } from '../../types/user';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate, getRoleBadgeColor, getUserStatusBadge, getInitials } from '../../utils/formatters';

interface UserListProps {
  onEdit?: (user: User) => void;
}

// Memoized User Row Component
const UserRow = memo<{ user: User; onEdit: (user: User) => void; onDelete: (userId: string, userName: string) => void }>(
  ({ user, onEdit, onDelete }) => {
    const statusBadge = getUserStatusBadge(user.is_active, user.is_suspended);
    
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
              {getInitials(user.full_name)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{user.username}</div>
              {user.roles && user.roles.length > 0 && (
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${getRoleBadgeColor(user.roles[0].name)}`}>
                  {user.roles[0].name}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {user.full_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.phone}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.className}`}>
            {statusBadge.text}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.facility?.facility_name || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(user.created_at)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(user.id, user.full_name)}
            className="text-red-600 hover:text-red-900 transition-colors"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
);

UserRow.displayName = 'UserRow';

export const UserList: React.FC<UserListProps> = ({ onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm } = useConfirm();
  
  // Use React Query hook
  const { data, isLoading, error, isFetching } = useUsers(currentPage, 10);
  const deleteMutation = useDeleteUser();

  const handleDelete = async (userId: string, userName: string) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    deleteMutation.mutate(userId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <div className="flex items-center">
          <span className="text-xl mr-2">⚠️</span>
          <span>Failed to load users. Please try again.</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-500">Get started by creating your first user.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow relative">
      {/* Loading overlay while fetching */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 right-0 mt-2 mr-2 z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.items.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={onEdit!}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Page <span className="font-medium">{data.page_info.current_page}</span> of{' '}
          <span className="font-medium">{data.page_info.total_pages}</span>
          {' • '}
          <span className="font-medium">{data.page_info.total_items}</span> total users
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(data.page_info.previous_page)}
            disabled={!data.page_info.has_previous || isFetching}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(data.page_info.next_page)}
            disabled={!data.page_info.has_next || isFetching}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};