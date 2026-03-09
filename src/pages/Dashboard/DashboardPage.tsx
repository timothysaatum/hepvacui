import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { vaccinePurchaseService } from '../../services/vaccinePurchaseService';
import { usePatients } from '../../hooks/usePatients';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Patient } from '../../types/patient';
import type { VaccinePurchase } from '../../types/vaccinePurchase';

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = {
    Patients: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Revenue: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Vaccine: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
    ),
    Pending: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Export: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    ),
    Arrow: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    Up: () => (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
    ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

const last7Days = (): string[] => {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return toDateStr(d);
    });
};

const exportCSV = (rows: string[][], filename: string) => {
    const content = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

// ── Page ───────────────────────────────────────────────────────────────────────

export function DashboardPage() {
    const navigate = useNavigate();
    const [exportLoading, setExportLoading] = useState(false);

    // Patients
    const { data: patientsData, isLoading: loadingPatients } = usePatients({ page_size: 200 });
    const patients: Patient[] = patientsData?.items ?? [];

    // Today's purchases — fetched via patient list (no global endpoint available)
    // We compute stats from patient data + purchase data we have
    const totalPatients = patientsData?.page_info.total_items ?? 0;
    const pregnantCount = patients.filter(p => p.patient_type === 'pregnant').length;
    const regularCount = patients.filter(p => p.patient_type === 'regular').length;
    const activeCount = patients.filter(p => p.status === 'active').length;

    // Recent patients (last 5)
    const recentPatients = useMemo(() =>
        [...patients]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 5),
        [patients]
    );

    // ── Export handlers ──────────────────────────────────────────────────────────

    const handleExportPatients = async () => {
        setExportLoading(true);
        try {
            const all = await patientService.getPatients({ page_size: 1000 });
            const rows = [
                ['Name', 'Phone', 'Type', 'Status', 'Age', 'Date of Birth', 'Facility', 'Registered'],
                ...all.items.map(p => [
                    p.name,
                    p.phone,
                    p.patient_type,
                    p.status,
                    String(p.age ?? ''),
                    p.date_of_birth ?? '',
                    p.facility.name,
                    formatDate(p.created_at),
                ]),
            ];
            exportCSV(rows, `patients_${today()}.csv`);
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportSales = async () => {
        setExportLoading(true);
        try {
            // Fetch purchases for each patient we have and collate payments
            const allPayments: Array<{ patient: Patient; purchase: VaccinePurchase }> = [];
            await Promise.all(
                patients.map(async (p) => {
                    try {
                        const purchases = await vaccinePurchaseService.listPatientPurchases(p.id);
                        purchases.forEach(purchase => allPayments.push({ patient: p, purchase }));
                    } catch { /* skip patients with no purchases */ }
                })
            );
            const rows = [
                ['Patient', 'Vaccine', 'Total Price (GHS)', 'Amount Paid (GHS)', 'Balance (GHS)', 'Status', 'Purchase Date', 'Doses', 'Administered'],
                ...allPayments.map(({ patient, purchase }) => [
                    patient.name,
                    purchase.vaccine_name,
                    String(purchase.total_package_price),
                    String(purchase.amount_paid),
                    String(purchase.balance),
                    purchase.payment_status,
                    formatDate(purchase.purchase_date),
                    String(purchase.total_doses),
                    String(purchase.doses_administered),
                ]),
            ];
            exportCSV(rows, `sales_${today()}.csv`);
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportPatients}
                        disabled={exportLoading || loadingPatients}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        <Icon.Export />
                        Export Patients
                    </button>
                    <button
                        onClick={handleExportSales}
                        disabled={exportLoading || loadingPatients}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        <Icon.Export />
                        Export Sales
                    </button>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Patients"
                    value={loadingPatients ? '—' : String(totalPatients)}
                    sub={`${activeCount} active`}
                    icon={<Icon.Patients />}
                    color="teal"
                />
                <StatCard
                    label="Pregnant"
                    value={loadingPatients ? '—' : String(pregnantCount)}
                    sub="patients"
                    icon={<Icon.Vaccine />}
                    color="purple"
                />
                <StatCard
                    label="Regular"
                    value={loadingPatients ? '—' : String(regularCount)}
                    sub="patients"
                    icon={<Icon.Patients />}
                    color="blue"
                />
                <StatCard
                    label="Active Cases"
                    value={loadingPatients ? '—' : String(activeCount)}
                    sub={`of ${totalPatients} total`}
                    icon={<Icon.Pending />}
                    color="emerald"
                />
            </div>

            {/* ── Main content grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Daily sales panel */}
                <div className="lg:col-span-2">
                    <DailySalesPanel patients={patients} loadingPatients={loadingPatients} />
                </div>

                {/* Recent patients */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900">Recent Patients</h3>
                        <button
                            onClick={() => navigate('/patients')}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                        >
                            View all <Icon.Arrow />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {loadingPatients ? (
                            <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
                        ) : recentPatients.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">No patients yet</div>
                        ) : (
                            recentPatients.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => navigate(`/patients/${p.id}`)}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                                        <p className="text-xs text-slate-500">{p.phone}</p>
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${p.patient_type === 'pregnant'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {p.patient_type === 'pregnant' ? 'Pregnant' : 'Regular'}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Patient type breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusBreakdown patients={patients} loading={loadingPatients} />
                <QuickActions navigate={navigate} />
            </div>
        </div>
    );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color }: {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    color: 'teal' | 'purple' | 'blue' | 'emerald';
}) {
    const colors = {
        teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-700', value: 'text-teal-900' },
        purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-700', value: 'text-purple-900' },
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-700', value: 'text-blue-900' },
        emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700', value: 'text-emerald-900' },
    };
    const c = colors[color];

    return (
        <div className={`${c.bg} rounded-2xl p-5 border border-white`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`${c.icon} w-10 h-10 rounded-xl flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
        </div>
    );
}

// ── Daily sales panel ─────────────────────────────────────────────────────────

function DailySalesPanel({ patients, loadingPatients }: {
    patients: Patient[];
    loadingPatients: boolean;
}) {
    const [selectedDate, setSelectedDate] = useState(today());

    // Fetch purchases for all patients (cached by react-query)
    const { data: allPurchases = [], isLoading: loadingPurchases } = useQuery({
        queryKey: ['dashboard-purchases', patients.map(p => p.id).join(',')],
        queryFn: async () => {
            const results = await Promise.allSettled(
                patients.map(p => vaccinePurchaseService.listPatientPurchases(p.id))
            );
            return results
                .filter((r): r is PromiseFulfilledResult<VaccinePurchase[]> => r.status === 'fulfilled')
                .flatMap(r => r.value);
        },
        enabled: patients.length > 0,
        staleTime: 2 * 60 * 1000,
    });

    const days = last7Days();

    // Group purchases by date
    const byDay = useMemo(() => {
        const map: Record<string, { count: number; revenue: number }> = {};
        days.forEach(d => { map[d] = { count: 0, revenue: 0 }; });
        allPurchases.forEach(p => {
            const d = p.purchase_date.slice(0, 10);
            if (map[d]) {
                map[d].count++;
                map[d].revenue += p.amount_paid;
            }
        });
        return map;
    }, [allPurchases, days]);

    // Selected day detail
    const selectedPurchases = allPurchases.filter(p =>
        p.purchase_date.slice(0, 10) === selectedDate
    );

    const patientMap = useMemo(() => {
        const m: Record<string, Patient> = {};
        patients.forEach(p => { m[p.id] = p; });
        return m;
    }, [patients]);

    const todayData = byDay[today()] ?? { count: 0, revenue: 0 };
    const maxRevenue = Math.max(...days.map(d => byDay[d]?.revenue ?? 0), 1);

    const loading = loadingPatients || loadingPurchases;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Daily Sales</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Vaccine purchase payments</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(todayData.revenue)}</p>
                        <p className="text-xs text-slate-500">{todayData.count} sales today</p>
                    </div>
                </div>
            </div>

            {/* 7-day bar chart */}
            <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-end gap-2 h-24">
                    {days.map(d => {
                        const data = byDay[d] ?? { count: 0, revenue: 0 };
                        const height = maxRevenue > 0 ? Math.max((data.revenue / maxRevenue) * 100, data.revenue > 0 ? 8 : 0) : 0;
                        const isSelected = d === selectedDate;
                        const isToday = d === today();
                        return (
                            <button
                                key={d}
                                onClick={() => setSelectedDate(d)}
                                className="flex-1 flex flex-col items-center gap-1 group"
                                title={`${d}: ${formatCurrency(data.revenue)}`}
                            >
                                <div className="w-full relative flex items-end" style={{ height: '72px' }}>
                                    <div
                                        className={`w-full rounded-t-md transition-all ${isSelected
                                                ? 'bg-teal-600'
                                                : isToday
                                                    ? 'bg-teal-200 group-hover:bg-teal-300'
                                                    : 'bg-slate-100 group-hover:bg-slate-200'
                                            }`}
                                        style={{ height: `${height}%`, minHeight: data.revenue > 0 ? '4px' : '2px' }}
                                    />
                                </div>
                                <span className={`text-xs ${isSelected ? 'text-teal-700 font-semibold' : 'text-slate-400'}`}>
                                    {new Date(d + 'T12:00:00').toLocaleDateString('en-GH', { weekday: 'short' }).slice(0, 2)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected day detail */}
            <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700">
                        {selectedDate === today() ? "Today's Sales" : formatDate(selectedDate)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{selectedPurchases.length} sales</span>
                        <span className="font-semibold text-teal-700">
                            {formatCurrency(selectedPurchases.reduce((s, p) => s + p.amount_paid, 0))}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="py-6 text-center text-sm text-slate-400">Loading…</div>
                ) : selectedPurchases.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">No sales on this day</div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedPurchases.map(purchase => {
                            const patient = patientMap[purchase.patient_id];
                            return (
                                <div key={purchase.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {patient?.name ?? 'Unknown Patient'}
                                        </p>
                                        <p className="text-xs text-slate-500">{purchase.vaccine_name} · {purchase.total_doses} doses</p>
                                    </div>
                                    <div className="shrink-0 text-right ml-4">
                                        <p className="text-sm font-semibold text-emerald-700">{formatCurrency(purchase.amount_paid)}</p>
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${purchase.payment_status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : purchase.payment_status === 'partial'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {purchase.payment_status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Status breakdown ──────────────────────────────────────────────────────────

function StatusBreakdown({ patients, loading }: { patients: Patient[]; loading: boolean }) {
    const statuses = ['active', 'inactive', 'postpartum', 'completed'] as const;
    const colors: Record<string, string> = {
        active: 'bg-emerald-500',
        inactive: 'bg-slate-300',
        postpartum: 'bg-purple-500',
        completed: 'bg-blue-500',
    };
    const labels: Record<string, string> = {
        active: 'Active', inactive: 'Inactive', postpartum: 'Postpartum', completed: 'Completed',
    };

    const counts = statuses.map(s => ({
        status: s,
        count: patients.filter(p => p.status === s).length,
    }));
    const total = patients.length || 1;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Patient Status</h3>
            {loading ? (
                <div className="py-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : (
                <>
                    {/* Stacked bar */}
                    <div className="flex h-3 rounded-full overflow-hidden mb-5 bg-slate-100">
                        {counts.filter(c => c.count > 0).map(c => (
                            <div
                                key={c.status}
                                className={`${colors[c.status]} transition-all`}
                                style={{ width: `${(c.count / total) * 100}%` }}
                            />
                        ))}
                    </div>
                    <div className="space-y-3">
                        {counts.map(c => (
                            <div key={c.status} className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ${colors[c.status]}`} />
                                    <span className="text-sm text-slate-600">{labels[c.status]}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">
                                        {((c.count / total) * 100).toFixed(0)}%
                                    </span>
                                    <span className="text-sm font-semibold text-slate-900 w-6 text-right">{c.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Quick actions ─────────────────────────────────────────────────────────────

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
    const actions = [
        { label: 'Register Pregnant Patient', sub: 'Add new pregnant patient', path: '/patients', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100', text: 'text-purple-900' },
        { label: 'Register Regular Patient', sub: 'Add HIV+ patient', path: '/patients', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100', text: 'text-blue-900' },
        { label: 'View All Patients', sub: 'Browse patient records', path: '/patients', color: 'bg-slate-50 hover:bg-slate-100 border-slate-100', text: 'text-slate-900' },
        { label: 'Manage Vaccines', sub: 'Stock & pricing', path: '/vaccines', color: 'bg-teal-50 hover:bg-teal-100 border-teal-100', text: 'text-teal-900' },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map(a => (
                    <button
                        key={a.label}
                        onClick={() => navigate(a.path)}
                        className={`${a.color} border rounded-xl p-4 text-left transition-colors`}
                    >
                        <p className={`text-sm font-semibold ${a.text}`}>{a.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.sub}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}