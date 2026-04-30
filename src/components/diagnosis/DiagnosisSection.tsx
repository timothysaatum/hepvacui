import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { ClipboardList, Edit2, FileText, Plus, Stethoscope, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { FormField, Textarea } from '../common';
import { useToast } from '../../context/ToastContext';
import { useDiagnoses, useCreateDiagnosis, useUpdateDiagnosis, useDeleteDiagnosis } from '../../hooks/useDiagnosis';
import type { Patient } from '../../types/patient';
import type { Diagnosis } from '../../services/diagnosisService';

function formatDate(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function DiagnosisSection({ patient }: { patient: Patient }) {
    const { data: diagnosesRaw, isLoading } = useDiagnoses(patient.id);
    const diagnoses: Diagnosis[] = Array.isArray(diagnosesRaw)
        ? diagnosesRaw
        : (diagnosesRaw as any)?.items ?? [];

    const [addOpen, setAddOpen] = useState(false);
    const confirmed = diagnoses.filter(d => d.actual_diagnosis);
    const pending = diagnoses.filter(d => !d.actual_diagnosis);
    const latest = diagnoses[0];

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Total Records" value={String(diagnoses.length)} icon={ClipboardList} />
                <Metric label="Confirmed" value={String(confirmed.length)} icon={Stethoscope} tone="emerald" />
                <Metric label="Pending Confirmation" value={String(pending.length)} icon={FileText} tone={pending.length ? 'amber' : 'slate'} />
            </div>

            <section className="border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Diagnosis Timeline</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {latest ? `Latest entry recorded ${formatDate(latest.diagnosed_on)}` : 'No diagnosis records yet'}
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Record Diagnosis
                    </Button>
                </div>

                {isLoading ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-400">Loading diagnoses...</div>
                ) : diagnoses.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <Stethoscope className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No diagnoses recorded</p>
                        <p className="mt-1 text-xs text-slate-400">Start with history, working diagnosis, or confirmed diagnosis.</p>
                        <Button size="sm" className="mt-4" onClick={() => setAddOpen(true)}>Record Diagnosis</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {diagnoses.map((diagnosis, index) => (
                            <DiagnosisRow
                                key={diagnosis.id}
                                diagnosis={diagnosis}
                                patientId={patient.id}
                                latest={index === 0}
                            />
                        ))}
                    </div>
                )}
            </section>

            <DiagnosisModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                patientId={patient.id}
            />
        </div>
    );
}

function DiagnosisRow({
    diagnosis,
    patientId,
    latest,
}: {
    diagnosis: Diagnosis;
    patientId: string;
    latest: boolean;
}) {
    const [editOpen, setEditOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { showSuccess, showError } = useToast();
    const deleteMutation = useDeleteDiagnosis(patientId);
    const status = diagnosis.actual_diagnosis ? 'Confirmed' : 'Working';

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(diagnosis.id);
            showSuccess('Diagnosis removed.');
            setConfirmDelete(false);
        } catch {
            showError('Failed to delete diagnosis.');
        }
    };

    return (
        <>
            <div className="grid gap-4 px-5 py-4 lg:grid-cols-[180px_minmax(0,1fr)_150px]">
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${diagnosis.actual_diagnosis ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <p className="text-sm font-semibold text-slate-900">{status}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(diagnosis.diagnosed_on)}</p>
                    {latest && <span className="mt-2 inline-flex bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Latest</span>}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <TextBlock label="History" value={diagnosis.history} />
                    <TextBlock label="Preliminary" value={diagnosis.preliminary_diagnosis} tone="amber" />
                    <TextBlock label="Confirmed" value={diagnosis.actual_diagnosis} tone="emerald" />
                </div>

                <div className="flex items-start justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                        <Edit2 className="mr-1 h-3.5 w-3.5" />
                        Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <DiagnosisModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                patientId={patientId}
                existing={diagnosis}
            />
            <Modal
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Delete Diagnosis"
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
                    </>
                }
            >
                <p className="text-sm text-slate-600">This diagnosis will be removed from the active patient timeline.</p>
            </Modal>
        </>
    );
}

function DiagnosisModal({
    open,
    onClose,
    patientId,
    existing,
}: {
    open: boolean;
    onClose: () => void;
    patientId: string;
    existing?: Diagnosis;
}) {
    const { showSuccess, showError } = useToast();
    const createMutation = useCreateDiagnosis(patientId);
    const updateMutation = useUpdateDiagnosis(patientId);
    const isEdit = !!existing;
    const [form, setForm] = useState({
        history: existing?.history ?? '',
        preliminary_diagnosis: existing?.preliminary_diagnosis ?? '',
        actual_diagnosis: existing?.actual_diagnosis ?? '',
    });
    const busy = createMutation.isPending || updateMutation.isPending;
    const hasContent = useMemo(
        () => Object.values(form).some(value => value.trim()),
        [form]
    );
    const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!hasContent) {
            showError('Add at least one diagnosis field.');
            return;
        }
        const payload = {
            history: form.history.trim() || undefined,
            preliminary_diagnosis: form.preliminary_diagnosis.trim() || undefined,
            actual_diagnosis: form.actual_diagnosis.trim() || undefined,
        };
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ id: existing!.id, data: payload });
                showSuccess('Diagnosis updated.');
            } else {
                await createMutation.mutateAsync(payload);
                showSuccess('Diagnosis recorded.');
            }
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to save diagnosis.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Diagnosis' : 'Record Diagnosis'}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={busy}>{isEdit ? 'Save Changes' : 'Record Diagnosis'}</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Medical History">
                    <Textarea rows={3} value={form.history} onChange={e => set('history', e.target.value)} />
                </FormField>
                <FormField label="Preliminary Diagnosis">
                    <Textarea rows={2} value={form.preliminary_diagnosis} onChange={e => set('preliminary_diagnosis', e.target.value)} />
                </FormField>
                <FormField label="Confirmed Diagnosis">
                    <Textarea rows={2} value={form.actual_diagnosis} onChange={e => set('actual_diagnosis', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

function Metric({ label, value, icon: Icon, tone = 'slate' }: {
    label: string;
    value: string;
    icon: ElementType;
    tone?: 'slate' | 'emerald' | 'amber';
}) {
    const colors = {
        slate: 'border-slate-200 bg-white text-slate-700',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
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

function TextBlock({ label, value, tone = 'slate' }: {
    label: string;
    value?: string | null;
    tone?: 'slate' | 'amber' | 'emerald';
}) {
    const colors = {
        slate: 'text-slate-500',
        amber: 'text-amber-600',
        emerald: 'text-emerald-600',
    };
    return (
        <div className="min-w-0">
            <p className={`text-[11px] font-semibold uppercase tracking-wide ${colors[tone]}`}>{label}</p>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-slate-800">{value || '—'}</p>
        </div>
    );
}
