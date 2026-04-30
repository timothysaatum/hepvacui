import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useFacilityNotifications } from '../../hooks/useNotifications';

export function NotificationBell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const { data = [] } = useFacilityNotifications({ unresolved_only: true, limit: 5 });
    const unread = data.filter(n => n.status === 'unread').length;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                title="Facility notifications"
            >
                <Bell className="w-[18px] h-[18px]" />
                {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 border border-slate-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">Facility Notifications</p>
                        <button className="text-xs font-medium text-teal-700" onClick={() => navigate('/notifications')}>View all</button>
                    </div>
                    {!data.length ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">No open call tasks.</div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {data.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => {
                                        setOpen(false);
                                        navigate('/notifications');
                                    }}
                                    className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-semibold text-slate-900">{notification.patient_name || 'Patient'}</p>
                                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${notification.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {notification.priority}
                                        </span>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{notification.message}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
