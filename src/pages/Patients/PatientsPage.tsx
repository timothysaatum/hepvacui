import { useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, SlidersHorizontal, Plus, Users, UserRound, ShieldCheck } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '../../components/common/Button';
import { PageHeader, LoadingSpinner, EmptyState } from '../../components/common/index';
import type { PatientType, PatientStatus } from '../../types/patient';
import { PatientCard } from '../../components/patients/PatientCard';
import { useActiveFacility } from '../../hooks/useActiveFacility';

// ── Filter pill definitions ───────────────────────────────────────────────

const TYPE_OPTIONS: { label: string; value: PatientType | '' }[] = [
  { label: 'All types', value: '' },
  { label: 'Pregnant', value: 'pregnant' },
  { label: 'Regular', value: 'regular' },
];

const STATUS_OPTIONS: { label: string; value: PatientStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Postpartum', value: 'postpartum' },
  { label: 'Completed', value: 'completed' },
  { label: 'Converted', value: 'converted' },
  { label: 'Inactive', value: 'inactive' },
];

// ── Pill toggle ───────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap
        ${active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
        }
      `}
    >
      {label}
    </button>
  );
}

// ── Active filter chip (dismissible) ─────────────────────────────────────

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export function PatientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PatientType | ''>('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | ''>('active');
  const [deliveryMode, setDeliveryMode] = useState<'expected' | 'actual' | ''>('');
  const [deliveryFrom, setDeliveryFrom] = useState('');
  const [deliveryTo, setDeliveryTo] = useState('');
  const { activeFacilityId } = useActiveFacility();

  const hasDeliveryFilter = !!deliveryMode && (!!deliveryFrom || !!deliveryTo);

  const { data, isLoading, isFetching } = usePatients({
    facility_id: activeFacilityId || undefined,
    patient_type: typeFilter || undefined,
    patient_status: statusFilter || undefined,
    delivery_date_field: hasDeliveryFilter ? deliveryMode : undefined,
    delivery_date_from: hasDeliveryFilter ? deliveryFrom || undefined : undefined,
    delivery_date_to: hasDeliveryFilter ? deliveryTo || undefined : undefined,
    page,
    page_size: 15,
  });

  const patients = data?.items ?? [];
  const pageInfo = data?.page_info;

  const filtered = search.trim()
    ? patients.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    )
    : patients;

  const hasActiveFilters = !!(typeFilter || statusFilter || search.trim() || hasDeliveryFilter);

  const clearAll = () => {
    setTypeFilter('');
    setStatusFilter('active');
    setDeliveryMode('');
    setDeliveryFrom('');
    setDeliveryTo('');
    setSearch('');
    setPage(1);
  };

  const openRegister = (type: PatientType) => {
    navigate(`/patients/register?type=${type}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5">
      <PageHeader
        title="Patient Management"
        subtitle={pageInfo ? `${pageInfo.total_items} records · facility-scoped clinical registry` : 'Facility-scoped clinical registry'}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => openRegister('regular')}>
              <Plus className="mr-1 h-4 w-4" /> Regular
            </Button>
            <Button size="sm" onClick={() => openRegister('pregnant')}>
              <Plus className="mr-1 h-4 w-4" /> Pregnant
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Visible Records" value={String(filtered.length)} icon={Users} />
        <Metric label="Pregnant" value={String(filtered.filter(p => p.patient_type === 'pregnant').length)} icon={UserRound} />
        <Metric label="Active" value={String(filtered.filter(p => p.status === 'active').length)} icon={ShieldCheck} />
      </div>

      {/* ── Filter panel ────────────────────────────────────────────── */}
      <div className="mb-4 border border-slate-200 bg-white p-4">

        {/* Search bar — full width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or phone number…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-300
                       text-slate-800 placeholder-slate-400 outline-none
                       focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter strip */}
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">

          {/* Type toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Type
            </span>
            {TYPE_OPTIONS.map(opt => (
              <FilterPill
                key={opt.value}
                label={opt.label}
                active={typeFilter === opt.value}
                onClick={() => { setTypeFilter(opt.value as PatientType | ''); setPage(1); }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px self-stretch bg-slate-200 mx-1" />

          {/* Status toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Status
            </span>
            {STATUS_OPTIONS.map(opt => (
              <FilterPill
                key={opt.value}
                label={opt.label}
                active={statusFilter === opt.value}
                onClick={() => { setStatusFilter(opt.value as PatientStatus | ''); setPage(1); }}
              />
            ))}
          </div>

          <div className="hidden sm:block w-px self-stretch bg-slate-200 mx-1" />

          <div className="grid w-full min-w-0 gap-2 sm:w-auto sm:grid-cols-[auto_7.5rem_8.75rem_auto_8.75rem] sm:items-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider sm:justify-self-start">
              Delivery
            </span>
            <select
              value={deliveryMode}
              onChange={e => {
                const nextMode = e.target.value as 'expected' | 'actual' | '';
                setDeliveryMode(nextMode);
                if (!nextMode) {
                  setDeliveryFrom('');
                  setDeliveryTo('');
                }
                setPage(1);
              }}
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:w-[7.5rem]"
            >
              <option value="">Any</option>
              <option value="expected">Expected date</option>
              <option value="actual">Delivery date</option>
            </select>
            <input
              type="date"
              value={deliveryFrom}
              onChange={e => { setDeliveryFrom(e.target.value); setPage(1); }}
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400 sm:w-[8.75rem]"
              disabled={!deliveryMode}
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={deliveryTo}
              onChange={e => { setDeliveryTo(e.target.value); setPage(1); }}
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400 sm:w-[8.75rem]"
              disabled={!deliveryMode}
            />
          </div>
        </div>

        {/* Active filter summary row */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Filtering by:
            </span>
            {search.trim() && (
              <ActiveChip label={`"${search.trim()}"`} onRemove={() => setSearch('')} />
            )}
            {typeFilter && (
              <ActiveChip
                label={TYPE_OPTIONS.find(o => o.value === typeFilter)?.label ?? typeFilter}
                onRemove={() => { setTypeFilter(''); setPage(1); }}
              />
            )}
            {statusFilter && (
              <ActiveChip
                label={STATUS_OPTIONS.find(o => o.value === statusFilter)?.label ?? statusFilter}
                onRemove={() => { setStatusFilter(''); setPage(1); }}
              />
            )}
            {hasDeliveryFilter && (
              <ActiveChip
                label={`${deliveryMode === 'expected' ? 'Expected' : 'Delivered'} ${deliveryFrom || '...'} to ${deliveryTo || '...'}`}
                onRemove={() => { setDeliveryMode(''); setDeliveryFrom(''); setDeliveryTo(''); setPage(1); }}
              />
            )}
            <button
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1 underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !filtered.length ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title={search ? 'No patients match your search' : 'No patients registered yet'}
          description="Register the first patient to get started."
          action={<Button onClick={() => openRegister('pregnant')}>+ Register Patient</Button>}
        />
      ) : (
        <>
          <div className="overflow-x-auto border border-slate-200 bg-white">
            <div className="grid min-w-[760px] grid-cols-[minmax(220px,1.7fr)_130px_120px_minmax(130px,1fr)_36px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <span>Patient</span>
              <span>Type</span>
              <span>Status</span>
              <span>Care Context</span>
              <span />
            </div>
            {filtered.map(p => <PatientCard key={p.id} patient={p} />)}
          </div>

          {/* Pagination */}
          {pageInfo && pageInfo.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6 text-sm">
              <span className="text-slate-500">
                Page {pageInfo.current_page} of {pageInfo.total_pages} · {pageInfo.total_items} patients
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pageInfo.has_previous || isFetching}
                  onClick={() => setPage(pageInfo.previous_page ?? Math.max(1, page - 1))}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pageInfo.has_next || isFetching}
                  onClick={() => setPage(pageInfo.next_page ?? page + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: ElementType }) {
  return (
    <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      </div>
      <Icon className="h-5 w-5 text-slate-400" />
    </div>
  );
}
