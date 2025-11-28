import React, { useState, useEffect } from 'react';
import type { Facility } from '../../types/facility';
import { useFacilityStaff, useRemoveStaff } from '../../hooks/useFacilities';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate, getRoleBadgeColor, getInitials } from '../../utils/formatters';
import {
  X,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2,
  AlertTriangle,
  UserX
} from 'lucide-react';

interface FacilityStaffModalProps {
  facility: Facility;
  onClose: () => void;
}

export const FacilityStaffModal: React.FC<FacilityStaffModalProps> = ({ facility, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm } = useConfirm();

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Staff Members</h2>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{facility.facility_name}</span>
                {staffData && ` • ${staffData.page_info.total_items} staff member${staffData.page_info.total_items !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-sm text-gray-500 font-medium">Loading staff members...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-900">Failed to load staff members</h3>
                  <p className="text-sm text-red-700 mt-0.5">Please try again later</p>
                </div>
              </div>
            </div>
          ) : !staffData || staffData.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members assigned</h3>
              <p className="text-sm text-gray-500">This facility doesn't have any staff members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffData.items.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {getInitials(staff.full_name)}
                      </div>
                    </div>

                    {/* Staff Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">
                          {staff.full_name}
                        </h3>
                        {staff.roles && staff.roles.length > 0 && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md ${getRoleBadgeColor(staff.roles[0].name)}`}>
                            <Shield className="w-3 h-3" />
                            {staff.roles[0].name}
                          </span>
                        )}
                        {!staff.is_active && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <a href={`mailto:${staff.email}`} className="hover:text-blue-600 hover:underline truncate">
                            {staff.email}
                          </a>
                        </div>
                        {staff.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <a href={`tel:${staff.phone}`} className="hover:text-blue-600 hover:underline">
                              {staff.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Joined {formatDate(staff.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleRemoveStaff(staff.id, staff.full_name)}
                        disabled={removeStaffMutation.isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removeStaffMutation.isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4" />
                            Remove
                          </>
                        )}
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
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{staffData.page_info.current_page}</span> of{' '}
                <span className="font-semibold text-gray-900">{staffData.page_info.total_pages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(staffData.page_info.previous_page)}
                  disabled={!staffData.page_info.has_previous}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(staffData.page_info.next_page)}
                  disabled={!staffData.page_info.has_next}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};