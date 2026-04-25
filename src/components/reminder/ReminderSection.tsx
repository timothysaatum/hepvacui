import { useState } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [upcomingOnly, setUpcomingOnly] = useState(false);

    const { data: paginatedData, isLoading } = useRemindersPaginated(
        patient.id,
        page,
        pageSize,
        statusFilter,
        upcomingOnly
    );

    const [addOpen, setAddOpen] = useState(false);
    const [editReminder, setEditReminder] = useState<PatientReminder | null>(null);
    const updateReminder = useUpdateReminder(patient.id);
    const { showSuccess, showError } = useToast();

    if (isLoading) return <LoadingSpinner />;

    const reminders = paginatedData?.items || [];
    const pageInfo = paginatedData?.page_info;
    const pending = reminders.filter(r => r.status === 'pending');

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
                subtitle={`${pageInfo?.total_items || 0} total • ${pending.length} pending`}
                action={<Button size="sm" onClick={() => setAddOpen(true)}>+ Add Reminder</Button>}
            >
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                    <Select
                        value={statusFilter || ''}
                        onChange={e => {
                            setStatusFilter(e.target.value || undefined);
                            setPage(1);
                        }}
                        className="text-xs"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="SENT">Sent</option>
                        <option value="FAILED">Failed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </Select>
                    <button
                        onClick={() => {
                            setUpcomingOnly(!upcomingOnly);
                            setPage(1);
                        }}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                            upcomingOnly
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        {upcomingOnly ? '✓ Upcoming Only' : 'Show All'}
                    </button>
                </div>

                {!reminders.length ? (
                    <EmptyState
                        icon={<span className="text-xl">🔔</span>}
                        title="No reminders"
                        description="Set up automated reminders for this patient."
                        action={<Button size="sm" onClick={() => setAddOpen(true)}>+ Add Reminder</Button>}
                    />
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
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditReminder(r)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => cancel(r.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {reminders.filter(r => r.status !== 'pending').length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">History</p>
                                <div className="space-y-2">
                                    {reminders.filter(r => r.status !== 'pending').map(r => (
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

                        {/* Pagination Controls */}
                        {pageInfo && pageInfo.total_pages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-xs text-slate-600">
                                    Page {pageInfo.current_page} of {pageInfo.total_pages} • {pageInfo.total_items} total
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={pageSize}
                                        onChange={e => {
                                            setPageSize(parseInt(e.target.value));
                                            setPage(1);
                                        }}
                                        className="px-2 py-1 text-xs border rounded-lg"
                                    >
                                        <option value="5">5 per page</option>
                                        <option value="10">10 per page</option>
                                        <option value="20">20 per page</option>
                                        <option value="50">50 per page</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={!pageInfo.has_previous}
                                        onClick={() => setPage(pageInfo.current_page - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={!pageInfo.has_next}
                                        onClick={() => setPage(pageInfo.current_page + 1)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
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
                            <option key={t} value={t}>{TYPE_ICONS[t]} {REMINDER_TYPE_LABELS[t]}</option>
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
                        <span>{TYPE_ICONS[reminder.reminder_type]}</span>
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