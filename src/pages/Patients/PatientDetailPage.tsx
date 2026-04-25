import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Activity,
  AlertTriangle,
  FileText,
  ChevronRight,
  Baby,
  Syringe,
  Pill,
  Stethoscope,
  Bell,
  Edit3,
  MoreHorizontal,
} from 'lucide-react';
import { usePatientById } from '../../hooks/usePatient';
import { ConvertPatientModal } from '../../components/patients/ConvertPatientModal';
import { PregnancySection } from '../../components/pregnancy/PregnancySection';
import { VaccineSection } from '../../components/vaccines/VaccineSection';
import { MedicationSection } from '../../components/medication/MedicationSection';
import { ReminderSection } from '../../components/reminder/ReminderSection';
import { DiagnosisSection } from '../../components/diagnosis/DiagnosisSection';
import { LoadingSpinner } from '../../components/common/index';
import { isPregnantPatient, type Patient, type PregnantPatient } from '../../types/patient';
import { ReRegisterPregnantModal } from '../../components/patients/ReRegisterPregnantModal';
import { getInitials } from '../../utils/formatters';

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

  const { data: patient, isLoading, isError } = usePatientById(patientId ?? null);
  const [tab, setTab] = useState<Tab>('overview');
  const [convertOpen, setConvertOpen] = useState(false);
  const [reRegisterOpen, setReRegisterOpen] = useState(false);

  if (!patientId) {
    navigate('/patients');
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-16 text-center">
        <p className="text-slate-500 text-sm">Patient record not found.</p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-3 text-teal-600 text-sm hover:underline"
        >
          ← Back to patients
        </button>
      </div>
    );
  }

  const pregnant = isPregnantPatient(patient);
  const tabs = pregnant ? ALL_TABS : ALL_TABS.filter((item) => item.id !== 'pregnancy');

  return (
    <div className="max-w-7xl mx-auto px-5 py-6">
      <button
        onClick={() => navigate('/patients')}
        className="mb-5 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      <DetailHeader
        patient={patient}
        pregnant={pregnant}
        onEdit={() => navigate(`/patients/${patient.id}/edit`)}
      />

      <div className="mt-5 border-b border-slate-200">
        <nav className="flex -mb-px overflow-x-auto gap-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-5">
        {tab === 'overview' && (
          <OverviewTab
            patient={patient}
            pregnant={pregnant}
            onTabChange={setTab}
            onConvert={pregnant ? () => setConvertOpen(true) : undefined}
            onReRegister={!pregnant ? () => setReRegisterOpen(true) : undefined}
          />
        )}

        {tab === 'pregnancy' && pregnant && <PregnancySection patient={patient} />}
        {tab === 'vaccines' && <VaccineSection patient={patient} />}
        {tab === 'medication' && <MedicationSection patient={patient} />}
        {tab === 'diagnosis' && <DiagnosisSection patient={patient} />}
        {tab === 'reminders' && <ReminderSection patient={patient} />}
      </div>

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

function DetailHeader({
  patient,
  pregnant,
  onEdit,
}: {
  patient: Patient;
  pregnant: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${
              pregnant ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {getInitials(patient.name)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 truncate">{patient.name}</h1>
              <TypeBadge pregnant={pregnant} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {patient.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {patient.age ? `${patient.age} yrs` : '—'}
                {patient.date_of_birth ? ` (DOB: ${fmtDate(patient.date_of_birth)})` : ''}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {capitalize(patient.sex)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {fmtDate(patient.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:pl-6 lg:border-l border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">Status</p>
            <StatusBadge status={patient.status} />
          </div>

          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Patient
          </button>

          <button className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  patient,
  pregnant,
  onTabChange,
  onConvert,
  onReRegister,
}: {
  patient: Patient;
  pregnant: boolean;
  onTabChange: (tab: Tab) => void;
  onConvert?: () => void;
  onReRegister?: () => void;
}) {
  const activePregnancy = pregnant ? (patient as PregnantPatient).active_pregnancy : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
      <div className="space-y-5">
        <InfoCard title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            <Field label="Full Name" value={patient.name} />
            <Field label="Patient Type" value={capitalize(patient.patient_type)} />
            <Field label="Phone Number" value={patient.phone} />
            <Field label="Status" value={<StatusBadge status={patient.status} />} />
            <Field label="Date of Birth" value={fmtDate(patient.date_of_birth)} />
            <Field label="Registered On" value={fmtDate(patient.created_at)} />
            <Field label="Age" value={patient.age ? `${patient.age} yrs` : '—'} />
            <Field
              label="Facility"
              value={patient.facility?.name ?? (patient as any).facility?.facility_name ?? '—'}
            />
            <Field label="Sex" value={capitalize(patient.sex)} />
            <Field
              label="Registered By"
              value={patient.created_by?.name ?? (patient.created_by as any)?.full_name ?? '—'}
            />
          </div>
        </InfoCard>

        {!pregnant && (
          <InfoCard title="Clinical Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <Field label="Diagnosis Date" value={fmtDate((patient as any).diagnosis_date)} />
              <Field label="Treatment Start" value={fmtDate((patient as any).treatment_start_date)} />
              <Field label="Treatment Regimen" value={(patient as any).treatment_regimen ?? '—'} />
              <Field label="Viral Load" value={(patient as any).viral_load ?? '—'} />
              <Field label="Last Viral Load Date" value={fmtDate((patient as any).last_viral_load_date)} />
            </div>

            {(patient as any).allergies && (
              <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-0.5">Allergies</p>
                  <p className="text-sm text-red-800">{(patient as any).allergies}</p>
                </div>
              </div>
            )}

            {(patient as any).medical_history && (
              <TextBlock title="Medical History" icon={FileText} value={(patient as any).medical_history} />
            )}

            {(patient as any).notes && (
              <TextBlock title="Notes" icon={Activity} value={(patient as any).notes} />
            )}
          </InfoCard>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400 px-1 pb-2">
          {patient.created_by && (
            <span>
              Registered by{' '}
              <span className="text-slate-500 font-medium">
                {patient.created_by.name ?? (patient.created_by as any).full_name}
              </span>
            </span>
          )}
          {patient.updated_by && (
            <span>
              Last updated by{' '}
              <span className="text-slate-500 font-medium">
                {patient.updated_by.name ?? (patient.updated_by as any).full_name}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {pregnant && (
          <>
            <InfoCard title="Pregnancy Information">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <Field label="Gravida" value={String((patient as PregnantPatient).gravida)} compact />
                  <Field label="Para" value={String((patient as PregnantPatient).para)} compact />
                  <Field
                    label="Estimated Due Date (EDD)"
                    value={fmtDate(activePregnancy?.expected_delivery_date)}
                    compact
                  />
                  <Field
                    label="Current Gestational Age"
                    value={
                      activePregnancy?.gestational_age_weeks
                        ? `${activePregnancy.gestational_age_weeks} weeks`
                        : '—'
                    }
                    compact
                  />
                </div>
                <div className="w-20 h-20 rounded-2xl bg-purple-50 text-purple-300 flex items-center justify-center">
                  <Baby className="w-10 h-10" />
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Active Pregnancy">
              {activePregnancy ? (
                <div className="space-y-3">
                  <Field label="Pregnancy Number" value={`#${activePregnancy.pregnancy_number}`} compact />
                  <Field label="LMP Date" value={fmtDate(activePregnancy.lmp_date)} compact />
                  <Field label="EDD" value={fmtDate(activePregnancy.expected_delivery_date)} compact />
                  <Field label="Status" value={<StatusBadge status="ongoing" />} compact />
                </div>
              ) : (
                <p className="text-sm text-slate-500">No active pregnancy.</p>
              )}
            </InfoCard>
          </>
        )}

        <InfoCard title="Summary Card">
          <div className="space-y-2">
            <Shortcut icon={Syringe} label="Vaccines" meta="Doses and payments" onClick={() => onTabChange('vaccines')} />
            <Shortcut icon={Pill} label="Medication" meta="Prescriptions" onClick={() => onTabChange('medication')} />
            <Shortcut icon={Stethoscope} label="Diagnosis" meta="Clinical records" onClick={() => onTabChange('diagnosis')} />
            <Shortcut icon={Bell} label="Reminders" meta="Patient alerts" onClick={() => onTabChange('reminders')} />

            {pregnant && (
              <Shortcut icon={Baby} label="Pregnancy" meta="Pregnancy record" onClick={() => onTabChange('pregnancy')} />
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            {pregnant ? (
              <button
                onClick={onConvert}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                Convert to Regular
              </button>
            ) : (
              <button
                onClick={onReRegister}
                className="w-full px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors"
              >
                Re-register as Pregnant
              </button>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'grid grid-cols-2 gap-4 items-center' : ''}>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value ?? '—'}</div>
    </div>
  );
}

function TextBlock({
  title,
  icon: Icon,
  value,
}: {
  title: string;
  icon: React.ElementType;
  value: string;
}) {
  return (
    <div className="mt-5 pt-4 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {title}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function Shortcut({
  icon: Icon,
  label,
  meta,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-400">{meta}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </button>
  );
}

function TypeBadge({ pregnant }: { pregnant: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        pregnant ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
      }`}
    >
      {pregnant ? 'Pregnant' : 'Regular'}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = status ?? 'unknown';

  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-600',
    postpartum: 'bg-purple-100 text-purple-700',
    completed: 'bg-blue-100 text-blue-700',
    converted: 'bg-amber-100 text-amber-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        styles[normalized] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {capitalize(normalized)}
    </span>
  );
}

function fmtDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function capitalize(value?: string | null) {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}