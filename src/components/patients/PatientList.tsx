import React, { useState, memo } from 'react';
import type { Patient, PatientType, PatientStatus } from '../../types/patient';
import { usePatients, useDeletePatient } from '../../hooks/usePatients';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

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
        icon: '🤰',
        label: 'Pregnant',
        className: 'bg-pink-100 text-pink-800',
      };
    }
    return {
      icon: '👤',
      label: 'Regular',
      className: 'bg-blue-100 text-blue-800',
    };
  };

  const getStatusDisplay = () => {
    switch (patient.status) {
      case 'active':
        return { text: 'Active', className: 'bg-green-100 text-green-800' };
      case 'inactive':
        return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
      case 'converted':
        return { text: 'Converted', className: 'bg-purple-100 text-purple-800' };
      default:
        return { text: patient.status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const typeDisplay = getPatientTypeDisplay();
  const statusDisplay = getStatusDisplay();

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold mr-3">
            {typeDisplay.icon}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
            <div className="text-xs text-gray-500">{patient.phone}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeDisplay.className}`}>
          {typeDisplay.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {patient.age} years
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.className}`}>
          {statusDisplay.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(patient.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(patient)}
              className="text-indigo-600 hover:text-indigo-900 transition-colors"
              title="View Details"
            >
              👁️
            </button>
          )}
          {patient.patient_type === 'pregnant' && patient.status === 'active' && onConvert && (
            <button
              onClick={() => onConvert(patient)}
              className="text-purple-600 hover:text-purple-900 transition-colors"
              title="Convert to Regular"
            >
              🔄
            </button>
          )}
          <button
            onClick={() => onEdit(patient)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(patient.id, patient.name)}
            className="text-red-600 hover:text-red-900 transition-colors"
          >
            Delete
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
  const { confirm } = useConfirm();

  // Use React Query hook
  const { data, isLoading, error, isFetching } = usePatients({
    page: currentPage,
    page_size: 10,
    patient_type: patientType || undefined,
    patient_status: patientStatus || undefined,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-500">Loading patients...</p>
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
          <span>Failed to load patients. Please try again.</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {patientType || patientStatus ? 'No patients found' : 'No patients yet'}
        </h3>
        <p className="text-gray-500">
          {patientType || patientStatus
            ? 'No patients match the selected filters'
            : 'Get started by adding your first patient.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow relative">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-sm font-medium text-gray-700">Filters:</div>
          
          <select
            value={patientType}
            onChange={(e) => {
              setPatientType(e.target.value as PatientType | '');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="converted">Converted</option>
          </select>

          {(patientType || patientStatus) && (
            <button
              onClick={() => {
                setPatientType('');
                setPatientStatus('');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}

          {isFetching && (
            <div className="ml-auto">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
            {data.items.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
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
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Page <span className="font-medium">{data.page_info.current_page}</span> of{' '}
          <span className="font-medium">{data.page_info.total_pages}</span>
          {' • '}
          <span className="font-medium">{data.page_info.total_items}</span> total patients
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(data.page_info.previous_page!)}
            disabled={!data.page_info.has_previous || isFetching}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(data.page_info.next_page!)}
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