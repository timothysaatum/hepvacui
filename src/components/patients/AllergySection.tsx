import { useState } from 'react';
import type { ElementType } from 'react';
import { AlertTriangle, CheckCircle2, Edit2, Plus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input, LoadingSpinner, Select, Textarea } from '../common';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAllergies, useCreateAllergy, useUpdateAllergy } from '../../hooks/useAllergies';
import type { AllergySeverity, Patient, PatientAllergy } from '../../types/patient';

const SEVERITY_OPTIONS: { value: AllergySeverity; label: string }[] = [
    { value: 'unknown', label: 'Unknown' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
    { value: 'life_threatening', label: 'Life threatening' },
];

export function AllergySection({ patient }: { patient: Patient }) {
    const { data = [], isLoading } = useAllergies(patient.id);
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<PatientAllergy | null>(null);

    const active = data.filter(a => a.is_active !== false);
    const inactive = data.filter(a => a.is_active === false);
    const highRisk = active.filter(a => a.severity === 'severe' || a.severity === 'life_threatening');

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <SafetyMetric label="Active Allergies" value={String(active.length)} icon={ShieldAlert} tone={active.length ? 'red' : 'slate'} />
                <SafetyMetric label="High Risk" value={String(highRisk.length)} icon={AlertTriangle} tone={highRisk.length ? 'amber' : 'slate'} />
                <SafetyMetric label="Inactive" value={String(inactive.length)} icon={ShieldCheck} tone="slate" />
            </div>

            <section className="border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Clinical Safety</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Structured allergies and intolerance records used during care decisions.</p>
                    </div>
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Allergy
                    </Button>
                </div>

                {!data.length ? (
                    <div className="px-5 py-12 text-center">
                        <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No allergy records</p>
                        <p className="mt-1 text-xs text-slate-400">Record allergies, intolerances, or explicitly tracked safety concerns.</p>
                        <Button size="sm" className="mt-4" onClick={() => setAddOpen(true)}>Add Allergy</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {data.map(allergy => (
                            <AllergyRow
                                key={allergy.id ?? allergy.allergen}
                                allergy={allergy}
                                onEdit={() => setEditing(allergy)}
                            />
                        ))}
                    </div>
                )}
            </section>

            <AllergyModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                patient={patient}
            />
            {editing && (
                <AllergyModal
                    open
                    onClose={() => setEditing(null)}
                    patient={patient}
                    existing={editing}
                />
            )}
        </div>
    );
}

function AllergyRow({ allergy, onEdit }: { allergy: PatientAllergy; onEdit: () => void }) {
    const active = allergy.is_active !== false;
    const severe = allergy.severity === 'severe' || allergy.severity === 'life_threatening';

    return (
        <div className={`grid gap-3 px-5 py-4 md:grid-cols-[minmax(180px,1fr)_160px_minmax(180px,1.3fr)_100px] ${active ? 'bg-white' : 'bg-slate-50 opacity-75'}`}>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    {active ? (
                        severe ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <ShieldAlert className="h-4 w-4 text-amber-500" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    )}
                    <p className="truncate text-sm font-semibold text-slate-900">{allergy.allergen}</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">{active ? 'Active safety record' : 'Inactive record'}</p>
            </div>
            <div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${severityClass(allergy.severity)}`}>
                    {formatLabel(allergy.severity ?? 'unknown')}
                </span>
            </div>
            <div className="min-w-0">
                <p className="text-sm text-slate-700">{allergy.reaction || 'Reaction not specified'}</p>
                {allergy.notes && <p className="mt-1 text-xs text-slate-400 line-clamp-2">{allergy.notes}</p>}
            </div>
            <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={onEdit}>
                    <Edit2 className="mr-1 h-3.5 w-3.5" />
                    Edit
                </Button>
            </div>
        </div>
    );
}

function AllergyModal({
    open,
    onClose,
    patient,
    existing,
}: {
    open: boolean;
    onClose: () => void;
    patient: Patient;
    existing?: PatientAllergy;
}) {
    const { showError, showSuccess } = useToast();
    const create = useCreateAllergy(patient.id, patient.patient_type);
    const update = useUpdateAllergy(patient.id, patient.patient_type);
    const [form, setForm] = useState({
        allergen: existing?.allergen ?? '',
        reaction: existing?.reaction ?? '',
        severity: (existing?.severity ?? 'unknown') as AllergySeverity,
        notes: existing?.notes ?? '',
        is_active: existing?.is_active !== false,
    });
    const busy = create.isPending || update.isPending;
    const set = (key: keyof typeof form, value: string | boolean) => setForm(f => ({ ...f, [key]: value }));

    const handleSubmit = async () => {
        if (!form.allergen.trim()) {
            showError('Allergen is required.');
            return;
        }
        const payload = {
            allergen: form.allergen.trim(),
            reaction: form.reaction.trim() || undefined,
            severity: form.severity,
            notes: form.notes.trim() || undefined,
            is_active: form.is_active,
        };
        try {
            if (existing?.id) {
                await update.mutateAsync({ id: existing.id, data: payload });
                showSuccess('Allergy updated.');
            } else {
                await create.mutateAsync(payload);
                showSuccess('Allergy recorded.');
            }
            onClose();
        } catch (error: any) {
            showError(error?.response?.data?.detail || 'Failed to save allergy.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={existing ? 'Edit Allergy' : 'Add Allergy'}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={busy}>{existing ? 'Save Changes' : 'Record Allergy'}</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Allergen" required>
                    <Input value={form.allergen} onChange={e => set('allergen', e.target.value)} placeholder="e.g. Penicillin" />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Severity">
                        <Select value={form.severity} onChange={e => set('severity', e.target.value as AllergySeverity)}>
                            {SEVERITY_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </Select>
                    </FormField>
                    <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={e => set('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        Active safety record
                    </label>
                </div>
                <FormField label="Reaction">
                    <Input value={form.reaction} onChange={e => set('reaction', e.target.value)} placeholder="e.g. Rash, anaphylaxis, nausea" />
                </FormField>
                <FormField label="Notes">
                    <Textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

function SafetyMetric({ label, value, icon: Icon, tone }: {
    label: string;
    value: string;
    icon: ElementType;
    tone: 'red' | 'amber' | 'slate';
}) {
    const colors = {
        red: 'border-red-200 bg-red-50 text-red-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        slate: 'border-slate-200 bg-white text-slate-700',
    };
    return (
        <div className={`flex items-center justify-between border px-4 py-3 ${colors[tone]}`}>
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
            <Icon className="h-5 w-5 opacity-70" />
        </div>
    );
}

function severityClass(severity?: string | null) {
    switch (severity) {
        case 'life_threatening':
        case 'severe':
            return 'bg-red-100 text-red-700';
        case 'moderate':
            return 'bg-amber-100 text-amber-700';
        case 'mild':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-slate-100 text-slate-600';
    }
}

function formatLabel(value: string) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
