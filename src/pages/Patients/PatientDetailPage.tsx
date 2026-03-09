import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePatient } from '../../hooks/usePatient';
import { MedicationSection } from '../../components/medication/MedicationSection';
import { ReminderSection } from '../../components/reminder/ReminderSection';
import { LoadingSpinner } from '../../components/common/index';
import { isPregnantPatient } from '../../types/patient';
import type { PatientType } from '../../types/patient';
import { PatientHeader } from '../../components/patients/PatientHeader';
import { PregnancySection } from '../../components/pregnancy/PregnancySection';
import { VaccineSection } from '../../components/vaccines/VaccineSection';
import { ConvertPatientModal } from '../../components/patients/ConvertPatientModal';

type Tab = 'overview' | 'pregnancy' | 'vaccines' | 'medication' | 'reminders';

const ALL_TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'pregnancy', label: 'Pregnancy & Children', icon: '🤰' },
  { id: 'vaccines', label: 'Vaccines & Payments', icon: '💉' },
  { id: 'medication', label: 'Medication', icon: '💊' },
  { id: 'reminders', label: 'Reminders', icon: '🔔' },
];

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // We need the type to fetch the right endpoint.
  // Try to get it from the query cache (set when list page was visited).
  const cached = qc.getQueryData<any>(['patients']);
  const cachedPatient = cached?.items?.find((p: any) => p.id === patientId);
  const type: PatientType = cachedPatient?.patient_type ?? 'pregnant';

  const { data: patient, isLoading, isError } = usePatient(patientId!, type);
  const [tab, setTab] = useState<Tab>('overview');
  const [convertOpen, setConvertOpen] = useState(false);

  if (!patientId) { navigate('/patients'); return null; }
  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-6"><LoadingSpinner /></div>;
  if (isError || !patient) return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-center">
      <p className="text-slate-500">Patient not found.</p>
      <button onClick={() => navigate('/patients')} className="mt-2 text-teal-600 underline text-sm">Back to patients</button>
    </div>
  );

  const pregnant = isPregnantPatient(patient);

  // Filter tabs: hide Pregnancy tab for regular patients
  const tabs = pregnant ? ALL_TABS : ALL_TABS.filter(t => t.id !== 'pregnancy');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PatientHeader
        patient={patient}
        onConvert={pregnant ? () => setConvertOpen(true) : undefined}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id
                ? 'bg-white shadow text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab patient={patient} onTabChange={setTab} />}
      {tab === 'pregnancy' && pregnant && <PregnancySection patient={patient} />}
      {tab === 'vaccines' && <VaccineSection patient={patient} />}
      {tab === 'medication' && <MedicationSection patient={patient} />}
      {tab === 'reminders' && <ReminderSection patient={patient} />}

      {pregnant && (
        <ConvertPatientModal
          open={convertOpen}
          onClose={() => setConvertOpen(false)}
          patient={patient}
        />
      )}
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ patient, onTabChange }: { patient: any; onTabChange: (t: Tab) => void }) {
  const pregnant = isPregnantPatient(patient);

  const quickActions: { label: string; icon: string; tab: Tab; color: string }[] = [
    ...(pregnant ? [{ label: 'Manage Pregnancy', icon: '🤰', tab: 'pregnancy' as Tab, color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' }] : []),
    { label: 'Vaccines & Payments', icon: '💉', tab: 'vaccines', color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100' },
    { label: 'Prescriptions', icon: '💊', tab: 'medication', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
    { label: 'Reminders', icon: '🔔', tab: 'reminders', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(a => (
          <button
            key={a.tab}
            onClick={() => onTabChange(a.tab)}
            className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-colors ${a.color}`}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-center">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Patient details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Patient Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
          <DetailItem label="Full Name" value={patient.name} />
          <DetailItem label="Phone" value={patient.phone} />
          <DetailItem label="Sex" value={patient.sex} />
          <DetailItem label="Date of Birth" value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
          <DetailItem label="Age" value={patient.age ? `${patient.age} years` : '—'} />
          <DetailItem label="Facility" value={patient.facility?.name ?? '—'} />
          {pregnant && (
            <>
              <DetailItem label="Gravida" value={String(patient.gravida)} />
              <DetailItem label="Para" value={String(patient.para)} />
            </>
          )}
          {!pregnant && (
            <>
              <DetailItem label="Diagnosis Date" value={patient.diagnosis_date ? new Date(patient.diagnosis_date).toLocaleDateString('en-GH') : '—'} />
              <DetailItem label="Treatment Regimen" value={patient.treatment_regimen ?? '—'} />
              <DetailItem label="Viral Load" value={patient.viral_load ?? '—'} />
            </>
          )}
        </div>
        {!pregnant && patient.allergies && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-red-700">
            ⚠️ Allergies: {patient.allergies}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}
