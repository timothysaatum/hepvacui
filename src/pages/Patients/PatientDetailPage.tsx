import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../../hooks/usePatient';
import { PatientHeader } from '../../components/patients/PatientHeader';
import { ConvertPatientModal } from '../../components/patients/ConvertPatientModal';
import { PregnancySection } from '../../components/pregnancy/PregnancySection';
import { VaccineSection } from '../../components/vaccines/VaccineSection';
import { MedicationSection } from '../../components/medication/MedicationSection';
import { ReminderSection } from '../../components/reminder/ReminderSection';
import { DiagnosisSection } from '../../components/diagnosis/DiagnosisSection';
import { LabTestSection } from '../../components/labtests/LabTestSection';
import { AllergySection } from '../../components/patients/AllergySection';
import { LoadingSpinner } from '../../components/common/index';
import { isPregnantPatient } from '../../types/patient';
import type { PatientType } from '../../types/patient';
import {
  User, Building2,
  Baby, Syringe, Pill, Stethoscope, Bell,
  MapPin, Contact, ShieldAlert, TestTube2,
} from 'lucide-react';
import { ReRegisterPregnantModal } from '../../components/patients/ReRegisterPregnantModal';
import { getGravidaParaLabel } from '../../utils/formatters';

type Tab = 'overview' | 'pregnancy' | 'safety' | 'vaccines' | 'medication' | 'diagnosis' | 'tests' | 'reminders';

