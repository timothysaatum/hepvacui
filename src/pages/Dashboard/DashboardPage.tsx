/**
 * DashboardPage.tsx
 *
 * Facility analytics dashboard.
 * Data comes from four aggregate API endpoints — no per-patient N+1 calls.
 *
 *   GET /analytics/summary              → KPI strip + pipeline + dose completion
 *   GET /analytics/revenue-trend?days=N → revenue bar chart
 *   GET /analytics/acquisition?days=30  → acquisition bar chart
 *   GET /analytics/upcoming-deliveries  → clinical alerts panel
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/useAuth';
import { analyticsService, toNumber, type AcquisitionDay, type DashboardSummary, type RevenueDay, type UpcomingDelivery, type VaccineDoseCompletion } from '../../services/dashboardService';


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
const todayStr = () => toDateStr(new Date());

/** Build a complete N-day axis, merging sparse API data with zeros. */
const buildDayAxis = <T extends { date: string }>(
    series: T[],
    days: number,
    zero: Omit<T, 'date'>
): Array<T & { date: string }> => {
    const map = new Map(series.map((d) => [d.date, d]));
    return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = toDateStr(d);
        return (map.get(key) ?? { date: key, ...zero }) as T & { date: string };
    });
};

const monthLabel = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GH', {
        month: 'short',
        day: 'numeric',
    });

const shortDay = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00')
        .toLocaleDateString('en-GH', { weekday: 'short' })
        .slice(0, 2);

