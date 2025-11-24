import React, { useState, memo } from 'react';
import type { Facility } from '../../types/facility';
import { useFacilities, useDeleteFacility } from '../../hooks/useFacilities';
import { useConfirm } from '../common/ConfirmDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

interface FacilityListProps {
  onEdit?: (facility: Facility) => void;
  onViewStaff?: (facility: Facility) => void;
}

// Memoized Facility Row Component
const FacilityRow = memo<{
  facility: Facility;
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string, facilityName: string) => void;
  onViewStaff?: (facility: Facility) => void;
}>(({ facility, onEdit, onDelete, onViewStaff }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
            🏥
          </div>
          <div className="text-sm font-medium text-gray-900">{facility.facility_name}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{facility.phone}</div>
        <div className="text-sm text-gray-500">{facility.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{facility.address}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(facility.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
        {onViewStaff && (
          <button
            onClick={() => onViewStaff(facility)}
            className="text-green-600 hover:text-green-900 transition-colors"
          >
            Staff
          </button>
        )}
        <button
          onClick={() => onEdit(facility)}
          className="text-blue-600 hover:text-blue-900 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(facility.id, facility.facility_name)}
          className="text-red-600 hover:text-red-900 transition-colors"
        >
          Delete
        </button>
      </td>
    </tr>
  );
});

FacilityRow.displayName = 'FacilityRow';

export const FacilityList: React.FC<FacilityListProps> = ({ onEdit, onViewStaff }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { confirm } = useConfirm();

  // Use React Query hook with debounced search
  const { data, isLoading, error, isFetching } = useFacilities(currentPage, 10, debouncedSearch);
  const deleteMutation = useDeleteFacility();

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = async (facilityId: string, facilityName: string) => {
    const confirmed = await confirm({
      title: 'Delete Facility',
      message: `Are you sure you want to delete "${facilityName}"? This action cannot be undone.`,
      confirmText: 'Delete Facility',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    deleteMutation.mutate(facilityId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading facilities...</p>
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
          <span>Failed to load facilities. Please try again.</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🏥</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {searchTerm ? 'No facilities found' : 'No facilities yet'}
        </h3>
        <p className="text-gray-500">
          {searchTerm 
            ? `No facilities match "${searchTerm}"`
            : 'Get started by creating your first facility.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow relative">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
          {isFetching && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facility Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
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
            {data.items.map((facility) => (
              <FacilityRow
                key={facility.id}
                facility={facility}
                onEdit={onEdit!}
                onDelete={handleDelete}
                onViewStaff={onViewStaff}
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
          <span className="font-medium">{data.page_info.total_items}</span> total facilities
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