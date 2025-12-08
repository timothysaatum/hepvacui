import React, { useState, memo, useEffect, useCallback } from 'react';
import type { Vaccine } from '../../types/vaccine';
import { useVaccines } from '../../hooks/useVaccines';
import { useVaccineSearch } from '../../hooks/useSearch';
import { useDeleteVaccine, usePublishVaccine } from '../../hooks/useVaccines';
import { useConfirm } from '../common/ConfirmDialog';
import {
  formatDate,
  formatCurrency,
  formatNumber
} from '../../utils/formatters';
import {
  Pill,
  DollarSign,
  Package,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Filter,
  X,
  Search,
  Loader2,
  CalendarRange
} from 'lucide-react';

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
  const isLowStock = vaccine.quantity < 50;

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {vaccine.vaccine_name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Package className="w-3 h-3" />
              {vaccine.batch_number}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
          <DollarSign className="w-4 h-4 text-gray-400" />
          {formatCurrency(vaccine.price_per_dose)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {formatNumber(vaccine.quantity)}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md ${isLowStock
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
            {isLowStock ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                Low Stock
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" />
                In Stock
              </>
            )}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${vaccine.is_published
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
          {vaccine.is_published ? (
            <>
              <Eye className="w-3 h-3" />
              Published
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              Draft
            </>
          )}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(vaccine.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          {onAddStock && (
            <button
              onClick={() => onAddStock(vaccine)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Add Stock"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {onViewStock && (
            <button
              onClick={() => onViewStock(vaccine)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Stock Info"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onTogglePublish(vaccine.id, vaccine.is_published)}
            className={`p-2 rounded-lg transition-colors ${vaccine.is_published
              ? 'text-orange-600 hover:bg-orange-50'
              : 'text-blue-600 hover:bg-blue-50'
              }`}
            title={vaccine.is_published ? 'Unpublish' : 'Publish'}
          >
            {vaccine.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(vaccine)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(vaccine.id, vaccine.vaccine_name)}
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

VaccineRow.displayName = 'VaccineRow';

export const VaccineList: React.FC<VaccineListProps> = ({ onEdit, onViewStock, onAddStock }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [searchBatch, setSearchBatch] = useState('');
  const [publishedOnly, setPublishedOnly] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [debouncedBatch, setDebouncedBatch] = useState('');
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
      setDebouncedBatch(searchBatch);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchBatch]);

  // Reset to page 1 when search terms or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedName, debouncedBatch, publishedOnly, lowStockOnly, dateFrom, dateTo]);

  // Check if we have any active search/filter criteria
  const hasSearchCriteria = debouncedName || debouncedBatch || publishedOnly || lowStockOnly || dateFrom || dateTo;

  // Use search API only when there are search criteria, otherwise use regular vaccines list
  const searchQuery = useVaccineSearch({
    page: currentPage,
    page_size: 10,
    vaccine_name: debouncedName || undefined,
    batch_number: debouncedBatch || undefined,
    is_published: publishedOnly ? true : undefined,
    low_stock: lowStockOnly ? true : undefined,
    created_from: dateFrom || undefined,
    created_to: dateTo || undefined,
  });

  const listQuery = useVaccines(currentPage, 10, false, false);

  // Use search results if searching, otherwise use list results
  const { data, isPending, error, isFetching } = hasSearchCriteria ? searchQuery : listQuery;

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

  const handleClearAllFilters = useCallback(() => {
    setSearchName('');
    setSearchBatch('');
    setPublishedOnly(false);
    setLowStockOnly(false);
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchName || searchBatch || publishedOnly || lowStockOnly || dateFrom || dateTo;

  if (isPending) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading vaccines...</p>
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
            <h3 className="text-sm font-semibold text-red-900">Failed to load vaccines</h3>
            <p className="text-sm text-red-700 mt-0.5">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle both search response and regular list response structures
  const items = data?.items || [];

  // Type guard and response handling
  const isSearchResponse = (data: any): data is { items: any[], total_count: number, page: number } => {
    return data && 'total_count' in data && 'page' in data;
  };

  const isPaginatedResponse = (data: any): data is { items: any[], page_info: any } => {
    return data && 'page_info' in data;
  };

  let totalCount: number;
  let page: number;
  let totalPages: number;
  let hasPrevious: boolean;
  let hasNext: boolean;

  if (isSearchResponse(data)) {
    // Search API response
    totalCount = data.total_count;
    page = data.page;
    totalPages = data.total_pages;
    hasPrevious = data.has_previous;
    hasNext = data.has_next;
  } else if (isPaginatedResponse(data)) {
    // Regular list API response
    totalCount = data.page_info.total_items;
    page = data.page_info.current_page;
    totalPages = data.page_info.total_pages;
    hasPrevious = data.page_info.has_previous;
    hasNext = data.page_info.has_next;
  } else {
    // Fallback
    totalCount = 0;
    page = 1;
    totalPages = 1;
    hasPrevious = false;
    hasNext = false;
  }

  if (!data || items.length === 0) {
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
                  placeholder="Search by vaccine name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by batch number..."
                  value={searchBatch}
                  onChange={(e) => setSearchBatch(e.target.value)}
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

            {/* Filter Checkboxes */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                Filters:
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishedOnly}
                  onChange={(e) => {
                    setPublishedOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700">Published Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => {
                    setLowStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700">Low Stock Only</span>
              </label>

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
              <Pill className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No vaccines found' : 'No vaccines yet'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No vaccines match your search criteria. Try adjusting your filters.'
                : 'Get started by adding your first vaccine to the inventory'}
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
                placeholder="Search by vaccine name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch number..."
                value={searchBatch}
                onChange={(e) => setSearchBatch(e.target.value)}
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

          {/* Filter Checkboxes */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filters:
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publishedOnly}
                onChange={(e) => {
                  setPublishedOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
              />
              <span className="text-sm text-gray-700">Published Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => {
                  setLowStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
              />
              <span className="text-sm text-gray-700">Low Stock Only</span>
            </label>

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
                Vaccine Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price/Dose
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Stock Level
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
            {items.map((vaccine) => (
              <VaccineRow
                key={vaccine.id}
                vaccine={vaccine as Vaccine}
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
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalPages}</span>
          {' • '}
          <span className="font-semibold text-gray-900">{totalCount}</span> total vaccines
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPrevious || isFetching}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNext || isFetching}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};