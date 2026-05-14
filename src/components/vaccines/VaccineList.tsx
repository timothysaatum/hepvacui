import React, { useState, memo, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Vaccine } from '../../types/vaccine';
import type { PaginatedVaccines } from '../../types/vaccine';
import type { VaccineSearchResponse } from '../../types/search';
import { useVaccines } from '../../hooks/useVaccines';
import { useVaccineSearch } from '../../hooks/useSearch';
import { useDeleteVaccine, usePublishVaccine } from '../../hooks/useVaccines';
import { useConfirm } from '../common/ConfirmDialog';
import { formatDate, formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Search, Package, Filter, X, Loader2,
  CalendarRange, ChevronLeft, ChevronRight,
  AlertTriangle, MoreVertical, Eye, Pencil, PlusCircle, Power, Trash2,
} from 'lucide-react';

interface VaccineListProps {
  onEdit?: (vaccine: Vaccine) => void;
  onViewStock?: (vaccine: Vaccine) => void;
  onAddStock?: (vaccine: Vaccine) => void;
}

// ── Action dropdown ───────────────────────────────────────────────────────────

const ActionMenu: React.FC<{
  vaccine: Vaccine;
  onEdit: (v: Vaccine) => void;
  onDelete: (id: string, name: string) => void;
  onViewStock?: (v: Vaccine) => void;
  onAddStock?: (v: Vaccine) => void;
  onTogglePublish: (id: string, current: boolean) => void;
}> = ({ vaccine, onEdit, onDelete, onViewStock, onAddStock, onTogglePublish }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const action = (fn: () => void) => { fn(); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        Actions
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden py-1">
          {onAddStock && (
            <button
              onClick={() => action(() => onAddStock(vaccine))}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
            >
              <PlusCircle className="h-4 w-4 text-emerald-600" />
              Add Stock
            </button>
          )}
          {onViewStock && (
            <button
              onClick={() => action(() => onViewStock(vaccine))}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
            >
              <Eye className="h-4 w-4 text-sky-600" />
              View Stock Info
            </button>
          )}
          <button
            onClick={() => action(() => onTogglePublish(vaccine.id, vaccine.is_published))}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <Power className={`h-4 w-4 ${vaccine.is_published ? 'text-amber-600' : 'text-teal-600'}`} />
            {vaccine.is_published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => action(() => onEdit(vaccine))}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <Pencil className="h-4 w-4 text-slate-500" />
            Edit Vaccine
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            onClick={() => action(() => onDelete(vaccine.id, vaccine.vaccine_name))}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
            Delete Vaccine
          </button>
        </div>
      )}
    </div>
  );
};

// ── Vaccine row ───────────────────────────────────────────────────────────────

function availableStock(vaccine: Vaccine) {
  return vaccine.available_quantity ?? Math.max(0, vaccine.quantity - (vaccine.reserved_quantity ?? 0));
}

function isLowStock(vaccine: Vaccine) {
  return availableStock(vaccine) < 10;
}

const VaccineCard = memo<{
  vaccine: Vaccine;
  onEdit: (v: Vaccine) => void;
  onDelete: (id: string, name: string) => void;
  onViewStock?: (v: Vaccine) => void;
  onAddStock?: (v: Vaccine) => void;
  onTogglePublish: (id: string, current: boolean) => void;
}>(({ vaccine, onEdit, onDelete, onViewStock, onAddStock, onTogglePublish }) => {
  const available = availableStock(vaccine);
  const reserved = vaccine.reserved_quantity ?? Math.max(0, vaccine.quantity - available);
  const lowStock = isLowStock(vaccine);

  return (
    <div className="grid gap-4 border-b border-slate-100 bg-white px-5 py-4 transition-colors last:border-0 hover:bg-slate-50 lg:grid-cols-[minmax(180px,1.5fr)_minmax(140px,0.9fr)_minmax(180px,1.2fr)_minmax(130px,0.8fr)_minmax(120px,0.8fr)_auto] lg:items-center">
      <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{vaccine.vaccine_name}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{vaccine.batch_number}</p>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase text-slate-400 lg:hidden">Price / Dose</p>
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(vaccine.price_per_dose)}</span>
        <span className="text-xs text-slate-400 ml-1">/ dose</span>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase text-slate-400 lg:hidden">Stock</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{formatNumber(available)} available</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${lowStock
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
            }`}>
            {lowStock ? (
              <><AlertTriangle className="w-3 h-3" /> Low</>
            ) : (
              'In Stock'
            )}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{formatNumber(vaccine.quantity)} total · {formatNumber(reserved)} reserved</p>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase text-slate-400 lg:hidden">Status</p>
        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${vaccine.is_published
            ? 'bg-teal-100 text-teal-700'
            : 'bg-slate-100 text-slate-600'
          }`}>
          {vaccine.is_published ? 'Published' : 'Draft'}
        </span>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase text-slate-400 lg:hidden">Created</p>
        <p className="text-sm text-slate-500">{formatDate(vaccine.created_at)}</p>
      </div>

      <div className="flex justify-start lg:justify-end">
        <ActionMenu
          vaccine={vaccine}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewStock={onViewStock}
          onAddStock={onAddStock}
          onTogglePublish={onTogglePublish}
        />
      </div>
    </div>
  );
});

