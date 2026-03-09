import { useState } from 'react';
import type { Patient } from '../../types/patient';
import { SectionCard, EmptyState, LoadingSpinner } from '../common/index';
import { Button } from '../common/Button';
import { ReminderStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea } from '../common/index';
import { useToast } from '../../context/ToastContext';
import { formatDate, REMINDER_TYPE_LABELS } from '../../utils/formatters';
import type { ReminderType } from '../../types/reminder';
import { useCreateReminder, useReminders, useUpdateReminder } from '../../hooks/useReminder';

const REMINDER_TYPES: ReminderType[] = [
    'delivery_week', 'child_6month_checkup', 'medication_due', 'payment_due', 'vaccination_due',
];

const TYPE_ICONS: Record<ReminderType, string> = {
    delivery_week: '🤰',
    child_6month_checkup: '👶',
    medication_due: '💊',
    payment_due: '💰',
    vaccination_due: '💉',
};

interface Props { patient: Patient; }

export function ReminderSection({ patient }: Props) {
    const { data: reminders = [], isLoading } = useReminders(patient.id);
    const [addOpen, setAddOpen] = useState(false);
    const updateReminder = useUpdateReminder(patient.id);
    const { showSuccess, showError } = useToast();

    if (isLoading) return <LoadingSpinner />;

    const pending = reminders.filter(r => r.status === 'pending');
    const past = reminders.filter(r => r.status !== 'pending');

    const cancel = async (id: string) => {
        try {
            await updateReminder.mutateAsync({ id, data: { status: 'cancelled' } });
            showSuccess('Reminder cancelled.');
        } catch { showError('Failed to cancel.'); }
    };

    return (
        <div className="space-y-4">
            <SectionCard
                title="Reminders"
                subtitle={`${pending.length} pending`}
                action={<Button size="sm" onClick={() => setAddOpen(true)}>+ Add Reminder</Button>}
            >
                {!reminders.length ? (
                    <EmptyState icon={<span className="text-xl">🔔</span>} title="No reminders" description="Set up automated reminders for this patient." action={<Button size="sm" onClick={() => setAddOpen(true)}>+ Add Reminder</Button>} />
                ) : (
                    <div className="space-y-5">
                        {pending.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</p>
                                <div className="space-y-2">
                                    {pending.map(r => (
                                        <div key={r.id} className="flex items-start justify-between p-3 border border-amber-100 bg-amber-50 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <span className="text-lg">{TYPE_ICONS[r.reminder_type]}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{REMINDER_TYPE_LABELS[r.reminder_type]}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(r.scheduled_date)}</p>
                                                    <p className="text-xs text-slate-600 mt-1">{r.message}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <ReminderStatusBadge status={r.status} />
                                                <Button size="sm" variant="ghost" onClick={() => cancel(r.id)}>Cancel</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {past.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">History</p>
                                <div className="space-y-2">
                                    {past.map(r => (
                                        <div key={r.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl opacity-70">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{TYPE_ICONS[r.reminder_type]}</span>
                                                <div>
                                                    <p className="text-sm text-slate-700">{REMINDER_TYPE_LABELS[r.reminder_type]}</p>
                                                    <p className="text-xs text-slate-500">{formatDate(r.scheduled_date)}</p>
                                                </div>
                                            </div>
                                            <ReminderStatusBadge status={r.status} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>

            <AddReminderModal open={addOpen} onClose={() => setAddOpen(false)} patientId={patient.id} />
        </div>
    );
}

// ── Add Reminder Modal ────────────────────────────────────────────────────────

function AddReminderModal({ open, onClose, patientId }: { open: boolean; onClose: () => void; patientId: string }) {
    const { showSuccess, showError } = useToast();
    const mutation = useCreateReminder(patientId);
    const [form, setForm] = useState({ reminder_type: '' as ReminderType | '', scheduled_date: '', message: '' });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.reminder_type || !form.scheduled_date || !form.message) {
            showError('All fields are required.'); return;
        }
        if (form.message.trim().length < 10) { showError('Message must be at least 10 characters.'); return; }
        try {
            await mutation.mutateAsync({ reminder_type: form.reminder_type as ReminderType, scheduled_date: form.scheduled_date, message: form.message });
            showSuccess('Reminder created.');
            onClose();
        } catch (e: any) { showError(e?.response?.data?.detail || 'Failed to create reminder.'); }
    };

    return (
        <Modal open={open} onClose={onClose} title="Add Reminder" size="sm"
            footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} loading={mutation.isPending}>Save Reminder</Button></>}
        >
            <div className="space-y-4">
                <FormField label="Reminder Type" required>
                    <Select value={form.reminder_type} onChange={e => set('reminder_type', e.target.value)}>
                        <option value="">Select type…</option>
                        {REMINDER_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {REMINDER_TYPE_LABELS[t]}</option>)}
                    </Select>
                </FormField>
                <FormField label="Scheduled Date" required>
                    <Input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
                </FormField>
                <FormField label="Message" required hint="Minimum 10 characters">
                    <Textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="Enter reminder message…" />
                </FormField>
            </div>
        </Modal>
    );
}
