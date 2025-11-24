import React, { useState, memo } from 'react';
import type { Vaccine } from '../../types/vaccine';
import { useVaccines, useDeleteVaccine, usePublishVaccine } from '../../hooks/useVaccines';
import { useConfirm } from '../common/ConfirmDialog';
import { 
  formatDate, 
  formatCurrency, 
  formatNumber, 
  getStockStatusBadge, 
  getPublishedStatusBadge 
} from '../../utils/formatters';

interface VaccineListProps {
  onEdit?: (vaccine: Vaccine) => void;
  onViewStock?: (vaccine: Vaccine) => void;
  onAddStock?: (vaccine: Vaccine) => void;
}

// Memoized Vaccine Row Component
const VaccineRow = memo<{
  vaccine: Vaccine;
  onEdit: (vaccine: Vaccine) => void;
  onDelete: (vaccineId: string, vaccineName: string) => void;
  onViewStock?: (vaccine: Vaccine) => void;
  onAddStock?: (vaccine: Vaccine) => void;
  onTogglePublish: (vaccineId: string, currentStatus: boolean) => void;
}>(({ vaccine, onEdit, onDelete, onViewStock, onAddStock, onTogglePublish }) => {
  const stockBadge = getStockStatusBadge(vaccine.quantity, vaccine.quantity < 50);
  const publishedBadge = getPublishedStatusBadge(vaccine.is_published);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold mr-3">
            💉
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{vaccine.vaccine_name}</div>
            <div className="text-xs text-gray-500">Batch: {vaccine.batch_number}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(vaccine.price_per_dose)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 font-medium">{formatNumber(vaccine.quantity)}</span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${stockBadge.className}`}>
            {stockBadge.text}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${publishedBadge.className}`}>
          {publishedBadge.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(vaccine.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          {onAddStock && (
            <button
              onClick={() => onAddStock(vaccine)}
              className="text-green-600 hover:text-green-900 transition-colors"
              title="Add Stock"
            >
              ➕
            </button>
          )}
          {onViewStock && (
            <button
              onClick={() => onViewStock(vaccine)}
              className="text-indigo-600 hover:text-indigo-900 transition-colors"
              title="View Stock Info"
            >
              📊
            </button>
          )}
          <button
            onClick={() => onTogglePublish(vaccine.id, vaccine.is_published)}
            className={`${
              vaccine.is_published 
                ? 'text-orange-600 hover:text-orange-900' 
                : 'text-blue-600 hover:text-blue-900'
            } transition-colors`}
            title={vaccine.is_published ? 'Unpublish' : 'Publish'}
          >
            {vaccine.is_published ? '👁️' : '✓'}
          </button>
          <button
            onClick={() => onEdit(vaccine)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(vaccine.id, vaccine.vaccine_name)}
            className="text-red-600 hover:text-red-900 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
});

VaccineRow.displayName = 'VaccineRow';

export const VaccineList: React.FC<VaccineListProps> = ({ onEdit, onViewStock, onAddStock }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [publishedOnly, setPublishedOnly] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { confirm } = useConfirm();

  // Use React Query hook
  const { data, isLoading, error, isFetching } = useVaccines(
    currentPage,
    10,
    publishedOnly,
    lowStockOnly
  );
  const deleteMutation = useDeleteVaccine();
  const publishMutation = usePublishVaccine();

  const handleDelete = async (vaccineId: string, vaccineName: string) => {
    const confirmed = await confirm({
      title: 'Delete Vaccine',
      message: `Are you sure you want to delete "${vaccineName}"? This action cannot be undone.`,
      confirmText: 'Delete Vaccine',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    deleteMutation.mutate(vaccineId);
  };

  const handleTogglePublish = async (vaccineId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unpublish' : 'publish';
    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Vaccine`,
      message: `Are you sure you want to ${action} this vaccine?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel',
      type: currentStatus ? 'warning' : 'info',
    });

    if (!confirmed) return;

    publishMutation.mutate({
      vaccineId,
      data: { is_published: !currentStatus },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-500">Loading vaccines...</p>
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
          <span>Failed to load vaccines. Please try again.</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">💉</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {publishedOnly || lowStockOnly ? 'No vaccines found' : 'No vaccines yet'}
        </h3>
        <p className="text-gray-500">
          {publishedOnly
            ? 'No published vaccines available'
            : lowStockOnly
            ? 'No low stock vaccines found'
            : 'Get started by adding your first vaccine.'}
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
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={publishedOnly}
              onChange={(e) => {
                setPublishedOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Published Only</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Low Stock Only</span>
          </label>

          {(publishedOnly || lowStockOnly) && (
            <button
              onClick={() => {
                setPublishedOnly(false);
                setLowStockOnly(false);
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
                Vaccine Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price/Dose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
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
            {data.items.map((vaccine) => (
              <VaccineRow
                key={vaccine.id}
                vaccine={vaccine}
                onEdit={onEdit!}
                onDelete={handleDelete}
                onViewStock={onViewStock}
                onAddStock={onAddStock}
                onTogglePublish={handleTogglePublish}
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
          <span className="font-medium">{data.page_info.total_items}</span> total vaccines
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