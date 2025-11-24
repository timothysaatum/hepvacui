import React, { useState, useEffect } from 'react';
import type { Facility } from '../../types/facility';
import { useFacilityStaff, useRemoveStaff } from '../../hooks/useFacilities';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate, getRoleBadgeColor, getInitials } from '../../utils/formatters';

interface FacilityStaffModalProps {
  facility: Facility;
  onClose: () => void;
}

export const FacilityStaffModal: React.FC<FacilityStaffModalProps> = ({ facility, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm } = useConfirm();

  // Use React Query hook
  const { data: staffData, isLoading, error } = useFacilityStaff(facility.id, currentPage);
  const removeStaffMutation = useRemoveStaff(facility.id);

  const handleRemoveStaff = async (userId: string, userName: string) => {
    const confirmed = await confirm({
      title: 'Remove Staff Member',
      message: `Are you sure you want to remove ${userName} from this facility?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    removeStaffMutation.mutate(userId);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Staff Members</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{facility.facility_name}</span>
              {staffData && ` • ${staffData.page_info.total_items} staff member${staffData.page_info.total_items !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full text-2xl font-bold w-10 h-10 flex items-center justify-center transition-colors"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading staff members...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span>Failed to load staff members</span>
              </div>
            </div>
          ) : !staffData || staffData.items.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-xl font-medium mb-2">No staff members assigned</p>
              <p className="text-sm">This facility doesn't have any staff members yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffData.items.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {getInitials(staff.full_name)}
                        </div>
                      </div>

                      {/* Staff Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {staff.full_name}
                          </h3>
                          {staff.roles && staff.roles.length > 0 && (
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(staff.roles[0].name)}`}>
                              {staff.roles[0].name}
                            </span>
                          )}
                          {!staff.is_active && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-2">📧</span>
                            <a href={`mailto:${staff.email}`} className="hover:text-blue-600 hover:underline">
                              {staff.email}
                            </a>
                          </div>
                          {staff.phone && (
                            <div className="flex items-center">
                              <span className="mr-2">📱</span>
                              <a href={`tel:${staff.phone}`} className="hover:text-blue-600 hover:underline">
                                {staff.phone}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <span className="mr-2">📅</span>
                            <span>Joined {formatDate(staff.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleRemoveStaff(staff.id, staff.full_name)}
                        disabled={removeStaffMutation.isLoading}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {staffData && staffData.items.length > 0 && staffData.page_info.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{staffData.page_info.current_page}</span> of{' '}
                <span className="font-medium">{staffData.page_info.total_pages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(staffData.page_info.previous_page)}
                  disabled={!staffData.page_info.has_previous}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(staffData.page_info.next_page)}
                  disabled={!staffData.page_info.has_next}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};