VaccineCard.displayName = 'VaccineCard';

// ── Filter bar ────────────────────────────────────────────────────────────────

const FilterBar: React.FC<{
  searchName: string; setSearchName: (v: string) => void;
  searchBatch: string; setSearchBatch: (v: string) => void;
  publishedOnly: boolean; setPublishedOnly: (v: boolean) => void;
  lowStockOnly: boolean; setLowStockOnly: (v: boolean) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  isFetching: boolean;
}> = ({
  searchName, setSearchName, searchBatch, setSearchBatch,
  publishedOnly, setPublishedOnly, lowStockOnly, setLowStockOnly,
  dateFrom, setDateFrom, dateTo, setDateTo,
  onClear, hasActiveFilters, isFetching,
}) => (
    <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vaccine name…"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search batch number…"
            value={searchBatch}
            onChange={e => setSearchBatch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            max={dateTo || undefined}
            placeholder="Created from"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            placeholder="Created to"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <Filter className="w-3.5 h-3.5" /> Filters
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox" checked={publishedOnly}
            onChange={e => setPublishedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-700">Published only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox" checked={lowStockOnly}
            onChange={e => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-700">Low stock only</span>
        </label>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}

        {isFetching && <Loader2 className="w-4 h-4 text-teal-600 animate-spin ml-auto" />}
      </div>
    </div>
  );

const InventorySummary: React.FC<{ vaccines: Vaccine[]; totalCount: number }> = ({ vaccines, totalCount }) => {
  const published = vaccines.filter(vaccine => vaccine.is_published).length;
  const lowStock = vaccines.filter(isLowStock).length;
  const available = vaccines.reduce((sum, vaccine) => sum + availableStock(vaccine), 0);
  const reserved = vaccines.reduce((sum, vaccine) => sum + (vaccine.reserved_quantity ?? 0), 0);

  const metrics = [
    { label: 'Total vaccines', value: formatNumber(totalCount), subtext: `${formatNumber(vaccines.length)} shown on this page` },
    { label: 'Available doses', value: formatNumber(available), subtext: `${formatNumber(reserved)} reserved` },
    { label: 'Published', value: formatNumber(published), subtext: 'Available for patient purchases' },
    { label: 'Low stock', value: formatNumber(lowStock), subtext: 'Available stock below 10', danger: lowStock > 0 },
  ];

  return (
    <div className="grid gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(metric => (
        <div key={metric.label} className="border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
          <p className={`mt-1 text-xl font-bold ${metric.danger ? 'text-amber-700' : 'text-slate-900'}`}>{metric.value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{metric.subtext}</p>
        </div>
      ))}
    </div>
  );
};

