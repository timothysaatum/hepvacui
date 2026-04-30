import { useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Baby,
  CheckCircle2,
  IdCard,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { FormField, Input, Select } from '../../components/common';
import { useCreatePregnantPatient, useCreateRegularPatient } from '../../hooks/usePatients';
import { useToast } from '../../context/ToastContext';
import type { PatientType } from '../../types/patient';

type Sex = 'female' | 'male';

interface RegistrationForm {
  patient_type: PatientType;
  first_name: string;
  last_name: string;
  preferred_name: string;
  medical_record_number: string;
  phone: string;
  sex: Sex;
  date_of_birth: string;
  accepts_messaging: boolean;
  address_line: string;
  city: string;
  district: string;
  region: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  identifier_type: string;
  identifier_value: string;
}

type FormErrors = Partial<Record<keyof RegistrationForm, string>>;

const today = new Date().toISOString().split('T')[0];

const initialForm = (patientType: PatientType): RegistrationForm => ({
  patient_type: patientType,
  first_name: '',
  last_name: '',
  preferred_name: '',
  medical_record_number: '',
  phone: '',
  sex: patientType === 'pregnant' ? 'female' : 'female',
  date_of_birth: '',
  accepts_messaging: false,
  address_line: '',
  city: '',
  district: '',
  region: '',
  country: 'Ghana',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  identifier_type: '',
  identifier_value: '',
});

const optional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const isValidPhone = (value: string) => {
  const digits = digitsOnly(value);
  return digits.length >= 10 && digits.length <= 15 && !/[a-z]/i.test(value);
};

export function PatientRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedType = searchParams.get('type') === 'regular' ? 'regular' : 'pregnant';
  const [form, setForm] = useState<RegistrationForm>(() => initialForm(requestedType));
  const [errors, setErrors] = useState<FormErrors>({});
  const createPregnant = useCreatePregnantPatient();
  const createRegular = useCreateRegularPatient();
  const { showError } = useToast();

  const isPregnant = form.patient_type === 'pregnant';
  const isBusy = createPregnant.isPending || createRegular.isPending;

  const completion = useMemo(() => {
    const required = [form.first_name, form.last_name, form.phone];
    if (!isPregnant) required.push(form.sex);
    const done = required.filter(Boolean).length;
    return Math.round((done / required.length) * 100);
  }, [form.first_name, form.last_name, form.phone, form.sex, isPregnant]);

  const set = <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
  };

  const setType = (patientType: PatientType) => {
    setForm(current => ({
      ...current,
      patient_type: patientType,
      sex: patientType === 'pregnant' ? 'female' : current.sex,
    }));
    setSearchParams({ type: patientType });
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!form.first_name.trim()) next.first_name = 'First name is required.';
    if (!form.last_name.trim()) next.last_name = 'Last name is required.';
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    else if (!isValidPhone(form.phone)) next.phone = 'Use 10 to 15 digits, with no letters.';
    if (form.emergency_contact_phone.trim() && !isValidPhone(form.emergency_contact_phone)) {
      next.emergency_contact_phone = 'Use 10 to 15 digits, with no letters.';
    }
    if (form.identifier_type.trim() && !form.identifier_value.trim()) {
      next.identifier_value = 'Enter the identifier value.';
    }
    if (form.identifier_value.trim() && !form.identifier_type.trim()) {
      next.identifier_type = 'Select an identifier type.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildIdentifier = () => {
    if (!form.identifier_type.trim() || !form.identifier_value.trim()) return undefined;
    return [{
      identifier_type: form.identifier_type.trim(),
      identifier_value: form.identifier_value.trim(),
      is_primary: false,
    }];
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showError('Please fix the highlighted fields.');
      return;
    }

    const common = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      preferred_name: optional(form.preferred_name),
      medical_record_number: optional(form.medical_record_number),
      phone: form.phone.trim(),
      date_of_birth: optional(form.date_of_birth),
      address_line: optional(form.address_line),
      city: optional(form.city),
      district: optional(form.district),
      region: optional(form.region),
      country: optional(form.country),
      emergency_contact_name: optional(form.emergency_contact_name),
      emergency_contact_phone: optional(form.emergency_contact_phone),
      emergency_contact_relationship: optional(form.emergency_contact_relationship),
      identifiers: buildIdentifier(),
      accepts_messaging: form.accepts_messaging,
    };

    try {
      const patient = isPregnant
        ? await createPregnant.mutateAsync({
          ...common,
          sex: 'female',
          first_pregnancy: {},
        })
        : await createRegular.mutateAsync({
          ...common,
          sex: form.sex,
        });

      navigate(`/patients/${patient.id}?type=${patient.patient_type}`);
    } catch {
      // Toasts are handled by the mutation hooks.
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="mt-1 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Back to patients"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Register Patient</h1>
            <p className="mt-1 text-sm text-slate-500">Create the identity record first, then add the relevant care context.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/patients')} disabled={isBusy}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isBusy}>
            <Save className="mr-1 h-4 w-4" />
            Register Patient
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Registration Type</p>
            <div className="mt-3 grid gap-2">
              <TypeButton
                active={isPregnant}
                icon={Baby}
                label="Pregnant"
                detail="Pregnancy care pathway"
                onClick={() => setType('pregnant')}
              />
              <TypeButton
                active={!isPregnant}
                icon={User}
                label="Regular"
                detail="Long-term patient care"
                onClick={() => setType('regular')}
              />
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-500">Required fields</span>
              <span className="font-semibold text-slate-900">{completion}%</span>
            </div>
            <div className="mt-3 h-2 bg-slate-100">
              <div className="h-full bg-teal-600 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <ChecklistItem done={!!form.first_name.trim() && !!form.last_name.trim()} label="Patient name" />
              <ChecklistItem done={isValidPhone(form.phone)} label="Valid phone" />
              <ChecklistItem done={isPregnant || !!form.sex} label="Sex recorded" />
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <Section icon={User} title="Identity" subtitle="Core patient demographics used across the registry.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="First Name" required error={errors.first_name}>
                <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="e.g. Akua" maxLength={100} />
              </FormField>
              <FormField label="Last Name" required error={errors.last_name}>
                <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="e.g. Mensah" maxLength={100} />
              </FormField>
              <FormField label="Preferred Name">
                <Input value={form.preferred_name} onChange={e => set('preferred_name', e.target.value)} placeholder="Name used in conversation" maxLength={100} />
              </FormField>
              <FormField label="Date of Birth">
                <Input type="date" value={form.date_of_birth} max={today} onChange={e => set('date_of_birth', e.target.value)} />
              </FormField>
              <FormField label="Sex" required>
                <Select value={form.sex} disabled={isPregnant} onChange={e => set('sex', e.target.value as Sex)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </Select>
              </FormField>
              <FormField label="Medical Record Number">
                <Input value={form.medical_record_number} onChange={e => set('medical_record_number', e.target.value)} placeholder="Facility MRN" maxLength={64} />
              </FormField>
            </div>
          </Section>

          <Section icon={Phone} title="Contact" subtitle="Phone and consent details for follow-up communication.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Phone Number" required error={errors.phone}>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+233501234567" maxLength={20} />
              </FormField>
              <label className="flex items-center gap-3 self-end border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.accepts_messaging}
                  onChange={e => set('accepts_messaging', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <MessageSquare className="h-4 w-4 text-slate-400" />
                Messaging consent recorded
              </label>
            </div>
          </Section>

          <Section icon={MapPin} title="Location and Emergency Contact" subtitle="Useful for facility follow-up and outreach.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Address">
                <Input value={form.address_line} onChange={e => set('address_line', e.target.value)} />
              </FormField>
              <FormField label="City/Town">
                <Input value={form.city} onChange={e => set('city', e.target.value)} />
              </FormField>
              <FormField label="District">
                <Input value={form.district} onChange={e => set('district', e.target.value)} />
              </FormField>
              <FormField label="Region">
                <Input value={form.region} onChange={e => set('region', e.target.value)} />
              </FormField>
              <FormField label="Emergency Contact">
                <Input value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} />
              </FormField>
              <FormField label="Emergency Phone" error={errors.emergency_contact_phone}>
                <Input value={form.emergency_contact_phone} onChange={e => set('emergency_contact_phone', e.target.value)} maxLength={20} />
              </FormField>
              <FormField label="Relationship">
                <Input value={form.emergency_contact_relationship} onChange={e => set('emergency_contact_relationship', e.target.value)} />
              </FormField>
              <FormField label="Country">
                <Input value={form.country} onChange={e => set('country', e.target.value)} />
              </FormField>
            </div>
          </Section>

          <Section icon={IdCard} title="Additional Identifier" subtitle="Optional identifier separate from the facility MRN.">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <FormField label="Identifier Type" error={errors.identifier_type}>
                <Select value={form.identifier_type} onChange={e => set('identifier_type', e.target.value)}>
                  <option value="">None</option>
                  <option value="national_id">National ID</option>
                  <option value="insurance">Insurance</option>
                  <option value="facility_legacy">Legacy facility ID</option>
                  <option value="program">Program ID</option>
                </Select>
              </FormField>
              <FormField label="Identifier Value" error={errors.identifier_value}>
                <Input value={form.identifier_value} onChange={e => set('identifier_value', e.target.value)} placeholder="Identifier value" />
              </FormField>
            </div>
          </Section>

          <div className="sticky bottom-0 flex items-center justify-between border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Clinical care is managed from the patient record after registration.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/patients')} disabled={isBusy}>Cancel</Button>
              <Button onClick={handleSubmit} loading={isBusy}>Register Patient</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TypeButton({
  active,
  icon: Icon,
  label,
  detail,
  onClick,
}: {
  active: boolean;
  icon: ElementType;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 border px-3 py-3 text-left transition-colors ${
        active
          ? 'border-teal-600 bg-teal-50 text-teal-900'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-slate-500">{detail}</span>
      </span>
    </button>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className={`h-4 w-4 ${done ? 'text-teal-600' : 'text-slate-300'}`} />
      <span>{label}</span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: ElementType;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
