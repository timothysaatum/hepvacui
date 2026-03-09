import { useState } from 'react';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '../../components/common/Button';
import { PageHeader, LoadingSpinner, EmptyState } from '../../components/common/index';
import { Input, Select } from '../../components/common/index';
import type { PatientType, PatientStatus } from '../../types/patient';
import { PatientCard } from '../../components/patients/PatientCard';
import { RegisterPatientModal } from '../../components/patients/RegisterPatientModal';

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

  // Client-side name/phone search on the current page
  const filtered = search.trim()
    ? patients.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    )
    : patients;

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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Input
          placeholder="Search name or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-56"
        />
        <Select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value as PatientType | ''); setPage(1); }}
          className="w-44"
        >
          <option value="">All types</option>
          <option value="pregnant">Pregnant</option>
          <option value="regular">Regular</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as PatientStatus | ''); setPage(1); }}
          className="w-44"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="postpartum">Postpartum</option>
          <option value="completed">Completed</option>
          <option value="inactive">Inactive</option>
        </Select>
        {(typeFilter || statusFilter || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setTypeFilter(''); setStatusFilter(''); setSearch(''); setPage(1); }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !filtered.length ? (
        <EmptyState
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
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
