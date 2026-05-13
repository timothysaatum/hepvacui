import { useState } from 'react';
import type { ElementType } from 'react';
import type { Patient } from '../../types/patient';
import { SectionCard, EmptyState, LoadingSpinner } from '../common/index';
import { Button } from '../common/Button';
import { ReminderStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea } from '../common/index';
import { useToast } from '../../context/ToastContext';
import { formatDate, REMINDER_TYPE_LABELS } from '../../utils/formatters';
import type { PatientReminder, ReminderType } from '../../types/reminder';
import { useCreateReminder, useRemindersPaginated, useUpdateReminder } from '../../hooks/useReminder';
import { Baby, Bell, CalendarClock, CircleDollarSign, Pill, Plus, Syringe, XCircle } from 'lucide-react';

const REMINDER_TYPES: ReminderType[] = [
    'delivery_week', 'child_6month_checkup', 'medication_due', 'payment_due', 'vaccination_due',
];

const TYPE_ICONS: Record<ReminderType, ElementType> = {
    delivery_week: Baby,
    child_6month_checkup: Baby,
    medication_due: Pill,
    payment_due: CircleDollarSign,
    vaccination_due: Syringe,
};

interface Props { patient: Patient; }

export function ReminderSection({ patient }: Props) {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { data, isLoading, isFetching } = useRemindersPaginated(patient.id, page, pageSize);
    const reminders = data?.items ?? [];
    const pageInfo = data?.page_info;
    const [addOpen, setAddOpen] = useState(false);
    const [editReminder, setEditReminder] = useState<PatientReminder | null>(null);
    const updateReminder = useUpdateReminder(patient.id);
    const { showSuccess, showError } = useToast();

    if (isLoading) return <LoadingSpinner />;

    const pending = reminders.filter(r => r.status === 'pending');
    const past = reminders.filter(r => r.status !== 'pending');
    const today = startOfToday();
    const overdue = pending.filter(r => new Date(r.scheduled_date) < today);
    const dueSoon = pending.filter(r => {
        const due = new Date(r.scheduled_date);
        const diff = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
        return diff >= 0 && diff <= 7;
    });

    const cancel = async (id: string) => {
        try {
            await updateReminder.mutateAsync({ id, data: { status: 'cancelled' } });
            showSuccess('Reminder cancelled.');
        } catch { showError('Failed to cancel.'); }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
                <ReminderMetric label="Pending" value={String(pending.length)} icon={Bell} tone={pending.length ? 'blue' : 'slate'} />
                <ReminderMetric label="Overdue" value={String(overdue.length)} icon={XCircle} tone={overdue.length ? 'red' : 'slate'} />
                <ReminderMetric label="Due 7 Days" value={String(dueSoon.length)} icon={CalendarClock} tone={dueSoon.length ? 'amber' : 'slate'} />
                <ReminderMetric label="History" value={String(past.length)} icon={Bell} />
            </div>

            <SectionCard
                title="Reminder Work Queue"
                subtitle={pageInfo ? `${pageInfo.total_items} total · page ${pageInfo.current_page} of ${Math.max(pageInfo.total_pages, 1)}` : `${pending.length} pending · ${overdue.length} overdue`}
                action={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Reminder</Button>}
            >
                {!reminders.length ? (
                    <EmptyState
                        icon={<Bell className="h-6 w-6" />}
                        title="No reminders"
                        description="Set up automated reminders for this patient."
                        action={<Button size="sm" onClick={() => setAddOpen(true)}>Add Reminder</Button>}
                    />
                ) : (
                    <div className="space-y-5">
                        {pending.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</p>
                                <div className="space-y-2">
                                    {pending.map(r => (
                                        <ReminderRow
                                            key={r.id}
                                            reminder={r}
                                            tone={overdue.some(item => item.id === r.id) ? 'red' : dueSoon.some(item => item.id === r.id) ? 'amber' : 'blue'}
                                            onEdit={() => setEditReminder(r)}
                                            onCancel={() => cancel(r.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {past.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">History</p>
                                <div className="space-y-2">
                                    {past.map(r => (
                                        <ReminderRow
                                            key={r.id}
                                            reminder={r}
                                            tone="slate"
                                            compact
                                            onEdit={() => setEditReminder(r)}
                                            onCancel={() => cancel(r.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {pageInfo && pageInfo.total_pages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                                <span className="text-slate-500">
                                    Page {pageInfo.current_page} of {pageInfo.total_pages} · {pageInfo.total_items} reminders
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pageInfo.has_previous || isFetching}
                                        onClick={() => setPage(pageInfo.previous_page ?? Math.max(1, page - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pageInfo.has_next || isFetching}
                                        onClick={() => setPage(pageInfo.next_page ?? page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>

            <AddReminderModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                patientId={patient.id}
            />

            {editReminder && (
                <EditReminderModal
                    open={!!editReminder}
                    onClose={() => setEditReminder(null)}
                    reminder={editReminder}
                    patientId={patient.id}
                />
            )}
        </div>
    );
}

function ReminderRow({
    reminder,
    tone,
    compact = false,
    onEdit,
    onCancel,
}: {
    reminder: PatientReminder;
    tone: 'red' | 'amber' | 'blue' | 'slate';
    compact?: boolean;
    onEdit: () => void;
    onCancel: () => void;
}) {
    const Icon = TYPE_ICONS[reminder.reminder_type];
    const colors = {
        red: 'border-red-200 bg-red-50',
        amber: 'border-amber-200 bg-amber-50',
        blue: 'border-blue-100 bg-blue-50',
        slate: 'border-slate-100 bg-white opacity-75',
    };

    return (
        <div className={`flex items-start justify-between border p-3 ${colors[tone]}`}>
            <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                    <p className="text-sm font-medium text-slate-900">{REMINDER_TYPE_LABELS[reminder.reminder_type]}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(reminder.scheduled_date)}</p>
                    {!compact && <p className="text-xs text-slate-600 mt-1">{reminder.message}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <ReminderStatusBadge status={reminder.status} />
                {!compact && (
                    <>
                        <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
                    </>
                )}
            </div>
        </div>
    );
}

function ReminderMetric({ label, value, icon: Icon, tone = 'slate' }: {
    label: string;
    value: string;
    icon: ElementType;
    tone?: 'slate' | 'blue' | 'amber' | 'red';
}) {
    const colors = {
        slate: 'border-slate-200 bg-white text-slate-700',
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        red: 'border-red-200 bg-red-50 text-red-700',
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

// ── Add Reminder Modal ────────────────────────────────────────────────────────

function AddReminderModal({
    open,
    onClose,
    patientId,
}: {
    open: boolean;
    onClose: () => void;
    patientId: string;
}) {
    const { showSuccess, showError } = useToast();
    const mutation = useCreateReminder(patientId);
    const [form, setForm] = useState({
        reminder_type: '' as ReminderType | '',
        scheduled_date: '',
        message: '',
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.reminder_type || !form.scheduled_date || !form.message) {
            showError('All fields are required.');
            return;
        }
        if (form.message.trim().length < 10) {
            showError('Message must be at least 10 characters.');
            return;
        }
        try {
            await mutation.mutateAsync({
                reminder_type: form.reminder_type as ReminderType,
                scheduled_date: form.scheduled_date,
                message: form.message,
            });
            showSuccess('Reminder created.');
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to create reminder.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add Reminder"
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Save Reminder</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Reminder Type" required>
                    <Select value={form.reminder_type} onChange={e => set('reminder_type', e.target.value)}>
                        <option value="">Select type…</option>
                        {REMINDER_TYPES.map(t => (
                            <option key={t} value={t}>{REMINDER_TYPE_LABELS[t]}</option>
                        ))}
                    </Select>
                </FormField>
                <FormField label="Scheduled Date" required>
                    <Input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
                </FormField>
                <FormField label="Message" required hint="Minimum 10 characters">
                    <Textarea
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="Enter reminder message…"
                    />
                </FormField>
            </div>
        </Modal>
    );
}

// ── Edit Reminder Modal ───────────────────────────────────────────────────────

function EditReminderModal({
    open,
    onClose,
    reminder,
    patientId,
}: {
    open: boolean;
    onClose: () => void;
    reminder: PatientReminder;
    patientId: string;
}) {
    const { showSuccess, showError } = useToast();
    const mutation = useUpdateReminder(patientId);
    const [form, setForm] = useState({
        scheduled_date: reminder.scheduled_date,
        message: reminder.message,
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.scheduled_date || !form.message) {
            showError('All fields are required.');
            return;
        }
        if (form.message.trim().length < 10) {
            showError('Message must be at least 10 characters.');
            return;
        }
        try {
            await mutation.mutateAsync({
                id: reminder.id,
                data: {
                    scheduled_date: form.scheduled_date,
                    message: form.message,
                },
            });
            showSuccess('Reminder updated.');
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to update reminder.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Edit Reminder"
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Save Changes</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Reminder Type">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                        {(() => {
                            const Icon = TYPE_ICONS[reminder.reminder_type];
                            return <Icon className="h-4 w-4 text-slate-400" />;
                        })()}
                        <span>{REMINDER_TYPE_LABELS[reminder.reminder_type]}</span>
                    </div>
                </FormField>
                <FormField label="Scheduled Date" required>
                    <Input
                        type="date"
                        value={form.scheduled_date}
                        onChange={e => set('scheduled_date', e.target.value)}
                    />
                </FormField>
                <FormField label="Message" required hint="Minimum 10 characters">
                    <Textarea
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="Enter reminder message…"
                    />
                </FormField>
            </div>
        </Modal>
    );
}