// ── Main list ─────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(searchName), 500);
    return () => clearTimeout(t);
  }, [searchName]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBatch(searchBatch), 500);
    return () => clearTimeout(t);
  }, [searchBatch]);

  const hasSearchCriteria = debouncedName || debouncedBatch || publishedOnly || lowStockOnly || dateFrom || dateTo;

  const searchQuery = useVaccineSearch({
    page: currentPage, page_size: 10,
    vaccine_name: debouncedName || undefined,
    batch_number: debouncedBatch || undefined,
    is_published: publishedOnly ? true : undefined,
    low_stock: lowStockOnly ? true : undefined,
    created_from: dateFrom || undefined,
    created_to: dateTo || undefined,
  });

  const listQuery = useVaccines(currentPage, 10, false, false);
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
    publishMutation.mutate({ vaccineId, data: { is_published: !currentStatus } });
  };

  const handleClearAllFilters = useCallback(() => {
    setSearchName(''); setSearchBatch('');
    setPublishedOnly(false); setLowStockOnly(false);
    setDateFrom(''); setDateTo('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = !!(searchName || searchBatch || publishedOnly || lowStockOnly || dateFrom || dateTo);
  const updateSearchName = useCallback((value: string) => {
    setSearchName(value);
    setCurrentPage(1);
  }, []);
  const updateSearchBatch = useCallback((value: string) => {
    setSearchBatch(value);
    setCurrentPage(1);
  }, []);
  const updatePublishedOnly = useCallback((value: boolean) => {
    setPublishedOnly(value);
    setCurrentPage(1);
  }, []);
  const updateLowStockOnly = useCallback((value: boolean) => {
    setLowStockOnly(value);
    setCurrentPage(1);
  }, []);
  const updateDateFrom = useCallback((value: string) => {
    setDateFrom(value);
    setCurrentPage(1);
  }, []);
  const updateDateTo = useCallback((value: string) => {
    setDateTo(value);
    setCurrentPage(1);
  }, []);

  // Normalise pagination across both response shapes
  const items = useMemo(() => (data?.items ?? []) as Vaccine[], [data?.items]);
  const isSearchResponse = (d: VaccineSearchResponse | PaginatedVaccines | undefined): d is VaccineSearchResponse =>
    Boolean(d && 'total_count' in d && 'page' in d);
  const isPaginatedResponse = (d: VaccineSearchResponse | PaginatedVaccines | undefined): d is PaginatedVaccines =>
    Boolean(d && 'page_info' in d);

  let totalCount = 0, page = 1, totalPages = 1;
  let hasPrevious = false, hasNext = false;

  if (isSearchResponse(data)) {
    totalCount = data.total_count; page = data.page; totalPages = data.total_pages;
    hasPrevious = data.has_previous; hasNext = data.has_next;
  } else if (isPaginatedResponse(data)) {
    totalCount = data.page_info.total_items; page = data.page_info.current_page;
    totalPages = data.page_info.total_pages; hasPrevious = data.page_info.has_previous;
    hasNext = data.page_info.has_next;
  }

  if (isPending) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading vaccines…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-900">Failed to load vaccines</p>
          <p className="text-xs text-red-700 mt-0.5">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
      <FilterBar
        searchName={searchName} setSearchName={updateSearchName}
        searchBatch={searchBatch} setSearchBatch={updateSearchBatch}
        publishedOnly={publishedOnly} setPublishedOnly={updatePublishedOnly}
        lowStockOnly={lowStockOnly} setLowStockOnly={updateLowStockOnly}
        dateFrom={dateFrom} setDateFrom={updateDateFrom}
        dateTo={dateTo} setDateTo={updateDateTo}
        onClear={handleClearAllFilters}
        hasActiveFilters={hasActiveFilters}
        isFetching={isFetching}
      />
      <InventorySummary vaccines={items} totalCount={totalCount} />

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-slate-700">
            {hasActiveFilters ? 'No vaccines match your filters' : 'No vaccines yet'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {hasActiveFilters ? 'Try adjusting your search criteria.' : 'Add your first vaccine to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div>
            <div className="hidden grid-cols-[minmax(180px,1.5fr)_minmax(140px,0.9fr)_minmax(180px,1.2fr)_minmax(130px,0.8fr)_minmax(120px,0.8fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
              <span>Vaccine</span>
              <span>Price / Dose</span>
              <span>Stock</span>
              <span>Status</span>
              <span>Created</span>
              <span className="text-right">Actions</span>
            </div>
            {items.map(vaccine => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                onEdit={onEdit!}
                onDelete={handleDelete}
                onViewStock={onViewStock}
                onAddStock={onAddStock}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalPages}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="font-semibold text-slate-900">{totalCount}</span> vaccines
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, page - 1))}
                disabled={!hasPrevious || isFetching}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(page + 1)}
                disabled={!hasNext || isFetching}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
