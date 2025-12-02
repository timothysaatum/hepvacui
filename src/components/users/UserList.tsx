import React, { useState, memo } from 'react';
import type { User } from '../../types/user';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate, getRoleBadgeColor, getInitials } from '../../utils/formatters';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Ban,
  AlertTriangle,
  Loader2,
  Users
} from 'lucide-react';

interface UserListProps {
  onEdit?: (user: User) => void;
}

// Memoized User Row Component
const UserRow = memo<{
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string, userName: string) => void
}>(({ user, onEdit, onDelete }) => {
  const getStatusDisplay = () => {
    if (user.is_suspended) {
      return {
        icon: Ban,
        text: 'Suspended',
        className: 'bg-red-50 text-red-700 border border-red-200',
        iconColor: 'text-red-600'
      };
    }
    if (user.is_active) {
      return {
        icon: CheckCircle2,
        text: 'Active',
        className: 'bg-green-50 text-green-700 border border-green-200',
        iconColor: 'text-green-600'
      };
    }
    return {
      icon: XCircle,
      text: 'Inactive',
      className: 'bg-gray-50 text-gray-700 border border-gray-200',
      iconColor: 'text-gray-600'
    };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {getInitials(user.full_name)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user.username}
            </div>
            {user.roles && user.roles.length > 0 && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded mt-1 ${getRoleBadgeColor(user.roles[0].name)}`}>
                <Shield className="w-2.5 h-2.5" />
                {user.roles[0].name}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <a href={`mailto:${user.email}`} className="hover:text-blue-600 hover:underline truncate">
            {user.email}
          </a>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {user.phone}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${statusDisplay.className}`}>
          <StatusIcon className={`w-3 h-3 ${statusDisplay.iconColor}`} />
          {statusDisplay.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.facility ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate max-w-[150px]" title={user.facility.facility_name}>
              {user.facility.facility_name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">N/A</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(user.created_at)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(user.id, user.full_name)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

UserRow.displayName = 'UserRow';

export const UserList: React.FC<UserListProps> = ({ onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm } = useConfirm();

  const { data, isPending, error, isFetching } = useUsers(currentPage, 10);
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

  if (isPending) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading staff members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Failed to load users</h3>
            <p className="text-sm text-red-700 mt-0.5">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members yet</h3>
          <p className="text-sm text-gray-500">Get started by creating your first staff account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
      {/* Loading overlay */}
      {isFetching && !isPending && (
        <div className="absolute top-4 right-4 z-10">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Facility
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
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
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page <span className="font-semibold text-gray-900">{data.page_info.current_page}</span> of{' '}
          <span className="font-semibold text-gray-900">{data.page_info.total_pages}</span>
          {' • '}
          <span className="font-semibold text-gray-900">{data.page_info.total_items}</span> total users
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(data.page_info.previous_page)}
            disabled={!data.page_info.has_previous || isFetching}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(data.page_info.next_page)}
            disabled={!data.page_info.has_next || isFetching}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};