const ALL_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'pregnancy', label: 'Pregnancy', icon: Baby },
  { id: 'safety', label: 'Safety', icon: ShieldAlert },
  { id: 'vaccines', label: 'Vaccines', icon: Syringe },
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
  { id: 'tests', label: 'Tests', icon: TestTube2 },
  { id: 'reminders', label: 'Reminders', icon: Bell },
];

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const typeParam = new URLSearchParams(window.location.search).get('type') as PatientType | null;

  const { data: patient, isLoading, isError } = usePatient(patientId!, typeParam);
  const [tab, setTab] = useState<Tab>('overview');
  const [convertOpen, setConvertOpen] = useState(false);
  const [reRegisterOpen, setReRegisterOpen] = useState(false);

  if (!patientId) { navigate('/patients'); return null; }
  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-8"><LoadingSpinner /></div>;
  if (isError || !patient) return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-center">
      <p className="text-slate-400 text-sm">Patient record not found.</p>
      <button onClick={() => navigate('/patients')} className="mt-3 text-teal-600 text-sm hover:underline">
        ← Back to patients
      </button>
    </div>
  );

  const pregnant = isPregnantPatient(patient);
  const tabs = pregnant ? ALL_TABS : ALL_TABS.filter(t => t.id !== 'pregnancy');
  const canReRegisterPregnant = !pregnant && patient.sex === 'female';

  return (
    <div className="mx-auto max-w-7xl px-4 py-5">
      <PatientHeader
        patient={patient}
        onConvert={pregnant ? () => setConvertOpen(true) : undefined}
        onReRegisterPregnant={canReRegisterPregnant ? () => setReRegisterOpen(true) : undefined}
      />

      {/* Tab bar */}
      <div className="border-b border-slate-200 mb-5 mt-2 bg-white px-2">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-150
                  ${tab === t.id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {tab === 'overview' && <OverviewTab patient={patient} pregnant={pregnant} />}
      {tab === 'pregnancy' && pregnant && <PregnancySection patient={patient} />}
      {tab === 'safety' && <AllergySection patient={patient} />}
      {tab === 'vaccines' && <VaccineSection patient={patient} />}
      {tab === 'medication' && <MedicationSection patient={patient} />}
      {tab === 'diagnosis' && <DiagnosisSection patient={patient} />}
      {tab === 'tests' && <LabTestSection patient={patient} />}
      {tab === 'reminders' && <ReminderSection patient={patient} />}

      {pregnant && (
        <ConvertPatientModal
          open={convertOpen}
          onClose={() => setConvertOpen(false)}
          patient={patient}
          onSuccess={(id: string) => {
            setConvertOpen(false);
            navigate(`/patients/${id}?type=regular`);
          }}
        />
      )}

      {canReRegisterPregnant && (
        <ReRegisterPregnantModal
          open={reRegisterOpen}
          onClose={() => setReRegisterOpen(false)}
          patient={patient}
          onSuccess={(id: string) => {
            setReRegisterOpen(false);
            navigate(`/patients/${id}?type=pregnant`);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ patient, pregnant }: {
  patient: any; pregnant: boolean;
}) {
  const gravidaPara = getGravidaParaLabel(patient.gravida, patient.para);
  const gravidaValue = typeof patient.gravida === 'number' && Number.isFinite(patient.gravida) ? String(patient.gravida) : '—';
  const paraValue = typeof patient.para === 'number' && Number.isFinite(patient.para) ? String(patient.para) : '—';
  const pregnancyHistory = Array.isArray(patient.pregnancy_history) ? patient.pregnancy_history : [];
  const createdBy = patient.created_by?.name ?? patient.created_by?.full_name ?? '—';
  const updatedBy = patient.updated_by?.name ?? patient.updated_by?.full_name ?? '—';

  return (
    <div className="space-y-4">
      {/* ── Demographics ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-hidden border border-slate-200 bg-white lg:col-span-2">
          <SectionHeader title="Identity and Demographics" />
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <FieldGroup title="Identity">
              <Field label="First Name" value={patient.first_name ?? '—'} />
              <Field label="Last Name" value={patient.last_name ?? '—'} />
              <Field label="Preferred Name" value={patient.preferred_name ?? '—'} />
              <Field label="Full Name" value={patient.name} />
              <Field label="Medical Record Number" value={patient.medical_record_number ?? '—'} />
            </FieldGroup>
            <FieldGroup title="Demographics">
              <Field label="Date of Birth" value={fmtDate(patient.date_of_birth)} />
              <Field label="Age" value={patient.age ? `${patient.age} years` : '—'} />
              <Field label="Sex" value={capitalize(patient.sex)} />
              <Field label="Messaging Consent" value={patient.accepts_messaging ? 'Recorded' : 'Not recorded'} />
            </FieldGroup>
          </div>
        </div>

        <div className="overflow-hidden border border-slate-200 bg-white">
          <SectionHeader title="Registry" />
          <div className="p-5">
            <Field label="Facility" value={patient.facility?.facility_name ?? patient.facility?.name ?? '—'} icon={Building2} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="Registered" value={fmtDateTime(patient.created_at)} />
              <Field label="Updated" value={fmtDateTime(patient.updated_at)} />
              <Field label="Registered By" value={createdBy} />
              <Field label="Updated By" value={updatedBy} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-hidden border border-slate-200 bg-white lg:col-span-2">
          <SectionHeader title="Contact and Location" />
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <FieldGroup title="Contact">
              <Field label="Phone" value={patient.phone ?? '—'} />
              <Field label="Emergency Contact" value={patient.emergency_contact_name ?? '—'} icon={Contact} />
              <Field label="Emergency Phone" value={patient.emergency_contact_phone ?? '—'} />
              <Field label="Relationship" value={patient.emergency_contact_relationship ?? '—'} />
            </FieldGroup>
            <FieldGroup title="Location">
              <Field label="Address" value={patient.address_line ?? '—'} icon={MapPin} />
              <Field label="City/Town" value={patient.city ?? '—'} />
              <Field label="District" value={patient.district ?? '—'} />
              <Field label="Region" value={patient.region ?? '—'} />
              <Field label="Country" value={patient.country ?? '—'} />
            </FieldGroup>
          </div>
        </div>

        <div className="overflow-hidden border border-slate-200 bg-white">
          <SectionHeader title="Identifiers" />
          <div className="p-5">
            {patient.identifiers?.length ? (
              <div className="space-y-2">
                {patient.identifiers.map((identifier: any, index: number) => (
                  <div key={identifier.id ?? index} className="border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">{formatIdentifierType(identifier.identifier_type)}</p>
                      {identifier.is_primary && (
                        <span className="bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700">Primary</span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-slate-500">{identifier.identifier_value}</p>
                    {identifier.issuer && <p className="mt-1 text-[11px] text-slate-400">{identifier.issuer}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No additional identifiers recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Obstetric summary ──────────────────────────────────────── */}
      {pregnant && (
        <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
          <SectionHeader title="Obstetric Summary" badge={gravidaPara} />
          <div className="p-5 space-y-5">
            {/* G / P / A stat blocks */}
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <ObstetricStat value={gravidaValue} label="Gravida" sub="Total pregnancies" color="purple" />
              <ObstetricStat value={paraValue} label="Para" sub="Deliveries" color="pink" />
            </div>

            {patient.active_pregnancy ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 pt-1 border-t border-slate-100">
                <Field label="Last Menstrual Period" value={fmtDate(patient.active_pregnancy.lmp_date)} />
                <Field label="Expected Delivery Date" value={fmtDate(patient.active_pregnancy.expected_delivery_date)} />
                <Field label="Gestational Age" value={patient.active_pregnancy.gestational_age_weeks ? `${patient.active_pregnancy.gestational_age_weeks} wks` : '—'} />
                <Field label="Pregnancy Number" value={`#${patient.active_pregnancy.pregnancy_number}`} />
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic border-t border-slate-100 pt-4">No active pregnancy</p>
            )}

            {pregnancyHistory.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Completed Pregnancy Episodes</p>
                <div className="space-y-2">
                  {pregnancyHistory.map((episode: any) => (
                    <div key={episode.id} className="grid gap-3 border border-slate-200 px-3 py-3 text-sm sm:grid-cols-[120px_1fr_1fr_1fr]">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Pregnancy #{episode.pregnancy_number}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{episode.is_active ? 'Active' : 'Closed'}</p>
                      </div>
                      <Field label="Outcome" value={formatOutcome(episode.outcome)} />
                      <Field label="Delivery Date" value={fmtDate(episode.actual_delivery_date)} />
                      <Field label="Expected Delivery" value={fmtDate(episode.expected_delivery_date)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit trail */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 px-1 pb-2 text-xs text-slate-400">
        <span>Created <span className="font-medium text-slate-500">{fmtDateTime(patient.created_at)}</span></span>
        <span>Updated <span className="font-medium text-slate-500">{fmtDateTime(patient.updated_at)}</span></span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
      {badge && (
        <span className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
          {badge}
        </span>
      )}
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-5 space-y-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 font-medium mb-0.5 flex items-center gap-1">
        {Icon && <Icon className="w-2.5 h-2.5" />}
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

function ObstetricStat({ value, label, sub, color }: { value: string; label: string; sub: string; color: string }) {
  const cls: Record<string, string> = {
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    pink: 'bg-pink-50   border-pink-100   text-pink-700',
    slate: 'bg-slate-50  border-slate-200  text-slate-600',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${cls[color] ?? cls.slate}`}>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs font-bold mt-1 tracking-wide">{label}</p>
      <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}

function fmtDate(d?: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(d?: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function capitalize(s?: string): string {
  if (!s) return '—';
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatIdentifierType(value?: string | null): string {
  return capitalize(value ?? 'Identifier');
}

function formatOutcome(value?: string | null): string {
  return value ? capitalize(value) : '—';
}
