import { useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { FormField, Textarea } from '../common/index';
import { useToast } from '../../context/ToastContext';
import { useDiagnoses, useCreateDiagnosis, useUpdateDiagnosis, useDeleteDiagnosis } from '../../hooks/useDiagnosis';
import type { Patient } from '../../types/patient';
import type { Diagnosis } from '../../services/diagnosisService';

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleDateString('en-GH', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────

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
    const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
    const busy = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = async () => {
        const payload = {
            history: form.history || undefined,
            preliminary_diagnosis: form.preliminary_diagnosis || undefined,
            actual_diagnosis: form.actual_diagnosis || undefined,
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
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={busy}>
                        {isEdit ? 'Save Changes' : 'Record Diagnosis'}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Medical History">
                    <Textarea
                        rows={3}
                        placeholder="Relevant medical history, symptoms, presenting complaint…"
                        value={form.history}
                        onChange={e => set('history', e.target.value)}
                    />
                </FormField>
                <FormField label="Preliminary Diagnosis">
                    <Textarea
                        rows={2}
                        placeholder="Working / initial diagnosis…"
                        value={form.preliminary_diagnosis}
                        onChange={e => set('preliminary_diagnosis', e.target.value)}
                    />
                </FormField>
                <FormField label="Confirmed Diagnosis">
                    <Textarea
                        rows={2}
                        placeholder="Final confirmed diagnosis (may be filled in later)…"
                        value={form.actual_diagnosis}
                        onChange={e => set('actual_diagnosis', e.target.value)}
                    />
                </FormField>
            </div>
        </Modal>
    );
}

// ── Diagnosis Card ────────────────────────────────────────────────────────────

function DiagnosisCard({
    diagnosis,
    patientId,
}: {
    diagnosis: Diagnosis;
    patientId: string;
}) {
    const { showSuccess, showError } = useToast();
    const deleteMutation = useDeleteDiagnosis(patientId);
    const [editOpen, setEditOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

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
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-slate-400">
                            Recorded {formatDateTime(diagnosis.diagnosed_on)}
                            {diagnosis.diagnosed_by && (
                                <span className="ml-1">by <span className="text-slate-600 font-medium">{diagnosis.diagnosed_by.name}</span></span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setEditOpen(true)}
                            className="text-xs text-teal-600 hover:text-teal-800 font-medium px-2 py-1 rounded hover:bg-teal-50 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                    {diagnosis.history && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Medical History</p>
                            <p className="text-sm text-slate-800 whitespace-pre-wrap">{diagnosis.history}</p>
                        </div>
                    )}
                    {diagnosis.preliminary_diagnosis && (
                        <div>
                            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Preliminary Diagnosis</p>
                            <p className="text-sm text-slate-800 whitespace-pre-wrap">{diagnosis.preliminary_diagnosis}</p>
                        </div>
                    )}
                    {diagnosis.actual_diagnosis ? (
                        <div>
                            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Confirmed Diagnosis</p>
                            <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{diagnosis.actual_diagnosis}</p>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-amber-700">⏳ Awaiting confirmed diagnosis</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit modal */}
            <DiagnosisModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                patientId={patientId}
                existing={diagnosis}
            />

            {/* Delete confirm */}
            <Modal
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Delete Diagnosis"
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                        <Button
                            onClick={handleDelete}
                            loading={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-slate-600">
                    Are you sure you want to remove this diagnosis record? This action cannot be undone.
                </p>
            </Modal>
        </>
    );
}

// ── Main Section ──────────────────────────────────────────────────────────────

export function DiagnosisSection({ patient }: { patient: Patient }) {
    const { data: diagnosesRaw, isLoading } = useDiagnoses(patient.id);

    // The API may return a plain array or a paginated object { items: [], page_info: {} }.
    // Normalise here so the rest of the component always works with a plain array.
    const diagnoses: Diagnosis[] = Array.isArray(diagnosesRaw)
        ? diagnosesRaw
        : (diagnosesRaw as any)?.items ?? [];

    const [addOpen, setAddOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900">Diagnoses</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {diagnoses.length} record{diagnoses.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                    + Record Diagnosis
                </Button>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
            ) : diagnoses.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-12 text-center">
                    <p className="text-2xl mb-2">🩺</p>
                    <p className="text-sm font-medium text-slate-600">No diagnoses recorded</p>
                    <p className="text-xs text-slate-400 mt-1">Record the first diagnosis for this patient.</p>
                    <button
                        onClick={() => setAddOpen(true)}
                        className="mt-4 text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                        Record Diagnosis →
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {diagnoses.map(d => (
                        <DiagnosisCard key={d.id} diagnosis={d} patientId={patient.id} />
                    ))}
                </div>
            )}

            <DiagnosisModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                patientId={patient.id}
            />
        </div>
    );
}