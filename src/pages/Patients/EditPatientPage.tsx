import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientById, useUpdatePatient } from '../../hooks/usePatients';
import { isPregnantPatient, isRegularPatient } from '../../types/patient';
import type {
    PatientStatus,
    UpdatePregnantPatientPayload,
    UpdateRegularPatientPayload,
} from '../../types/patient';
import {
    PageHeader, SectionCard, FormField, Input, Select, Textarea, LoadingSpinner,
} from '../../components/common/index';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

// ── Status options ─────────────────────────────────────────────────────────────

const PREGNANT_STATUSES: { value: PatientStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'postpartum', label: 'Postpartum' },
    { value: 'completed', label: 'Completed' },
    { value: 'inactive', label: 'Inactive' },
];

const REGULAR_STATUSES: { value: PatientStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'inactive', label: 'Inactive' },
];

const TREATMENT_REGIMENS = [
    'TDF + 3TC + DTG',
    'TDF + FTC + EFV',
    'TDF + 3TC + EFV',
    'AZT + 3TC + NVP',
    'AZT + 3TC + LPV/r',
    'Other',
];

// ── Page ───────────────────────────────────────────────────────────────────────

export function EditPatientPage() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();

    // Use unified endpoint (no type required) to avoid 404 from type mismatch
    const { data: patient, isLoading, isError } = usePatientById(patientId ?? null);

    if (isLoading) return <LoadingSpinner />;

    if (isError || !patient) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <p className="text-slate-500">Patient not found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/patients')}>
                    Back to Patients
                </Button>
            </div>
        );
    }

    const backToDetail = () => navigate(`/patients/${patientId}`);

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader
                title="Edit Patient"
                subtitle={patient.name}
                action={
                    <Button variant="outline" onClick={backToDetail}>Cancel</Button>
                }
            />

            {isPregnantPatient(patient) ? (
                <PregnantPatientForm
                    patientId={patient.id}
                    defaultValues={{
                        name: patient.name,
                        phone: patient.phone,
                        date_of_birth: patient.date_of_birth ?? '',
                        status: patient.status,
                    }}
                    onSuccess={backToDetail}
                />
            ) : isRegularPatient(patient) ? (
                <RegularPatientForm
                    patientId={patient.id}
                    defaultValues={{
                        name: patient.name,
                        phone: patient.phone,
                        date_of_birth: patient.date_of_birth ?? '',
                        status: patient.status,
                        diagnosis_date: patient.diagnosis_date ?? '',
                        viral_load: patient.viral_load ?? '',
                        last_viral_load_date: patient.last_viral_load_date ?? '',
                        treatment_start_date: patient.treatment_start_date ?? '',
                        treatment_regimen: patient.treatment_regimen ?? '',
                        medical_history: patient.medical_history ?? '',
                        allergies: patient.allergies ?? '',
                        notes: patient.notes ?? '',
                    }}
                    onSuccess={backToDetail}
                />
            ) : null}
        </div>
    );
}

// ── Pregnant patient form ──────────────────────────────────────────────────────

interface PregnantFormValues {
    name: string;
    phone: string;
    date_of_birth: string;
    status: PatientStatus;
}

function PregnantPatientForm({
    patientId,
    defaultValues,
    onSuccess,
}: {
    patientId: string;
    defaultValues: PregnantFormValues;
    onSuccess: () => void;
}) {
    const { showError } = useToast();
    const mutation = useUpdatePatient();
    const [form, setForm] = useState<PregnantFormValues>(defaultValues);
    const [errors, setErrors] = useState<Partial<Record<keyof PregnantFormValues, string>>>({});
    const set = (k: keyof PregnantFormValues, v: string) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = 'Name is required.';
        if (!form.phone.trim()) e.phone = 'Phone is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const payload: UpdatePregnantPatientPayload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            date_of_birth: form.date_of_birth || undefined,
            status: form.status,
        };
        try {
            await mutation.mutateAsync({ patientId, data: payload });
            onSuccess();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to update patient.');
        }
    };

    return (
        <div className="space-y-4">
            <SectionCard title="Personal Information">
                <div className="space-y-4">
                    <FormField label="Full Name" required error={errors.name}>
                        <Input
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="Patient's full name"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Phone Number" required error={errors.phone}>
                            <Input
                                value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                                placeholder="+233 XX XXX XXXX"
                            />
                        </FormField>
                        <FormField label="Date of Birth">
                            <Input
                                type="date"
                                value={form.date_of_birth}
                                onChange={e => set('date_of_birth', e.target.value)}
                            />
                        </FormField>
                    </div>

                    <FormField label="Status">
                        <Select
                            value={form.status}
                            onChange={e => set('status', e.target.value as PatientStatus)}
                        >
                            {PREGNANT_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </Select>
                    </FormField>
                </div>
            </SectionCard>

            <div className="flex justify-end gap-3 pb-8">
                <Button variant="outline" onClick={onSuccess}>Cancel</Button>
                <Button onClick={handleSubmit} loading={mutation.isPending}>Save Changes</Button>
            </div>
        </div>
    );
}

