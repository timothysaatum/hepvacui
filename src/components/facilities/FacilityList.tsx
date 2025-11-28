import React, { useState, memo } from 'react';
import type { Facility } from '../../types/facility';
import { useFacilities, useDeleteFacility } from '../../hooks/useFacilities';
import { useConfirm } from '../common/ConfirmDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';
import { FacilityStaffRow } from './FacilityStaffRow';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface FacilityListProps {
  onEdit?: (facility: Facility) => void;
}

// Memoized Facility Row Component with expandable staff
const FacilityRow = memo<{
  facility: Facility;
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string, facilityName: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}>(({ facility, onEdit, onDelete, isExpanded, onToggleExpand }) => {
  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {facility.facility_name}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {facility.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {facility.email}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-900 line-clamp-2">{facility.address}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(facility.created_at)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleExpand}
              className={`p-2 rounded-lg transition-colors ${isExpanded
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-green-600 hover:bg-green-50'
                }`}
              title={isExpanded ? 'Hide Staff' : 'View Staff'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <Users className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onEdit(facility)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(facility.id, facility.facility_name)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="px-0 py-0 bg-gray-50">
            <FacilityStaffRow facilityId={facility.id} facilityName={facility.facility_name} />
          </td>
        </tr>
      )}
    </>
  );
});

FacilityRow.displayName = 'FacilityRow';

export const FacilityList: React.FC<FacilityListProps> = ({ onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFacilityId, setExpandedFacilityId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { confirm } = useConfirm();

  const { data, isLoading, error, isFetching } = useFacilities(currentPage, 10, debouncedSearch);
  const deleteMutation = useDeleteFacility();

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

  const handleToggleExpand = (facilityId: string) => {
    setExpandedFacilityId(expandedFacilityId === facilityId ? null : facilityId);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading facilities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Failed to load facilities</h3>
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
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No facilities found' : 'No facilities yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {searchTerm
              ? `No facilities match "${searchTerm}"`
              : 'Get started by creating your first healthcare facility'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
          />
          {isFetching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Facility Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Address
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
            {data.items.map((facility) => (
              <FacilityRow
                key={facility.id}
                facility={facility}
                onEdit={onEdit!}
                onDelete={handleDelete}
                isExpanded={expandedFacilityId === facility.id}
                onToggleExpand={() => handleToggleExpand(facility.id)}
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
          <span className="font-semibold text-gray-900">{data.page_info.total_items}</span> total facilities
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