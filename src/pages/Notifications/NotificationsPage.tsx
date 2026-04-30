import { useNavigate } from 'react-router-dom';
import type { ElementType } from 'react';
import { Bell, CheckCircle2, Clock, PhoneCall, X } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common';
import { useFacilityNotifications, useUpdateFacilityNotification } from '../../hooks/useNotifications';
import type { FacilityNotification, FacilityNotificationStatus } from '../../types/notification';

export function NotificationsPage() {
    const navigate = useNavigate();
    const { data = [], isLoading } = useFacilityNotifications({ unresolved_only: true, limit: 100 });
    const update = useUpdateFacilityNotification();
    const unread = data.filter(n => n.status === 'unread');
    const inProgress = data.filter(n => n.status === 'in_progress' || n.status === 'acknowledged');
    const urgent = data.filter(n => n.priority === 'urgent');

    const setStatus = (id: string, status: FacilityNotificationStatus) =>
        update.mutate({ id, data: { status } });

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Facility Notifications</h1>
                    <p className="mt-1 text-sm text-slate-500">Call queue for patient reminders that need staff follow-up.</p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Open" value={String(data.length)} icon={Bell} tone={data.length ? 'blue' : 'slate'} />
                <Metric label="Unread" value={String(unread.length)} icon={Clock} tone={unread.length ? 'amber' : 'slate'} />
                <Metric label="Urgent" value={String(urgent.length)} icon={PhoneCall} tone={urgent.length ? 'red' : 'slate'} />
                <Metric label="In Progress" value={String(inProgress.length)} icon={CheckCircle2} />
            </div>

            <section className="border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">Call Work Queue</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Prioritized by urgency and due date.</p>
                </div>
                {!data.length ? (
                    <div className="px-5 py-14 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No open facility notifications</p>
                        <p className="mt-1 text-xs text-slate-400">New call tasks appear here after patient reminders are sent.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {data.map(notification => (
                            <NotificationRow
                                key={notification.id}
                                notification={notification}
                                onOpen={() => {
                                    if (notification.status === 'unread') {
                                        setStatus(notification.id, 'acknowledged');
                                    }
                                    navigate(notification.action_url || `/patients/${notification.patient_id}`);
                                }}
                                onStart={() => setStatus(notification.id, 'in_progress')}
                                onResolve={() => setStatus(notification.id, 'resolved')}
                                onDismiss={() => setStatus(notification.id, 'dismissed')}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function NotificationRow({
    notification,
    onOpen,
    onStart,
    onResolve,
    onDismiss,
}: {
    notification: FacilityNotification;
    onOpen: () => void;
    onStart: () => void;
    onResolve: () => void;
    onDismiss: () => void;
}) {
    return (
        <div className={`grid gap-4 px-5 py-4 lg:grid-cols-[1fr_180px_260px] ${notification.status === 'unread' ? 'bg-blue-50/40' : 'bg-white'}`}>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${priorityClass(notification.priority)}`}>
                        {notification.priority}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(notification.due_date)}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                    {notification.patient_name || 'Patient'} {notification.patient_phone ? `· ${notification.patient_phone}` : ''}
                </p>
            </div>
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{formatLabel(notification.status)}</p>
                {notification.assigned_to && <p className="mt-1 text-xs text-slate-400">{notification.assigned_to.name}</p>}
            </div>
            <div className="flex flex-wrap items-start justify-end gap-2">
                <Button size="sm" variant="outline" onClick={onOpen}>Open Patient</Button>
                {notification.status !== 'in_progress' && (
                    <Button size="sm" variant="secondary" onClick={onStart}>Start Call</Button>
                )}
                <Button size="sm" onClick={onResolve}>Resolve</Button>
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

function Metric({ label, value, icon: Icon, tone = 'slate' }: {
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

function priorityClass(priority: string) {
    if (priority === 'urgent') return 'bg-red-100 text-red-700';
    if (priority === 'high') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
}

function formatLabel(value: string) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(value?: string | null) {
    if (!value) return 'No due date';
    return new Date(value).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
}
