import React, { useState } from 'react';
import { useFacilityStaff, useRemoveStaff } from '../../hooks/useFacilities';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate, getRoleBadgeColor, getInitials } from '../../utils/formatters';
import {
    Mail,
    Phone,
    Calendar,
    Shield,
    Loader2,
    AlertTriangle,
    UserX,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface FacilityStaffRowProps {
    facilityId: string;
    facilityName: string;
}

export const FacilityStaffRow: React.FC<FacilityStaffRowProps> = ({ facilityId, facilityName }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { confirm } = useConfirm();

    const { data: staffData, isLoading, error } = useFacilityStaff(facilityId, currentPage);
    const removeStaffMutation = useRemoveStaff(facilityId);

    const handleRemoveStaff = async (userId: string, userName: string) => {
        const confirmed = await confirm({
            title: 'Remove Staff Member',
            message: `Are you sure you want to remove ${userName} from ${facilityName}?`,
            confirmText: 'Remove',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        removeStaffMutation.mutate(userId);
    };

    if (isLoading) {
        return (
            <div className="px-6 py-8 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading staff members...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700">Failed to load staff members</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!staffData || staffData.items.length === 0) {
        return (
            <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">No staff members assigned to this facility</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-4">
            {/* Staff Header */}
            <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                    Staff Members ({staffData.page_info.total_items})
                </h4>
                {staffData.page_info.total_pages > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            Page {staffData.page_info.current_page} of {staffData.page_info.total_pages}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(staffData.page_info.previous_page)}
                                disabled={!staffData.page_info.has_previous}
                                className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(staffData.page_info.next_page)}
                                disabled={!staffData.page_info.has_next}
                                className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {staffData.items.map((staff) => (
                    <div
                        key={staff.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                    {getInitials(staff.full_name)}
                                </div>
                            </div>

                            {/* Staff Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <h5 className="text-sm font-semibold text-gray-900 truncate">
                                        {staff.full_name}
                                    </h5>
                                    {staff.roles && staff.roles.length > 0 && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded ${getRoleBadgeColor(staff.roles[0].name)}`}>
                                            <Shield className="w-2.5 h-2.5" />
                                            {staff.roles[0].name}
                                        </span>
                                    )}
                                    {!staff.is_active && (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-600 border border-gray-200">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <a href={`mailto:${staff.email}`} className="hover:text-blue-600 hover:underline truncate">
                                            {staff.email}
                                        </a>
                                    </div>
                                    {staff.phone && (
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            <a href={`tel:${staff.phone}`} className="hover:text-blue-600 hover:underline">
                                                {staff.phone}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Calendar className="w-3 h-3 flex-shrink-0" />
                                        <span>Joined {formatDate(staff.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => handleRemoveStaff(staff.id, staff.full_name)}
                                disabled={removeStaffMutation.isLoading}
                                className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove"
                            >
                                {removeStaffMutation.isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <UserX className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};