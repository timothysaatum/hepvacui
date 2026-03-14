import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePatient } from '../../hooks/usePatient';
import { PatientHeader } from '../../components/patients/PatientHeader';
import { ConvertPatientModal } from '../../components/patients/ConvertPatientModal';
import { PregnancySection } from '../../components/pregnancy/PregnancySection';
import { VaccineSection } from '../../components/vaccines/VaccineSection';
import { MedicationSection } from '../../components/medication/MedicationSection';
import { ReminderSection } from '../../components/reminder/ReminderSection';
import { DiagnosisSection } from '../../components/diagnosis/DiagnosisSection';
import { LoadingSpinner } from '../../components/common/index';
import { isPregnantPatient } from '../../types/patient';
import type { PatientType } from '../../types/patient';
import {
  User, Phone, Calendar, Building2, Activity,
  AlertTriangle, FileText, ChevronRight,
  Baby, Syringe, Pill, Stethoscope, Bell,
} from 'lucide-react';
import { ReRegisterPregnantModal } from '../../components/patients/ReRegisterPregnantModal';

type Tab = 'overview' | 'pregnancy' | 'vaccines' | 'medication' | 'diagnosis' | 'reminders';

const ALL_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'pregnancy', label: 'Pregnancy', icon: Baby },
  { id: 'vaccines', label: 'Vaccines', icon: Syringe },
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
  { id: 'reminders', label: 'Reminders', icon: Bell },
];

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // FIX: The old code used qc.getQueryData(['patients']) which always returns
  // undefined — the real list keys are ['patients', 'list', filters].
  // getQueriesData with the prefix searches across all cached list queries.
  const typeParam = new URLSearchParams(window.location.search).get('type') as PatientType | null;
  const type: PatientType = (() => {
    const entries = qc.getQueriesData<any>({ queryKey: ['patients', 'list'] });
    for (const [, data] of entries) {
      const found = data?.items?.find((p: any) => p.id === patientId);
      if (found?.patient_type) return found.patient_type as PatientType;
    }
    return typeParam ?? 'pregnant';
  })();

  const { data: patient, isLoading, isError } = usePatient(patientId!, type);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <PatientHeader
        patient={patient}
        onConvert={pregnant ? () => setConvertOpen(true) : undefined}
        onReRegisterPregnant={!pregnant ? () => setReRegisterOpen(true) : undefined}
      />

      {/* Tab bar */}
      <div className="border-b border-slate-200 mb-6 mt-2">
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

      {tab === 'overview' && <OverviewTab patient={patient} onTabChange={setTab} pregnant={pregnant} />}
      {tab === 'pregnancy' && pregnant && <PregnancySection patient={patient} />}
      {tab === 'vaccines' && <VaccineSection patient={patient} />}
      {tab === 'medication' && <MedicationSection patient={patient} />}
      {tab === 'diagnosis' && <DiagnosisSection patient={patient} />}
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

      {!pregnant && (
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

function OverviewTab({ patient, onTabChange, pregnant }: {
  patient: any; onTabChange: (t: Tab) => void; pregnant: boolean;
}) {
  return (
    <div className="space-y-4">

      {/* ── Identity card ──────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Colour accent bar */}
        <div className={`h-1 w-full ${pregnant
          ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-rose-300'
          : 'bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-300'}`}
        />

        <div className="p-5 sm:p-6">
          <div className="flex gap-4 items-start">

            {/* Avatar initials */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
              text-xl font-bold shadow-sm
              ${pregnant ? 'bg-purple-100 text-purple-600' : 'bg-teal-100 text-teal-600'}`}>
              {patient.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name + badges */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{patient.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                      ${pregnant ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                      {pregnant ? '🤰 Pregnant' : '👤 Regular'}
                    </span>
                    <StatusBadge status={patient.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Record ID</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 max-w-[160px] truncate">{patient.id}</p>
                </div>
              </div>

              {/* Quick-stats strip */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatChip icon={Phone} label="Phone" value={patient.phone ?? '—'} />
                <StatChip icon={Calendar} label="DOB" value={fmtDate(patient.date_of_birth)} />
                <StatChip icon={User} label="Sex" value={capitalize(patient.sex)} />
                <StatChip icon={Building2} label="Facility" value={patient.facility?.facility_name ?? patient.facility?.name ?? '—'} />
              </div>
            </div>
          </div>
        </div>

        {/* Section shortcuts — bottom row */}
        <div className={`border-t border-slate-100 grid divide-x divide-slate-100
          ${pregnant ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {pregnant && (
            <NavCell icon={Baby} label="Pregnancy" meta={patient.active_pregnancy ? `G${patient.gravida} P${patient.para} · Active` : `G${patient.gravida} P${patient.para}`} accent="purple" onClick={() => onTabChange('pregnancy')} />
          )}
          <NavCell icon={Syringe} label="Vaccines" meta="Doses & payments" accent="teal" onClick={() => onTabChange('vaccines')} />
          <NavCell icon={Pill} label="Medication" meta="Prescriptions" accent="blue" onClick={() => onTabChange('medication')} />
          <NavCell icon={Stethoscope} label="Diagnosis" meta="Clinical records" accent="rose" onClick={() => onTabChange('diagnosis')} />
          <NavCell icon={Bell} label="Reminders" meta="Pending alerts" accent="amber" onClick={() => onTabChange('reminders')} />
        </div>
      </div>

      {/* ── Demographics ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <SectionHeader title="Demographics" />
        <div className="divide-y divide-slate-100 sm:divide-y-0 sm:grid sm:grid-cols-3 sm:divide-x">
          <FieldGroup title="Personal">
            <Field label="Full Name" value={patient.name} />
            <Field label="Date of Birth" value={fmtDate(patient.date_of_birth)} />
            <Field label="Age" value={patient.age ? `${patient.age} years` : '—'} />
            <Field label="Sex" value={capitalize(patient.sex)} />
          </FieldGroup>
          <FieldGroup title="Contact">
            <Field label="Phone" value={patient.phone ?? '—'} />
          </FieldGroup>
          <FieldGroup title="Clinical Registration">
            <Field label="Facility" value={patient.facility?.facility_name ?? patient.facility?.name ?? '—'} />
            <Field label="Patient Type" value={capitalize(patient.patient_type)} />
            <Field label="Status" value={capitalize(patient.status)} />
          </FieldGroup>
        </div>
      </div>

      {/* ── Obstetric summary ──────────────────────────────────────── */}
      {pregnant && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader title="Obstetric Summary" badge={`G${patient.gravida} · P${patient.para}`} />
          <div className="p-5 space-y-5">
            {/* G / P / A stat blocks */}
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <ObstetricStat value={String(patient.gravida)} label="Gravida" sub="Total pregnancies" color="purple" />
              <ObstetricStat value={String(patient.para)} label="Para" sub="Deliveries" color="pink" />
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
          </div>
        </div>
      )}

      {/* ── Clinical details (regular) ─────────────────────────────── */}
      {!pregnant && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader title="Clinical Details" />
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Diagnosis Date" value={fmtDate(patient.diagnosis_date)} />
              <Field label="Treatment Start" value={fmtDate(patient.treatment_start_date)} />
              <Field label="Treatment Regimen" value={patient.treatment_regimen ?? '—'} />
              <Field label="Viral Load" value={patient.viral_load ?? '—'} />
              <Field label="Last VL Date" value={fmtDate(patient.last_viral_load_date)} />
            </div>

            {patient.allergies && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-0.5">Allergies</p>
                  <p className="text-sm text-red-800">{patient.allergies}</p>
                </div>
              </div>
            )}

            {patient.medical_history && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Medical History
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{patient.medical_history}</p>
              </div>
            )}

            {patient.notes && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Notes
                </p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{patient.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit trail */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400 px-1 pb-2">
        {patient.created_by && (
          <span>Registered by <span className="text-slate-500 font-medium">{patient.created_by.name ?? patient.created_by.full_name}</span></span>
        )}
        {patient.updated_by && (
          <span>Last updated by <span className="text-slate-500 font-medium">{patient.updated_by.name ?? patient.updated_by.full_name}</span></span>
        )}
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

function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 leading-none">{label}</p>
        <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{value}</p>
      </div>
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

const NAV_ACCENT: Record<string, string> = {
  purple: 'hover:bg-purple-50 hover:text-purple-800 [&_svg.icon]:group-hover:text-purple-500',
  teal: 'hover:bg-teal-50   hover:text-teal-800   [&_svg.icon]:group-hover:text-teal-500',
  blue: 'hover:bg-blue-50   hover:text-blue-800   [&_svg.icon]:group-hover:text-blue-500',
  rose: 'hover:bg-rose-50   hover:text-rose-800   [&_svg.icon]:group-hover:text-rose-500',
  amber: 'hover:bg-amber-50  hover:text-amber-800  [&_svg.icon]:group-hover:text-amber-500',
};

function NavCell({ icon: Icon, label, meta, accent, onClick }: {
  icon: React.ElementType; label: string; meta: string; accent: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3.5 w-full text-left transition-all text-slate-600 ${NAV_ACCENT[accent] ?? ''}`}
    >
      <Icon className="icon w-4 h-4 text-slate-400 shrink-0 transition-colors" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold leading-none">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{meta}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors" />
    </button>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    postpartum: 'bg-blue-100    text-blue-700',
    completed: 'bg-slate-100   text-slate-600',
    inactive: 'bg-red-100     text-red-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status ?? ''] ?? 'bg-slate-100 text-slate-500'}`}>
      {capitalize(status ?? 'unknown')}
    </span>
  );
}

function fmtDate(d?: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function capitalize(s?: string): string {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
}