import { useState } from 'react';
import type { ElementType } from 'react';
import type { Patient } from '../../types/patient';
import { SectionCard, EmptyState, LoadingSpinner } from '../common/index';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea } from '../common/index';
import { useToast } from '../../context/ToastContext';
import type { Prescription, MedicationSchedule } from '../../types/medication';
import { useCreatePrescription, useCreateSchedule, usePrescriptions, useSchedules, useUpdatePrescription, useUpdateSchedule } from '../../hooks/useMedication';
import { CalendarClock, CheckCircle2, ClipboardList, FlaskConical, Pill, Plus } from 'lucide-react';

interface Props { patient: Patient; }

export function MedicationSection({ patient }: Props) {
    // All hooks receive patientId as a direct argument — matches useMedication.ts
    const { data: prescriptions = [], isLoading: loadRx } = usePrescriptions(patient.id);
    const { data: schedules = [], isLoading: loadSch } = useSchedules(patient.id);

    const updateSchedule = useUpdateSchedule(patient.id);
    const updatePrescription = useUpdatePrescription(patient.id);
    const { showSuccess, showError } = useToast();

    const [addRxOpen, setAddRxOpen] = useState(false);
    const [addSchOpen, setAddSchOpen] = useState(false);
    const [editRx, setEditRx] = useState<Prescription | null>(null);
    const [editSch, setEditSch] = useState<MedicationSchedule | null>(null);

    if (loadRx || loadSch) return <LoadingSpinner />;

    const activePrescriptions = prescriptions.filter(rx => rx.is_active);
    const pendingSchedules = schedules.filter(s => !s.is_completed);
    const labPending = schedules.filter(s => s.lab_review_scheduled && !s.lab_review_completed);
    const overdueSchedules = pendingSchedules.filter(s => {
        const due = s.next_dose_due_date ?? s.scheduled_date;
        return due ? new Date(due) < startOfToday() : false;
    });

    const markScheduleComplete = async (id: string) => {
        try {
            await updateSchedule.mutateAsync({
                id,
                data: {
                    is_completed: true,
                    completed_date: new Date().toISOString().slice(0, 10),
                },
            });
            showSuccess('Schedule marked as completed.');
        } catch {
            showError('Update failed.');
        }
    };

    const togglePrescriptionActive = async (rx: Prescription) => {
        try {
            await updatePrescription.mutateAsync({ id: rx.id, data: { is_active: !rx.is_active } });
            showSuccess(rx.is_active ? 'Prescription deactivated.' : 'Prescription reactivated.');
        } catch {
            showError('Update failed.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
                <MedicationMetric label="Active Prescriptions" value={String(activePrescriptions.length)} icon={Pill} />
                <MedicationMetric label="Pending Schedules" value={String(pendingSchedules.length)} icon={CalendarClock} tone={pendingSchedules.length ? 'blue' : 'slate'} />
                <MedicationMetric label="Overdue" value={String(overdueSchedules.length)} icon={ClipboardList} tone={overdueSchedules.length ? 'amber' : 'slate'} />
                <MedicationMetric label="Lab Pending" value={String(labPending.length)} icon={FlaskConical} tone={labPending.length ? 'amber' : 'slate'} />
            </div>

            {/* Prescriptions */}
            <SectionCard
                title="Prescriptions"
                action={<Button size="sm" onClick={() => setAddRxOpen(true)}><Plus className="mr-1 h-4 w-4" /> Prescription</Button>}
            >
                {!prescriptions.length ? (
                    <EmptyState icon={<Pill className="h-6 w-6" />} title="No prescriptions" />
                ) : (
                    <div className="space-y-3">
                        {prescriptions.map(rx => (
                            <div
                                key={rx.id}
                                className={`border p-4 ${rx.is_active ? 'border-slate-200' : 'border-slate-100 bg-slate-50 opacity-70'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-900">{rx.medication_name}</p>
                                            <span className={`px-2 py-0.5 text-xs font-medium ${rx.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {rx.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {rx.dosage} · {rx.frequency} · {rx.duration_months} months
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            From {formatDate(rx.start_date)}{rx.end_date ? ` to ${formatDate(rx.end_date)}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setEditRx(rx)}>Edit</Button>
                                        <Button size="sm" variant="ghost" onClick={() => togglePrescriptionActive(rx)}>
                                            {rx.is_active ? 'Deactivate' : 'Reactivate'}
                                        </Button>
                                    </div>
                                </div>
                                {rx.instructions && (
                                    <p className="mt-3 border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                        {rx.instructions}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Medication Schedules */}
            <SectionCard
                title="Medication Schedules"
                subtitle="Monthly dispensing tracker"
                action={<Button size="sm" onClick={() => setAddSchOpen(true)}><Plus className="mr-1 h-4 w-4" /> Schedule</Button>}
            >
                {!schedules.length ? (
                    <EmptyState icon={<CalendarClock className="h-6 w-6" />} title="No schedules" />
                ) : (
                    <div className="space-y-3">
                        {schedules.map(sch => (
                            <div key={sch.id} className={`border p-4 ${sch.is_completed ? 'bg-slate-50 opacity-70' : overdueSchedules.some(s => s.id === sch.id) ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-900">{sch.medication_name}</p>
                                            <span className={`px-2 py-0.5 text-xs font-medium ${sch.is_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {sch.is_completed ? 'Completed' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {formatDate(sch.scheduled_date)}
                                            {sch.months_supply ? ` · ${sch.months_supply} months supply` : ''}
                                        </p>
                                        {sch.next_dose_due_date && (
                                            <p className="text-xs text-amber-600 mt-0.5">
                                                Next due: {formatDate(sch.next_dose_due_date)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {sch.lab_review_scheduled && (
                                            <span className={`px-2 py-0.5 text-xs font-medium ${sch.lab_review_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {sch.lab_review_completed ? 'Lab done' : 'Lab pending'}
                                            </span>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => setEditSch(sch)}>Edit</Button>
                                        {!sch.is_completed ? (
                                            <Button size="sm" variant="outline" onClick={() => markScheduleComplete(sch.id)}>
                                                Mark Done
                                            </Button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>
                                        )}
                                    </div>
                                </div>
                                {sch.notes && <p className="mt-3 border-l-2 border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-500">{sch.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            <AddPrescriptionModal
                open={addRxOpen}
                onClose={() => setAddRxOpen(false)}
                patientId={patient.id}
            />
            <AddScheduleModal
                open={addSchOpen}
                onClose={() => setAddSchOpen(false)}
                patientId={patient.id}
                prescriptions={prescriptions}
            />
            {editRx && (
                <EditPrescriptionModal
                    open={!!editRx}
                    onClose={() => setEditRx(null)}
                    patientId={patient.id}
                    prescription={editRx}
                />
            )}
            {editSch && (
                <EditScheduleModal
                    open={!!editSch}
                    onClose={() => setEditSch(null)}
                    patientId={patient.id}
                    schedule={editSch}
                />
            )}
        </div>
    );
}

// ── Add Prescription Modal ────────────────────────────────────────────────────

function AddPrescriptionModal({
    open, onClose, patientId,
}: {
    open: boolean; onClose: () => void; patientId: string;
}) {
    const { showError } = useToast();
    // useCreatePrescription receives patientId as hook arg — matches useMedication.ts
    const mutation = useCreatePrescription(patientId);
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({
        medication_name: '', dosage: '', frequency: '', duration_months: '6',
        prescription_date: today, start_date: today, end_date: '', instructions: '',
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.medication_name || !form.dosage || !form.frequency) {
            showError('Medication name, dosage and frequency are required.');
            return;
        }
        try {
            await mutation.mutateAsync({
                medication_name: form.medication_name,
                dosage: form.dosage,
                frequency: form.frequency,
                duration_months: Number(form.duration_months),
                prescription_date: form.prescription_date,
                start_date: form.start_date,
                end_date: form.end_date || undefined,
                instructions: form.instructions || undefined,
            });
            onClose();
        } catch {
            showError('Failed to create prescription.');
        }
    };

    return (
        <Modal
            open={open} onClose={onClose} title="Add Prescription" size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Save Prescription</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Medication Name" required>
                    <Input value={form.medication_name} onChange={e => set('medication_name', e.target.value)} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Dosage" required>
                        <Input placeholder="e.g. 300mg" value={form.dosage} onChange={e => set('dosage', e.target.value)} />
                    </FormField>
                    <FormField label="Frequency" required>
                        <Input placeholder="e.g. Once daily" value={form.frequency} onChange={e => set('frequency', e.target.value)} />
                    </FormField>
                    <FormField label="Duration (months)">
                        <Input type="number" min={1} max={24} value={form.duration_months} onChange={e => set('duration_months', e.target.value)} />
                    </FormField>
                    <FormField label="Prescription Date">
                        <Input type="date" value={form.prescription_date} onChange={e => set('prescription_date', e.target.value)} />
                    </FormField>
                    <FormField label="Start Date">
                        <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                    </FormField>
                    <FormField label="End Date">
                        <Input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                    </FormField>
                </div>
                <FormField label="Instructions">
                    <Textarea value={form.instructions} onChange={e => set('instructions', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

// ── Add Schedule Modal ────────────────────────────────────────────────────────

function AddScheduleModal({
    open, onClose, patientId, prescriptions,
}: {
    open: boolean; onClose: () => void; patientId: string; prescriptions: Prescription[];
}) {
    const { showError } = useToast();
    // useCreateSchedule receives patientId as hook arg — matches useMedication.ts
    const mutation = useCreateSchedule(patientId);
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({
        medication_name: '', scheduled_date: today, prescription_id: '',
        quantity_purchased: '', months_supply: '', notes: '',
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.medication_name) { showError('Medication name is required.'); return; }
        try {
            await mutation.mutateAsync({
                medication_name: form.medication_name,
                scheduled_date: form.scheduled_date,
                prescription_id: form.prescription_id || undefined,
                quantity_purchased: form.quantity_purchased ? Number(form.quantity_purchased) : undefined,
                months_supply: form.months_supply ? Number(form.months_supply) : undefined,
                notes: form.notes || undefined,
            });
            onClose();
        } catch {
            showError('Failed to create schedule.');
        }
    };

    return (
        <Modal
            open={open} onClose={onClose} title="Add Medication Schedule" size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Save</Button>
                </>
            }
        >
            <div className="space-y-4">
                {prescriptions.filter(rx => rx.is_active).length > 0 && (
                    <FormField label="Link to Prescription">
                        <Select
                            value={form.prescription_id}
                            onChange={e => {
                                const rx = prescriptions.find(p => p.id === e.target.value);
                                setForm(f => ({
                                    ...f,
                                    prescription_id: e.target.value,
                                    medication_name: rx?.medication_name ?? f.medication_name,
                                }));
                            }}
                        >
                            <option value="">Manual entry…</option>
                            {prescriptions
                                .filter(rx => rx.is_active)
                                .map(rx => (
                                    <option key={rx.id} value={rx.id}>{rx.medication_name}</option>
                                ))}
                        </Select>
                    </FormField>
                )}
                <FormField label="Medication Name" required>
                    <Input value={form.medication_name} onChange={e => set('medication_name', e.target.value)} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Scheduled Date">
                        <Input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
                    </FormField>
                    <FormField label="Months Supply">
                        <Input type="number" min={1} value={form.months_supply} onChange={e => set('months_supply', e.target.value)} />
                    </FormField>
                    <FormField label="Quantity">
                        <Input type="number" min={1} value={form.quantity_purchased} onChange={e => set('quantity_purchased', e.target.value)} />
                    </FormField>
                </div>
                <FormField label="Notes">
                    <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

// ── Edit Prescription Modal ───────────────────────────────────────────────────

function EditPrescriptionModal({
    open, onClose, patientId, prescription,
}: {
    open: boolean; onClose: () => void; patientId: string; prescription: Prescription;
}) {
    const { showSuccess, showError } = useToast();
    const mutation = useUpdatePrescription(patientId);
    const [form, setForm] = useState({
        medication_name: prescription.medication_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration_months: String(prescription.duration_months),
        end_date: prescription.end_date ?? '',
        instructions: prescription.instructions ?? '',
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.medication_name || !form.dosage || !form.frequency) {
            showError('Medication name, dosage and frequency are required.');
            return;
        }
        try {
            await mutation.mutateAsync({
                id: prescription.id,
                data: {
                    medication_name: form.medication_name,
                    dosage: form.dosage,
                    frequency: form.frequency,
                    duration_months: Number(form.duration_months),
                    end_date: form.end_date || undefined,
                    instructions: form.instructions || undefined,
                },
            });
            showSuccess('Prescription updated.');
            onClose();
        } catch {
            showError('Failed to update prescription.');
        }
    };

    return (
        <Modal
            open={open} onClose={onClose} title="Edit Prescription" size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Save Changes</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Medication Name" required>
                    <Input value={form.medication_name} onChange={e => set('medication_name', e.target.value)} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Dosage" required>
                        <Input placeholder="e.g. 300mg" value={form.dosage} onChange={e => set('dosage', e.target.value)} />
                    </FormField>
                    <FormField label="Frequency" required>
                        <Input placeholder="e.g. Once daily" value={form.frequency} onChange={e => set('frequency', e.target.value)} />
                    </FormField>
                    <FormField label="Duration (months)">
                        <Input type="number" min={1} max={24} value={form.duration_months} onChange={e => set('duration_months', e.target.value)} />
                    </FormField>
                    <FormField label="End Date">
                        <Input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                    </FormField>
                </div>
                <FormField label="Instructions">
                    <Textarea value={form.instructions} onChange={e => set('instructions', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

// ── Edit Schedule Modal ───────────────────────────────────────────────────────

function EditScheduleModal({
    open, onClose, patientId, schedule,
}: {
    open: boolean; onClose: () => void; patientId: string; schedule: MedicationSchedule;
}) {
    const { showSuccess, showError } = useToast();
    const mutation = useUpdateSchedule(patientId);
    const [form, setForm] = useState({
        quantity_purchased: String(schedule.quantity_purchased ?? ''),
        months_supply: String(schedule.months_supply ?? ''),
        next_dose_due_date: schedule.next_dose_due_date ?? '',
        lab_review_scheduled: schedule.lab_review_scheduled,
        lab_review_date: schedule.lab_review_date ?? '',
        lab_review_completed: schedule.lab_review_completed,
        notes: schedule.notes ?? '',
    });
    const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        try {
            await mutation.mutateAsync({
                id: schedule.id,
                data: {
                    quantity_purchased: form.quantity_purchased ? Number(form.quantity_purchased) : undefined,
                    months_supply: form.months_supply ? Number(form.months_supply) : undefined,
                    next_dose_due_date: form.next_dose_due_date || undefined,
                    lab_review_scheduled: form.lab_review_scheduled,
                    lab_review_date: form.lab_review_date || undefined,
                    lab_review_completed: form.lab_review_completed,
                    notes: form.notes || undefined,
                },
            });
            showSuccess('Schedule updated.');
            onClose();
        } catch {
            showError('Failed to update schedule.');
        }
    };

    return (
        <Modal
            open={open} onClose={onClose} title="Edit Schedule" size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Save Changes</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Quantity Purchased">
                        <Input type="number" min={1} value={form.quantity_purchased} onChange={e => set('quantity_purchased', e.target.value)} />
                    </FormField>
                    <FormField label="Months Supply">
                        <Input type="number" min={1} value={form.months_supply} onChange={e => set('months_supply', e.target.value)} />
                    </FormField>
                    <FormField label="Next Dose Due">
                        <Input type="date" value={form.next_dose_due_date} onChange={e => set('next_dose_due_date', e.target.value)} />
                    </FormField>
                    <FormField label="Lab Review Date">
                        <Input type="date" value={form.lab_review_date} onChange={e => set('lab_review_date', e.target.value)} />
                    </FormField>
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            checked={form.lab_review_scheduled}
                            onChange={e => set('lab_review_scheduled', e.target.checked)}
                        />
                        Lab review scheduled
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            checked={form.lab_review_completed}
                            onChange={e => set('lab_review_completed', e.target.checked)}
                        />
                        Lab review completed
                    </label>
                </div>
                <FormField label="Notes">
                    <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

function MedicationMetric({ label, value, icon: Icon, tone = 'slate' }: {
    label: string;
    value: string;
    icon: ElementType;
    tone?: 'slate' | 'blue' | 'amber';
}) {
    const colors = {
        slate: 'border-slate-200 bg-white text-slate-700',
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
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

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