// ── Regular patient form ───────────────────────────────────────────────────────

interface RegularFormValues {
    name: string;
    phone: string;
    date_of_birth: string;
    status: PatientStatus;
    diagnosis_date: string;
    viral_load: string;
    last_viral_load_date: string;
    treatment_start_date: string;
    treatment_regimen: string;
    medical_history: string;
    allergies: string;
    notes: string;
}

function RegularPatientForm({
    patientId,
    defaultValues,
    onSuccess,
}: {
    patientId: string;
    defaultValues: RegularFormValues;
    onSuccess: () => void;
}) {
    const { showError } = useToast();
    const mutation = useUpdatePatient();
    const [form, setForm] = useState<RegularFormValues>(defaultValues);
    const [errors, setErrors] = useState<Partial<Record<keyof RegularFormValues, string>>>({});
    const set = (k: keyof RegularFormValues, v: string) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = 'Name is required.';
        if (!form.phone.trim()) e.phone = 'Phone is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const payload: UpdateRegularPatientPayload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            date_of_birth: form.date_of_birth || undefined,
            status: form.status,
            diagnosis_date: form.diagnosis_date || undefined,
            viral_load: form.viral_load || undefined,
            last_viral_load_date: form.last_viral_load_date || undefined,
            treatment_start_date: form.treatment_start_date || undefined,
            treatment_regimen: form.treatment_regimen || undefined,
            medical_history: form.medical_history || undefined,
            allergies: form.allergies || undefined,
            notes: form.notes || undefined,
        };
        try {
            await mutation.mutateAsync({ patientId, data: payload });
            onSuccess();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to update patient.');
        }
    };

    return (
        <div className="space-y-4">
            {/* ── Personal ── */}
            <SectionCard title="Personal Information">
                <div className="space-y-4">
                    <FormField label="Full Name" required error={errors.name}>
                        <Input
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="Patient's full name"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Phone Number" required error={errors.phone}>
                            <Input
                                value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                                placeholder="+233 XX XXX XXXX"
                            />
                        </FormField>
                        <FormField label="Date of Birth">
                            <Input
                                type="date"
                                value={form.date_of_birth}
                                onChange={e => set('date_of_birth', e.target.value)}
                            />
                        </FormField>
                    </div>

                    <FormField label="Status">
                        <Select
                            value={form.status}
                            onChange={e => set('status', e.target.value as PatientStatus)}
                        >
                            {REGULAR_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </Select>
                    </FormField>
                </div>
            </SectionCard>

            {/* ── Clinical ── */}
            <SectionCard title="Clinical Information">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Diagnosis Date">
                            <Input
                                type="date"
                                value={form.diagnosis_date}
                                onChange={e => set('diagnosis_date', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Treatment Start Date">
                            <Input
                                type="date"
                                value={form.treatment_start_date}
                                onChange={e => set('treatment_start_date', e.target.value)}
                            />
                        </FormField>
                    </div>

                    <FormField label="Treatment Regimen">
                        <Select
                            value={form.treatment_regimen}
                            onChange={e => set('treatment_regimen', e.target.value)}
                        >
                            <option value="">Select regimen…</option>
                            {TREATMENT_REGIMENS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </Select>
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Viral Load" hint="e.g. Undetectable, 200 copies/mL">
                            <Input
                                value={form.viral_load}
                                onChange={e => set('viral_load', e.target.value)}
                                placeholder="copies/mL or Undetectable"
                            />
                        </FormField>
                        <FormField label="Last Viral Load Date">
                            <Input
                                type="date"
                                value={form.last_viral_load_date}
                                onChange={e => set('last_viral_load_date', e.target.value)}
                            />
                        </FormField>
                    </div>
                </div>
            </SectionCard>

            {/* ── Notes ── */}
            <SectionCard title="Medical Notes">
                <div className="space-y-4">
                    <FormField label="Medical History">
                        <Textarea
                            rows={3}
                            value={form.medical_history}
                            onChange={e => set('medical_history', e.target.value)}
                            placeholder="Relevant medical history…"
                        />
                    </FormField>
                    <FormField label="Allergies">
                        <Textarea
                            rows={2}
                            value={form.allergies}
                            onChange={e => set('allergies', e.target.value)}
                            placeholder="Known allergies…"
                        />
                    </FormField>
                    <FormField label="Notes">
                        <Textarea
                            rows={2}
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Additional notes…"
                        />
                    </FormField>
                </div>
            </SectionCard>

            <div className="flex justify-end gap-3 pb-8">
                <Button variant="outline" onClick={onSuccess}>Cancel</Button>
                <Button onClick={handleSubmit} loading={mutation.isPending}>Save Changes</Button>
            </div>
        </div>
    );
}