const exportCSV = (rows: string[][], filename: string) => {
    const content = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([content], { type: 'text/csv' })),
        download: filename,
    });
    a.click();
    URL.revokeObjectURL(a.href);
};

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trendDays, setTrendDays] = useState<7 | 30>(30);
    const isAdmin = user?.roles?.some(role => role.name.toLowerCase() === 'admin');
    // ── API queries ─────────────────────────────────────────────────────────────
    const {
        data: summary,
        isLoading: loadingSummary,
    } = useQuery<DashboardSummary>({
        queryKey: ['analytics-summary'],
        queryFn: analyticsService.getSummary,
        staleTime: 2 * 60 * 1000,
    });

    const {
        data: revenueTrend,
        isLoading: loadingRevenue,
    } = useQuery({
        queryKey: ['analytics-revenue', trendDays],
        queryFn: () => analyticsService.getRevenueTrend(trendDays),
        staleTime: 2 * 60 * 1000,
    });

    const {
        data: acquisitionTrend,
        isLoading: loadingAcquisition,
    } = useQuery({
        queryKey: ['analytics-acquisition'],
        queryFn: () => analyticsService.getAcquisitionTrend(30),
        staleTime: 2 * 60 * 1000,
    });

    const {
        data: upcomingDeliveries = [],
        isLoading: loadingDeliveries,
    } = useQuery<UpcomingDelivery[]>({
        queryKey: ['analytics-deliveries'],
        queryFn: () => analyticsService.getUpcomingDeliveries(30),
        staleTime: 2 * 60 * 1000,
    });

    // ── Derived values ──────────────────────────────────────────────────────────
    const finance = summary?.financials;
    const patients = summary?.patients;

    const totalRevenue = toNumber(finance?.total_revenue ?? 0);
    const totalOutstanding = toNumber(finance?.total_outstanding ?? 0);
    const monthRevenue = toNumber(finance?.month_revenue ?? 0);
    const lastMonthRevenue = toNumber(finance?.last_month_revenue ?? 0);

    const revenueDelta =
        lastMonthRevenue > 0
            ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0;

    const collectionRate = pct(totalRevenue, totalRevenue + totalOutstanding);

    const totalDoses = finance?.total_doses ?? 0;
    const administeredDoses = finance?.administered_doses ?? 0;
    const doseCompletionRate = pct(administeredDoses, totalDoses);

    const acquisitionDelta =
        (patients?.new_last_month ?? 0) > 0
            ? Math.round(
                (((patients?.new_this_month ?? 0) - (patients?.new_last_month ?? 0)) /
                    (patients?.new_last_month ?? 1)) *
                100
            )
            : 0;

    const overdueDeliveries = upcomingDeliveries.filter(
        (d) => d.days_until_delivery < 0
    );

    // ── Revenue trend data (fill zeros for missing days) ─────────────────────
    const revenueChartData = useMemo(() => {
        const series = revenueTrend?.series ?? [];
        return buildDayAxis<RevenueDay>(series, trendDays, {
            revenue: '0',
            sales_count: 0,
        });
    }, [revenueTrend, trendDays]);

    const acquisitionChartData = useMemo(() => {
        const series = acquisitionTrend?.series ?? [];
        return buildDayAxis<AcquisitionDay>(series, 30, {
            pregnant: 0,
            regular: 0,
            total: 0,
        });
    }, [acquisitionTrend]);

    // ── CSV export ────────────────────────────────────────────────────────────
    const handleExportSummary = () => {
        if (!summary) return;
        const { patients: p, financials: f } = summary;
        exportCSV(
            [
                ['Metric', 'Value'],
                ['Total Patients', String(p.total)],
                ['Pregnant', String(p.pregnant)],
                ['Regular', String(p.regular)],
                ['Active', String(p.active)],
                ['New This Month', String(p.new_this_month)],
                ['Total Revenue (GHS)', f.total_revenue],
                ['Outstanding Balance (GHS)', f.total_outstanding],
                ['Month Revenue (GHS)', f.month_revenue],
                ['Dose Completion %', String(doseCompletionRate)],
                ['Upcoming Deliveries (30d)', String(summary.clinical.upcoming_deliveries_30d)],
            ],
            `drive4health_summary_${todayStr()}.csv`
        );
    };

    const loading = loadingSummary;

    return (
        <div className="space-y-5 pb-8">

            {/* ── Header ──────────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        Facility Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {new Date().toLocaleDateString('en-GH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleExportSummary}
                        disabled={loading || !summary}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-40 transition-colors"
                    >
                        <DownloadIcon /> Export Summary
                    </button>
                )}
            </div>

            {/* ── KPI strip ────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                    label="Total Patients"
                    value={loading ? '—' : String(patients?.total ?? 0)}
                    sub={`${patients?.active ?? 0} active`}
                    delta={
                        acquisitionDelta !== 0
                            ? `${acquisitionDelta > 0 ? '+' : ''}${acquisitionDelta}% vs last month`
                            : undefined
                    }
                    positive={acquisitionDelta >= 0}
                    accent="teal"
                    icon={<PatientsIcon />}
                />
                <KpiCard
                    label="Monthly Revenue"
                    value={loading ? '—' : formatCurrency(monthRevenue)}
                    sub={`${revenueDelta > 0 ? '+' : ''}${revenueDelta}% vs last month`}
                    delta={`${formatCurrency(lastMonthRevenue)} last month`}
                    positive={revenueDelta >= 0}
                    accent="emerald"
                    icon={<RevenueIcon />}
                />
                <KpiCard
                    label="Outstanding Balance"
                    value={loading ? '—' : formatCurrency(totalOutstanding)}
                    sub={`${collectionRate}% collection rate`}
                    accent="amber"
                    icon={<BalanceIcon />}
                    alert={totalOutstanding > 0}
                />
                <KpiCard
                    label="Dose Completion"
                    value={loading ? '—' : `${doseCompletionRate}%`}
                    sub={`${administeredDoses} of ${totalDoses} doses`}
                    accent="violet"
                    icon={<VaccineIcon />}
                    positive={doseCompletionRate >= 80}
                />
            </div>

            {/* ── Revenue trend + Clinical alerts ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Revenue Trend</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Daily vaccine purchase payments</p>
                        </div>
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                            {([7, 30] as const).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setTrendDays(n)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${trendDays === n
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {n}d
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="px-5 pt-4 pb-5">
                        <RevenueTrendChart data={revenueChartData} days={trendDays} loading={loadingRevenue} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Clinical Alerts</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Deliveries within 30 days</p>
                        </div>
                        {overdueDeliveries.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                    </div>
                    <UpcomingDeliveriesPanel
                        deliveries={upcomingDeliveries}
                        loading={loadingDeliveries}
                        navigate={navigate}
                    />
                </div>
            </div>

            {/* ── Financial health + Patient pipeline + Dose completion ────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Payment Health</h3>
                    <p className="text-xs text-slate-400 mb-4">Across all vaccine purchases</p>
                    <PaymentHealthChart summary={summary} loading={loading} />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Patient Pipeline</h3>
                    <p className="text-xs text-slate-400 mb-4">Current status distribution</p>
                    <PatientPipelineChart patients={patients} loading={loading} />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Dose Completion</h3>
                    <p className="text-xs text-slate-400 mb-4">By vaccine type</p>
                    <DoseCompletionPanel
                        doseCompletionRate={doseCompletionRate}
                        byVaccine={summary?.dose_completion_by_vaccine ?? []}
                        loading={loading}
                    />
                </div>
            </div>

            {/* ── Acquisition + Clinical outcomes + Quick actions ──────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Patient Acquisition</h3>
                            <p className="text-xs text-slate-400 mt-0.5">New registrations last 30 days</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                                <span className="text-slate-500">Pregnant</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
                                <span className="text-slate-500">Regular</span>
                            </span>
                        </div>
                    </div>
                    <div className="px-5 pt-4 pb-5">
                        <AcquisitionChart data={acquisitionChartData} loading={loadingAcquisition} />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Hep B outcomes */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Hep B Results</h3>
                        <p className="text-xs text-slate-400 mb-3">Children 6-month antibody tests</p>
                        <HepBResultsPanel clinical={summary?.clinical} loading={loading} />
                    </div>

                    {/* Quick actions */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
                        <QuickActions navigate={navigate} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
    label, value, sub, delta, positive, accent, icon, alert,
}: {
    label: string; value: string; sub: string; delta?: string;
    positive?: boolean; accent: string; icon: React.ReactNode; alert?: boolean;
}) {
    const accentMap: Record<string, { bg: string; icon: string }> = {
        teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-700' },
        emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700' },
        amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-700' },
        violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-700' },
    };
    const c = accentMap[accent] ?? accentMap.teal;
    return (
        <div className={`${c.bg} rounded-2xl p-4 border border-white shadow-sm`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`${c.icon} w-9 h-9 rounded-xl flex items-center justify-center`}>
                    {icon}
                </div>
                {alert && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mt-1" />}
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            {delta && (
                <p className={`text-xs mt-1.5 font-medium ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {positive ? '↑' : '↓'} {delta}
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue Trend Chart
// ─────────────────────────────────────────────────────────────────────────────

function RevenueTrendChart({
    data, days, loading,
}: { data: RevenueDay[]; days: number; loading: boolean }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const maxRevenue = Math.max(...data.map((d) => toNumber(d.revenue)), 1);
    const totalShown = data.reduce((s, d) => s + toNumber(d.revenue), 0);
    const labelEvery = days === 30 ? 5 : 1;

    if (loading) return (
        <div className="h-32 flex items-center justify-center">
            <div className="text-xs text-slate-400 animate-pulse">Loading…</div>
        </div>
    );

    return (
        <div>
            <div className="flex items-end gap-0.5 h-28" onMouseLeave={() => setHovered(null)}>
                {data.map((d, i) => {
                    const rev = toNumber(d.revenue);
                    const height = Math.max((rev / maxRevenue) * 100, rev > 0 ? 4 : 1);
                    const isHovered = hovered === i;
                    const isToday = d.date === todayStr();
                    return (
                        <div
                            key={d.date}
                            className="flex-1 flex flex-col items-center gap-0.5 group cursor-pointer relative"
                            onMouseEnter={() => setHovered(i)}
                        >
                            {isHovered && (
                                <div
                                    className="absolute bottom-full mb-1 z-10 bg-slate-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-lg pointer-events-none"
                                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                                >
                                    <p className="font-semibold">{formatCurrency(rev)}</p>
                                    <p className="text-slate-400">
                                        {d.sales_count} sale{d.sales_count !== 1 ? 's' : ''} · {monthLabel(d.date)}
                                    </p>
                                </div>
                            )}
                            <div className="w-full flex items-end" style={{ height: '88px' }}>
                                <div
                                    className={`w-full rounded-sm transition-all duration-150 ${isHovered ? 'bg-teal-600'
                                            : isToday ? 'bg-teal-300'
                                                : rev > 0 ? 'bg-teal-100 group-hover:bg-teal-200'
                                                    : 'bg-slate-50'
                                        }`}
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                            {i % labelEvery === 0 && (
                                <span className="text-[9px] text-slate-300 select-none">{shortDay(d.date)}</span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>
                    {days}d total:{' '}
                    <span className="font-semibold text-slate-700">{formatCurrency(totalShown)}</span>
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-teal-600 inline-block" /> Today
                    <span className="w-2 h-2 rounded-sm bg-teal-100 inline-block ml-1" /> Past
                </span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upcoming Deliveries
// ─────────────────────────────────────────────────────────────────────────────

function UpcomingDeliveriesPanel({
    deliveries, loading, navigate,
}: { deliveries: UpcomingDelivery[]; loading: boolean; navigate: (p: string) => void }) {
    const overdue = deliveries.filter((d) => d.days_until_delivery < 0);
    const upcoming = deliveries.filter((d) => d.days_until_delivery >= 0);

    if (loading) return <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Loading…</div>;
    if (deliveries.length === 0) return (
        <div className="py-10 text-center text-xs text-slate-400">
            No deliveries due in next 30 days
        </div>
    );

    return (
        <div className="overflow-y-auto max-h-64 divide-y divide-slate-50">
            {overdue.map((d) => (
                <button
                    key={d.patient_id}
                    onClick={() => navigate(`/patients/${d.patient_id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-rose-50 transition-colors text-left"
                >
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold shrink-0">
                        {d.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{d.name}</p>
                        <p className="text-xs text-rose-500 font-medium">
                            {Math.abs(d.days_until_delivery)}d overdue
                        </p>
                    </div>
                    <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md font-medium">!</span>
                </button>
            ))}
            {upcoming.map((d) => {
                const style =
                    d.days_until_delivery <= 7 ? 'bg-amber-100 text-amber-700'
                        : d.days_until_delivery <= 14 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-600';
                return (
                    <button
                        key={d.patient_id}
                        onClick={() => navigate(`/patients/${d.patient_id}`)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                            {d.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">{d.name}</p>
                            <p className="text-xs text-slate-400">{formatDate(d.expected_delivery_date)}</p>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium shrink-0 ${style}`}>
                            {d.days_until_delivery}d
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Health
// ─────────────────────────────────────────────────────────────────────────────

function PaymentHealthChart({
    summary, loading,
}: { summary?: DashboardSummary; loading: boolean }) {
    const counts = summary?.financials.payment_status_counts;
    const total = counts?.total_purchases || 1;

    const rows = [
        { label: 'Completed', count: counts?.completed ?? 0, color: 'bg-emerald-400', text: 'text-emerald-700' },
        { label: 'Partial', count: counts?.partial ?? 0, color: 'bg-amber-400', text: 'text-amber-700' },
        { label: 'Pending', count: counts?.pending ?? 0, color: 'bg-slate-200', text: 'text-slate-600' },
    ];

    if (loading) return <div className="h-32 animate-pulse bg-slate-50 rounded-xl" />;

    return (
        <div className="space-y-4">
            <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 gap-0.5">
                {rows.map((r) => (
                    <div
                        key={r.label}
                        className={`${r.color} rounded-full`}
                        style={{ width: `${pct(r.count, total)}%` }}
                    />
                ))}
            </div>
            {rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${r.color}`} />
                        <span className="text-xs text-slate-600">{r.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{pct(r.count, total)}%</span>
                        <span className={`text-xs font-semibold ${r.text} w-5 text-right`}>{r.count}</span>
                    </div>
                </div>
            ))}
            <div className="pt-3 border-t border-slate-50 grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Collected</p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">
                        {formatCurrency(toNumber(summary?.financials.total_revenue ?? 0))}
                    </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Outstanding</p>
                    <p className="text-sm font-bold text-amber-700 mt-0.5">
                        {formatCurrency(toNumber(summary?.financials.total_outstanding ?? 0))}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Patient Pipeline
// ─────────────────────────────────────────────────────────────────────────────

function PatientPipelineChart({
    patients, loading,
}: { patients?: DashboardSummary['patients']; loading: boolean }) {
    const rows = [
        { label: 'Pregnant', count: patients?.pregnant ?? 0, color: 'bg-violet-400' },
        { label: 'Regular', count: patients?.regular ?? 0, color: 'bg-teal-400' },
        { label: 'Postpartum', count: patients?.postpartum ?? 0, color: 'bg-blue-400' },
        { label: 'Completed', count: patients?.completed ?? 0, color: 'bg-emerald-400' },
        { label: 'Inactive', count: patients?.inactive ?? 0, color: 'bg-slate-300' },
    ];
    const max = Math.max(...rows.map((r) => r.count), 1);

    if (loading) return <div className="h-32 animate-pulse bg-slate-50 rounded-xl" />;

    return (
        <div className="space-y-2.5">
            {rows.map((r) => (
                <div key={r.label}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${r.color}`} />
                            <span className="text-xs text-slate-600">{r.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{r.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${r.color} transition-all duration-500`}
                            style={{ width: `${pct(r.count, max)}%` }}
                        />
                    </div>
                </div>
            ))}
            <p className="text-xs text-slate-400 pt-1">{patients?.total ?? 0} total registered</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dose Completion
// ─────────────────────────────────────────────────────────────────────────────

function DoseCompletionPanel({
    doseCompletionRate, byVaccine, loading,
}: { doseCompletionRate: number; byVaccine: VaccineDoseCompletion[]; loading: boolean }) {
    if (loading) return <div className="h-32 animate-pulse bg-slate-50 rounded-xl" />;
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                <RingProgress value={doseCompletionRate} color="#8b5cf6" size={56} />
                <div>
                    <p className="text-2xl font-bold text-slate-900">{doseCompletionRate}%</p>
                    <p className="text-xs text-slate-400">Overall completion</p>
                </div>
            </div>
            <div className="space-y-2 pt-1">
                {byVaccine.slice(0, 4).map((v) => (
                    <div key={v.vaccine_name}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600 truncate max-w-[130px]" title={v.vaccine_name}>
                                {v.vaccine_name}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 ml-2">
                                {v.administered_doses}/{v.total_doses}
                            </span>
                        </div>
                        <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-violet-400 rounded-full transition-all duration-500"
                                style={{ width: `${v.completion_rate}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hep B Results Panel
// ─────────────────────────────────────────────────────────────────────────────

function HepBResultsPanel({
    clinical, loading,
}: { clinical?: DashboardSummary['clinical']; loading: boolean }) {
    const hepb = clinical?.hep_b_results;
    const total = (hepb?.positive ?? 0) + (hepb?.negative ?? 0) +
        (hepb?.indeterminate ?? 0) + (hepb?.untested ?? 0) || 1;

    const rows = [
        { label: 'Negative', count: hepb?.negative ?? 0, color: 'bg-emerald-400', text: 'text-emerald-700' },
        { label: 'Positive', count: hepb?.positive ?? 0, color: 'bg-rose-400', text: 'text-rose-700' },
        { label: 'Indeterminate', count: hepb?.indeterminate ?? 0, color: 'bg-amber-400', text: 'text-amber-700' },
        { label: 'Untested', count: hepb?.untested ?? 0, color: 'bg-slate-200', text: 'text-slate-500' },
    ];

    if (loading) return <div className="h-16 animate-pulse bg-slate-50 rounded-xl" />;

    return (
        <div className="space-y-2">
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 gap-0.5">
                {rows.map((r) => (
                    <div key={r.label} className={`${r.color} rounded-full`}
                        style={{ width: `${pct(r.count, total)}%` }} />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                {rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${r.color}`} />
                            <span className="text-xs text-slate-500">{r.label}</span>
                        </div>
                        <span className={`text-xs font-semibold ${r.text}`}>{r.count}</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-400 pt-1">
                {clinical?.checkups_completed ?? 0} checkups completed ·{' '}
                {clinical?.checkups_pending ?? 0} pending
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Acquisition Chart
// ─────────────────────────────────────────────────────────────────────────────

function AcquisitionChart({
    data, loading,
}: { data: AcquisitionDay[]; loading: boolean }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const maxTotal = Math.max(...data.map((d) => d.total), 1);

    if (loading) return <div className="h-20 animate-pulse bg-slate-50 rounded-xl" />;

    return (
        <div onMouseLeave={() => setHovered(null)}>
            <div className="flex items-end gap-0.5 h-20">
                {data.map((d, i) => {
                    const totalH = (d.total / maxTotal) * 100;
                    const pregnantH = d.total > 0 ? (d.pregnant / d.total) * totalH : 0;
                    const regularH = totalH - pregnantH;
                    const isHovered = hovered === i;
                    return (
                        <div
                            key={d.date}
                            className="flex-1 flex flex-col items-center cursor-pointer relative"
                            onMouseEnter={() => setHovered(i)}
                        >
                            {isHovered && d.total > 0 && (
                                <div
                                    className="absolute bottom-full mb-1 z-10 bg-slate-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-lg pointer-events-none"
                                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                                >
                                    <p className="font-medium">{monthLabel(d.date)}</p>
                                    {d.pregnant > 0 && <p className="text-violet-300">{d.pregnant} pregnant</p>}
                                    {d.regular > 0 && <p className="text-teal-300">{d.regular} regular</p>}
                                </div>
                            )}
                            <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
                                {pregnantH > 0 && (
                                    <div
                                        className={`w-full rounded-t-sm ${isHovered ? 'bg-violet-500' : 'bg-violet-200'} transition-colors`}
                                        style={{ height: `${pregnantH}%` }}
                                    />
                                )}
                                {regularH > 0 && (
                                    <div
                                        className={`w-full ${isHovered ? 'bg-teal-500' : 'bg-teal-200'} transition-colors`}
                                        style={{ height: `${regularH}%` }}
                                    />
                                )}
                                {d.total === 0 && <div className="w-full bg-slate-50" style={{ height: '2px' }} />}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{data[0]?.date ? monthLabel(data[0].date) : ''}</span>
                <span className="font-medium text-slate-600">
                    {data.reduce((s, d) => s + d.total, 0)} new this period
                </span>
                <span>{data[data.length - 1]?.date ? monthLabel(data[data.length - 1].date) : ''}</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Actions
// ─────────────────────────────────────────────────────────────────────────────

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
    const actions = [
        { label: 'Register Pregnant', path: '/patients', accent: 'hover:bg-violet-50 hover:border-violet-200', icon: '🤰' },
        { label: 'Register Regular', path: '/patients', accent: 'hover:bg-teal-50 hover:border-teal-200', icon: '👤' },
        { label: 'All Patients', path: '/patients', accent: 'hover:bg-slate-100 hover:border-slate-300', icon: '📋' },
        { label: 'Manage Vaccines', path: '/vaccines', accent: 'hover:bg-emerald-50 hover:border-emerald-200', icon: '💉' },
    ];
    return (
        <div className="space-y-2">
            {actions.map((a) => (
                <button
                    key={a.label}
                    onClick={() => navigate(a.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 text-left transition-all ${a.accent}`}
                >
                    <span className="text-sm">{a.icon}</span>
                    <span className="text-xs font-medium text-slate-700">{a.label}</span>
                    <span className="ml-auto text-slate-300">›</span>
                </button>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ring Progress (SVG)
// ─────────────────────────────────────────────────────────────────────────────

function RingProgress({ value, color, size = 56 }: { value: number; color: string; size?: number }) {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={5} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={5}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const ip = { className: 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' } as const;

const PatientsIcon = () => <svg {...ip}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const RevenueIcon = () => <svg {...ip}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BalanceIcon = () => <svg {...ip}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>;
const VaccineIcon = () => <svg {...ip}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const DownloadIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;