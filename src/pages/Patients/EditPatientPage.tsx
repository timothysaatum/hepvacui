import { useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, MessageSquare, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { usePatient, useUpdatePregnantPatient, useUpdateRegularPatient } from '../../hooks/usePatients';
import { isPregnantPatient } from '../../types/patient';
import type { Patient, PatientStatus, PatientType, Sex, UpdatePregnantPatientPayload, UpdateRegularPatientPayload } from '../../types/patient';
import { FormField, Input, Select, LoadingSpinner } from '../../components/common/index';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

type IdentityForm = {
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
    status: PatientStatus;
};

type FormErrors = Partial<Record<keyof IdentityForm, string>>;

const today = new Date().toISOString().split('T')[0];

const PREGNANT_STATUSES: { value: PatientStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'postpartum', label: 'Postpartum' },
    { value: 'completed', label: 'Completed' },
    { value: 'converted', label: 'Converted' },
    { value: 'inactive', label: 'Inactive' },
];

const REGULAR_STATUSES: { value: PatientStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'converted', label: 'Converted' },
    { value: 'inactive', label: 'Inactive' },
];

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const isValidPhone = (value: string) => {
    const digits = digitsOnly(value);
    return digits.length >= 10 && digits.length <= 15 && !/[a-z]/i.test(value);
};

const empty = (value?: string | null) => value ?? '';

function formFromPatient(patient: Patient): IdentityForm {
    const nameParts = (patient.name ?? '').trim().split(/\s+/);
    return {
        first_name: empty(patient.first_name) || nameParts[0] || '',
        last_name: empty(patient.last_name) || nameParts.slice(1).join(' '),
        preferred_name: empty(patient.preferred_name),
        medical_record_number: empty(patient.medical_record_number),
        phone: empty(patient.phone),
        sex: patient.sex,
        date_of_birth: empty(patient.date_of_birth),
        accepts_messaging: Boolean(patient.accepts_messaging),
        address_line: empty(patient.address_line),
        city: empty(patient.city),
        district: empty(patient.district),
        region: empty(patient.region),
        country: empty(patient.country),
        emergency_contact_name: empty(patient.emergency_contact_name),
        emergency_contact_phone: empty(patient.emergency_contact_phone),
        emergency_contact_relationship: empty(patient.emergency_contact_relationship),
        status: patient.status,
    };
}

const optional = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
};

export function EditPatientPage() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientType = (searchParams.get('type') ?? 'regular') as PatientType;
    const { data: patient, isLoading, isError } = usePatient(patientId ?? null, patientType);

    if (isLoading) return <LoadingSpinner />;

    if (isError || !patient) {
        return (
            <div className="mx-auto max-w-2xl py-16 text-center">
                <p className="text-slate-500">Patient not found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/patients')}>
                    Back to Patients
                </Button>
            </div>
        );
    }

    return (
        <PatientIdentityForm
            patient={patient}
            onCancel={() => navigate(`/patients/${patient.id}?type=${patient.patient_type}`)}
            onSuccess={() => navigate(`/patients/${patient.id}?type=${patient.patient_type}`)}
        />
    );
}

function PatientIdentityForm({
    patient,
    onCancel,
    onSuccess,
}: {
    patient: Patient;
    onCancel: () => void;
    onSuccess: () => void;
}) {
    const { showError } = useToast();
    const updatePregnant = useUpdatePregnantPatient();
    const updateRegular = useUpdateRegularPatient();
    const pregnant = isPregnantPatient(patient);
    const [form, setForm] = useState<IdentityForm>(() => formFromPatient(patient));
    const [errors, setErrors] = useState<FormErrors>({});
    const isBusy = updatePregnant.isPending || updateRegular.isPending;

    const completion = useMemo(() => {
        const required = [form.first_name, form.last_name, form.phone];
        if (!pregnant) required.push(form.sex);
        return Math.round((required.filter(Boolean).length / required.length) * 100);
    }, [form.first_name, form.last_name, form.phone, form.sex, pregnant]);

    const set = <K extends keyof IdentityForm>(key: K, value: IdentityForm[K]) => {
        setForm(current => ({ ...current, [key]: value }));
        setErrors(current => ({ ...current, [key]: undefined }));
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
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const buildPayload = (): UpdatePregnantPatientPayload | UpdateRegularPatientPayload => ({
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
        status: form.status,
        accepts_messaging: form.accepts_messaging,
    });

    const handleSubmit = async () => {
        if (!validate()) {
            showError('Please fix the highlighted fields.');
            return;
        }
        try {
            if (pregnant) {
                await updatePregnant.mutateAsync({ patientId: patient.id, data: buildPayload() as UpdatePregnantPatientPayload });
            } else {
                await updateRegular.mutateAsync({ patientId: patient.id, data: buildPayload() as UpdateRegularPatientPayload });
            }
            onSuccess();
        } catch (error: any) {
            showError(error?.response?.data?.detail || 'Failed to update patient.');
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-5">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="mt-1 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Back to patient"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Edit Patient Identity</h1>
                        <p className="mt-1 text-sm text-slate-500">Update demographics, contact details, consent, and registry status.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={isBusy}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={isBusy}>
                        <Save className="mr-1 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="space-y-3">
                    <div className="border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Record Type</p>
                        <div className="mt-3 flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-3">
                            <User className="h-4 w-4 text-slate-400" />
                            <div>
                                <p className="text-sm font-semibold capitalize text-slate-900">{patient.patient_type}</p>
                                <p className="text-xs text-slate-500">Clinical care is managed in separate tabs.</p>
                            </div>
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
                    </div>
                </aside>

                <main className="space-y-4">
                    <Section icon={User} title="Identity" subtitle="Core patient demographics used across the registry.">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField label="First Name" required error={errors.first_name}>
                                <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} maxLength={100} />
                            </FormField>
                            <FormField label="Last Name" required error={errors.last_name}>
                                <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} maxLength={100} />
                            </FormField>
                            <FormField label="Preferred Name">
                                <Input value={form.preferred_name} onChange={e => set('preferred_name', e.target.value)} maxLength={100} />
                            </FormField>
                            <FormField label="Date of Birth">
                                <Input type="date" value={form.date_of_birth} max={today} onChange={e => set('date_of_birth', e.target.value)} />
                            </FormField>
                            <FormField label="Sex">
                                <Select value={form.sex} disabled={pregnant} onChange={e => set('sex', e.target.value as Sex)}>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                </Select>
                            </FormField>
                            <FormField label="Medical Record Number">
                                <Input value={form.medical_record_number} onChange={e => set('medical_record_number', e.target.value)} maxLength={64} />
                            </FormField>
                            <FormField label="Status">
                                <Select value={form.status} onChange={e => set('status', e.target.value as PatientStatus)}>
                                    {(pregnant ? PREGNANT_STATUSES : REGULAR_STATUSES).map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </Select>
                            </FormField>
                        </div>
                    </Section>

                    <Section icon={Phone} title="Contact" subtitle="Phone and consent details for follow-up communication.">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField label="Phone Number" required error={errors.phone}>
                                <Input value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={20} />
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

                    <div className="sticky bottom-0 flex items-center justify-between border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <ShieldCheck className="h-4 w-4 text-teal-600" />
                            Clinical care is managed from dedicated patient tabs.
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onCancel} disabled={isBusy}>Cancel</Button>
                            <Button onClick={handleSubmit} loading={isBusy}>Save Changes</Button>
                        </div>
                    </div>
                </main>
            </div>
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
        <section className="border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
                </div>
            </div>
            {children}
        </section>
    );
}
