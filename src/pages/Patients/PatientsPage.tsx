import { useMemo, useState } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Plus,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/index';
import type { PatientType, PatientStatus } from '../../types/patient';
import { PatientCard } from '../../components/patients/PatientCard';
import { RegisterPatientModal } from '../../components/patients/RegisterPatientModal';

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
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
      {label}
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-700">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function SummaryItem({
  label,
  value,
  className = '',
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`p-4 border-b border-slate-200 last:border-b-0 ${className}`}>
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

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
    ? patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(search.toLowerCase()) ||
          patient.phone.includes(search)
      )
    : patients;

  const summary = useMemo(() => {
    return {
      total: pageInfo?.total_items ?? patients.length,
      pregnant: patients.filter((patient) => patient.patient_type === 'pregnant').length,
      regular: patients.filter((patient) => patient.patient_type === 'regular').length,
      active: patients.filter((patient) => patient.status === 'active').length,
    };
  }, [pageInfo?.total_items, patients]);

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
    <div className="max-w-7xl mx-auto px-5 py-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">
            {pageInfo ? `${pageInfo.total_items} total patients` : 'Patient records'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 lg:w-[520px]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button onClick={() => openRegister('pregnant')} className="gap-2">
            <Plus className="w-4 h-4" />
            New Patient
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Type
          </span>
          {TYPE_OPTIONS.map((option) => (
            <FilterPill
              key={option.label}
              label={option.label}
              active={typeFilter === option.value}
              onClick={() => {
                setTypeFilter(option.value);
                setPage(1);
              }}
            />
          ))}
        </div>

        <div className="hidden sm:block w-px self-stretch bg-slate-200 mx-1" />

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Status
          </span>
          {STATUS_OPTIONS.map((option) => (
            <FilterPill
              key={option.label}
              label={option.label}
              active={statusFilter === option.value}
              onClick={() => {
                setStatusFilter(option.value);
                setPage(1);
              }}
            />
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Filtering by:
          </span>

          {search.trim() && <ActiveChip label={`"${search.trim()}"`} onRemove={() => setSearch('')} />}

          {typeFilter && (
            <ActiveChip
              label={TYPE_OPTIONS.find((option) => option.value === typeFilter)?.label ?? typeFilter}
              onRemove={() => {
                setTypeFilter('');
                setPage(1);
              }}
            />
          )}

          {statusFilter && (
            <ActiveChip
              label={STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? statusFilter}
              onRemove={() => {
                setStatusFilter('');
                setPage(1);
              }}
            />
          )}

          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-red-500 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">Patient</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-1">Age</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {isLoading ? (
            <div className="p-16">
              <LoadingSpinner />
            </div>
          ) : !filtered.length ? (
            <div className="p-12">
              <EmptyState
                icon={<Users className="w-6 h-6" />}
                title={search ? 'No patients match your search' : 'No patients registered yet'}
                description="Register the first patient to get started."
                action={<Button onClick={() => openRegister('pregnant')}>+ Register Patient</Button>}
              />
            </div>
          ) : (
            <>
              <div>
                {filtered.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 text-sm">
                <span className="text-slate-500">
                  Showing {filtered.length} of {pageInfo?.total_items ?? filtered.length} patients
                </span>

                {pageInfo && pageInfo.total_pages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!pageInfo.has_previous || isFetching}
                      onClick={() => setPage((value) => value - 1)}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:bg-slate-50 flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="w-9 h-9 rounded-lg bg-teal-600 text-white font-semibold flex items-center justify-center">
                      {pageInfo.current_page}
                    </span>

                    <button
                      disabled={!pageInfo.has_next || isFetching}
                      onClick={() => setPage((value) => value + 1)}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:bg-slate-50 flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isFetching && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
            </>
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="bg-white border border-teal-100 rounded-2xl overflow-hidden shadow-sm sticky top-6">
            <div className="px-4 py-4">
              <h3 className="text-sm font-bold text-slate-800">Quick Summary</h3>
            </div>
            <SummaryItem label="Total Patients" value={summary.total} />
            <SummaryItem label="Pregnant" value={summary.pregnant} className="bg-purple-50/60 [&_p:last-child]:text-purple-700" />
            <SummaryItem label="Regular" value={summary.regular} className="bg-blue-50/60 [&_p:last-child]:text-blue-700" />
            <SummaryItem label="Active" value={summary.active} className="bg-emerald-50/60 [&_p:last-child]:text-emerald-700" />
          </div>
        </aside>
      </div>

      <RegisterPatientModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        defaultType={registerType}
      />
    </div>
  );
}