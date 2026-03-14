import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '../../components/common/Button';
import { PageHeader, LoadingSpinner, EmptyState } from '../../components/common/index';
import type { PatientType, PatientStatus } from '../../types/patient';
import { PatientCard } from '../../components/patients/PatientCard';
import { RegisterPatientModal } from '../../components/patients/RegisterPatientModal';

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PatientType | ''>('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | ''>('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerType, setRegisterType] = useState<PatientType>('pregnant');

  const { data, isLoading, isFetching } = usePatients({
    patient_type: typeFilter || undefined,
    patient_status: statusFilter || undefined,
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

  const hasActiveFilters = !!(typeFilter || statusFilter || search.trim());

  const clearAll = () => {
    setTypeFilter('');
    setStatusFilter('');
    setSearch('');
    setPage(1);
  };

  const openRegister = (type: PatientType) => {
    setRegisterType(type);
    setRegisterOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        title="Patients"
        subtitle={pageInfo ? `${pageInfo.total_items} total patients` : ''}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => openRegister('regular')}>
              + Regular
            </Button>
            <Button size="sm" onClick={() => openRegister('pregnant')}>
              + Pregnant
            </Button>
          </div>
        }
      />

      {/* ── Filter panel ────────────────────────────────────────────── */}
      <div className="mb-5 space-y-3">

        {/* Search bar — full width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or phone number…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
                       text-slate-800 placeholder-slate-400 outline-none
                       focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
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
        <div className="flex items-start gap-4 flex-wrap">

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
          <div className="space-y-2">
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
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pageInfo.has_next || isFetching}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <RegisterPatientModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        defaultType={registerType}
      />
    </div>
  );
}