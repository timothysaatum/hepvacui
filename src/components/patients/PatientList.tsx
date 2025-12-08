import React, { useState, memo, useEffect, useCallback } from 'react';
import type { Patient, PatientType, PatientStatus } from '../../types/patient';
import { usePatientSearch } from '../../hooks/useSearch';
import { useDeletePatient } from '../../hooks/usePatients';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import {
  User,
  Baby,
  Phone,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users,
  Filter,
  X,
  AlertTriangle,
  Loader2,
  Search,
  CalendarRange
} from 'lucide-react';

interface PatientListProps {
  onEdit?: (patient: Patient) => void;
  onViewDetails?: (patient: Patient) => void;
  onConvert?: (patient: Patient) => void;
}

// Memoized Patient Row Component
const PatientRow = memo<{
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string, patientName: string) => void;
  onViewDetails?: (patient: Patient) => void;
  onConvert?: (patient: Patient) => void;
}>(({ patient, onEdit, onDelete, onViewDetails, onConvert }) => {
  const getPatientTypeDisplay = () => {
    if (patient.patient_type === 'pregnant') {
      return {
        icon: Baby,
        label: 'Pregnant',
        className: 'bg-pink-50 text-pink-700 border border-pink-200',
        iconColor: 'text-pink-600',
        bgColor: 'bg-gradient-to-br from-pink-500 to-pink-600'
      };
    }
    return {
      icon: User,
      label: 'Regular',
      className: 'bg-blue-50 text-blue-700 border border-blue-200',
      iconColor: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600'
    };
  };

  const getStatusDisplay = () => {
    switch (patient.status) {
      case 'active':
        return {
          text: 'Active',
          className: 'bg-green-50 text-green-700 border border-green-200',
          icon: CheckCircle2,
          iconColor: 'text-green-600'
        };
      case 'inactive':
        return {
          text: 'Inactive',
          className: 'bg-gray-50 text-gray-700 border border-gray-200',
          icon: XCircle,
          iconColor: 'text-gray-600'
        };
      case 'converted':
        return {
          text: 'Converted',
          className: 'bg-purple-50 text-purple-700 border border-purple-200',
          icon: RefreshCw,
          iconColor: 'text-purple-600'
        };
      default:
        return {
          text: patient.status,
          className: 'bg-gray-50 text-gray-700 border border-gray-200',
          icon: XCircle,
          iconColor: 'text-gray-600'
        };
    }
  };

  const typeDisplay = getPatientTypeDisplay();
  const statusDisplay = getStatusDisplay();
  const TypeIcon = typeDisplay.icon;
  const StatusIcon = statusDisplay.icon;

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${typeDisplay.bgColor} flex items-center justify-center flex-shrink-0`}>
            <TypeIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {patient.name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {patient.phone}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${typeDisplay.className}`}>
          <TypeIcon className={`w-3 h-3 ${typeDisplay.iconColor}`} />
          {typeDisplay.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {patient.age} years
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${statusDisplay.className}`}>
          <StatusIcon className={`w-3 h-3 ${statusDisplay.iconColor}`} />
          {statusDisplay.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(patient.created_at)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(patient)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {patient.patient_type === 'pregnant' && patient.status === 'active' && onConvert && (
            <button
              onClick={() => onConvert(patient)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Convert to Regular"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(patient)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(patient.id, patient.name)}
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

PatientRow.displayName = 'PatientRow';

export const PatientList: React.FC<PatientListProps> = ({
  onEdit,
  onViewDetails,
  onConvert
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [patientType, setPatientType] = useState<PatientType | ''>('');
  const [patientStatus, setPatientStatus] = useState<PatientStatus | ''>('');
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [debouncedPhone, setDebouncedPhone] = useState('');
  const { confirm } = useConfirm();

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(searchName);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhone(searchPhone);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchPhone]);

  // Reset to page 1 when search terms or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedName, debouncedPhone, patientType, patientStatus, dateFrom, dateTo]);

  const { data, isPending, error, isFetching } = usePatientSearch({
    page: currentPage,
    page_size: 10,
    patient_type: patientType || undefined,
    status: patientStatus || undefined,
    name: debouncedName.length >= 2 ? debouncedName : undefined,
    phone: debouncedPhone || undefined,
    created_from: dateFrom || undefined,
    created_to: dateTo || undefined,
  });
  
  const deleteMutation = useDeletePatient();

  const handleDelete = async (patientId: string, patientName: string) => {
    const confirmed = await confirm({
      title: 'Delete Patient',
      message: `Are you sure you want to delete "${patientName}"? This action cannot be undone.`,
      confirmText: 'Delete Patient',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    deleteMutation.mutate(patientId);
  };

  const handleClearAllFilters = useCallback(() => {
    setPatientType('');
    setPatientStatus('');
    setSearchName('');
    setSearchPhone('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = patientType || patientStatus || searchName || searchPhone || dateFrom || dateTo;

  if (isPending) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading patients...</p>
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
            <h3 className="text-sm font-semibold text-red-900">Failed to load patients</h3>
            <p className="text-sm text-red-700 mt-0.5">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search and Filters - Always show */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name (min 2 chars)..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by phone number..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  placeholder="From date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              <div className="relative">
                <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  placeholder="To date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                Filters:
              </div>

              <select
                value={patientType}
                onChange={(e) => {
                  setPatientType(e.target.value as PatientType | '');
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
              >
                <option value="">All Types</option>
                <option value="pregnant">Pregnant</option>
                <option value="regular">Regular</option>
              </select>

              <select
                value={patientStatus}
                onChange={(e) => {
                  setPatientStatus(e.target.value as PatientStatus | '');
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="converted">Converted</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              )}

              {isFetching && (
                <div className="ml-auto">
                  <Loader2 className="w-5 h-5 text-black animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No patients found' : 'No patients yet'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No patients match your search criteria. Try adjusting your filters.'
                : 'Get started by adding your first patient to the system'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Search and Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="space-y-4">
          {/* Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name (min 2 chars)..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
              {searchName && searchName.length < 2 && (
                <p className="text-xs text-amber-600 mt-1">Enter at least 2 characters to search</p>
              )}
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by phone number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
              <label className="absolute left-9 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                {!dateFrom && 'Created from'}
              </label>
            </div>
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
              <label className="absolute left-9 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                {!dateTo && 'Created to'}
              </label>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filters:
            </div>

            <select
              value={patientType}
              onChange={(e) => {
                setPatientType(e.target.value as PatientType | '');
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
            >
              <option value="">All Types</option>
              <option value="pregnant">Pregnant</option>
              <option value="regular">Regular</option>
            </select>

            <select
              value={patientStatus}
              onChange={(e) => {
                setPatientStatus(e.target.value as PatientStatus | '');
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="converted">Converted</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            )}

            {isFetching && (
              <div className="ml-auto">
                <Loader2 className="w-5 h-5 text-black animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
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
            {data.items.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient as Patient}
                onEdit={onEdit!}
                onDelete={handleDelete}
                onViewDetails={onViewDetails}
                onConvert={onConvert}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page <span className="font-semibold text-gray-900">{data.page}</span> of{' '}
          <span className="font-semibold text-gray-900">{data.total_pages}</span>
          {' • '}
          <span className="font-semibold text-gray-900">{data.total_count}</span> total patients
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!data.has_previous || isFetching}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!data.has_next || isFetching}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};