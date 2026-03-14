/**
 *
 * Admin-only data export centre.
 * Route: /reports
 *
 * Features:
 *  - Quick export buttons for common presets (full export, this month, active patients…)
 *  - Fine-grained filter panel: date range, patient type/status, sheet toggles
 *  - Live "sheets selected" counter + estimated scope description
 *  - Download progress bar
 *  - Export history log (session-only, in state)
 */

import { useState, useCallback } from 'react';
import { reportService, type ReportFilters } from '../../services/reportService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SheetKey =
    | 'include_patients' | 'include_pregnancies' | 'include_children'
    | 'include_transactions' | 'include_vaccinations' | 'include_prescriptions'
    | 'include_medications' | 'include_diagnoses' | 'include_reminders'
    | 'include_stock';

interface SheetDef {
    key: SheetKey;
    label: string;
    desc: string;
    color: string;
    icon: string;
}

interface HistoryEntry {
    id: number;
    timestamp: string;
    label: string;
    sheets: number;
    status: 'success' | 'error';
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SHEETS: SheetDef[] = [
    { key: 'include_patients', label: 'Patients', desc: 'Demographics, contact, type-specific clinical fields', color: 'teal', icon: '👥' },
    { key: 'include_pregnancies', label: 'Pregnancies', desc: 'Per-episode obstetric data, EDD, outcomes', color: 'violet', icon: '🤰' },
    { key: 'include_children', label: 'Children', desc: 'Birth records & 6-month Hep B monitoring', color: 'pink', icon: '👶' },
    { key: 'include_transactions', label: 'Transactions', desc: 'Vaccine purchases, instalment payments, balances', color: 'emerald', icon: '💳' },
    { key: 'include_vaccinations', label: 'Vaccinations', desc: 'Individual doses administered, batch & dates', color: 'blue', icon: '💉' },
    { key: 'include_prescriptions', label: 'Prescriptions', desc: 'Medication prescriptions issued to patients', color: 'indigo', icon: '📋' },
    { key: 'include_medications', label: 'Med Schedules', desc: 'Monthly dispensing & lab review records', color: 'cyan', icon: '💊' },
    { key: 'include_diagnoses', label: 'Diagnoses', desc: 'Clinical diagnosis history per patient', color: 'rose', icon: '🩺' },
    { key: 'include_reminders', label: 'Reminders', desc: 'Automated reminder log (sent, pending, failed)', color: 'amber', icon: '🔔' },
    { key: 'include_stock', label: 'Vaccine Stock', desc: 'Inventory snapshot — quantities, prices, batches', color: 'slate', icon: '📦' },
];

const ALL_ON = Object.fromEntries(SHEETS.map(s => [s.key, true])) as Record<SheetKey, boolean>;
const ALL_OFF = Object.fromEntries(SHEETS.map(s => [s.key, false])) as Record<SheetKey, boolean>;

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthStartISO = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

interface Preset {
    id: string;
    label: string;
    desc: string;
    icon: string;
    filters: Partial<ReportFilters>;
    sheets: Partial<Record<SheetKey, boolean>>;
}

const PRESETS: Preset[] = [
    {
        id: 'full',
        label: 'Full Export',
        desc: 'All data, all time',
        icon: '📊',
        filters: {},
        sheets: ALL_ON,
    },
    {
        id: 'this_month',
        label: 'This Month',
        desc: 'All sheets, current month only',
        icon: '📅',
        filters: { date_from: monthStartISO(), date_to: todayISO() },
        sheets: ALL_ON,
    },
    {
        id: 'active_patients',
        label: 'Active Patients',
        desc: 'Patient + pregnancy data for active patients only',
        icon: '🟢',
        filters: { patient_status: 'active' },
        sheets: {
            ...ALL_OFF,
            include_patients: true,
            include_pregnancies: true,
            include_children: true,
        },
    },
    {
        id: 'financial',
        label: 'Financial',
        desc: 'Transactions, payments, vaccinations',
        icon: '💰',
        filters: {},
        sheets: {
            ...ALL_OFF,
            include_transactions: true,
            include_vaccinations: true,
            include_stock: true,
        },
    },
    {
        id: 'clinical',
        label: 'Clinical',
        desc: 'Diagnoses, prescriptions, medication schedules',
        icon: '🏥',
        filters: {},
        sheets: {
            ...ALL_OFF,
            include_diagnoses: true,
            include_prescriptions: true,
            include_medications: true,
        },
    },
    {
        id: 'reminders',
        label: 'Reminders',
        desc: 'Reminder delivery log only',
        icon: '🔔',
        filters: {},
        sheets: { ...ALL_OFF, include_reminders: true },
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Colour helpers
// ─────────────────────────────────────────────────────────────────────────────

const BADGE: Record<string, string> = {
    teal: 'bg-teal-50    border-teal-200    text-teal-800',
    violet: 'bg-violet-50  border-violet-200  text-violet-800',
    pink: 'bg-pink-50    border-pink-200    text-pink-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    blue: 'bg-blue-50    border-blue-200    text-blue-800',
    indigo: 'bg-indigo-50  border-indigo-200  text-indigo-800',
    cyan: 'bg-cyan-50    border-cyan-200    text-cyan-800',
    rose: 'bg-rose-50    border-rose-200    text-rose-800',
    amber: 'bg-amber-50   border-amber-200   text-amber-800',
    slate: 'bg-slate-50   border-slate-200   text-slate-700',
};

const CHECKED: Record<string, string> = {
    teal: 'bg-teal-500    border-teal-500',
    violet: 'bg-violet-500  border-violet-500',
    pink: 'bg-pink-500    border-pink-500',
    emerald: 'bg-emerald-500 border-emerald-500',
    blue: 'bg-blue-500    border-blue-500',
    indigo: 'bg-indigo-500  border-indigo-500',
    cyan: 'bg-cyan-500    border-cyan-500',
    rose: 'bg-rose-500    border-rose-500',
    amber: 'bg-amber-500   border-amber-500',
    slate: 'bg-slate-500   border-slate-500',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function ReportsPage() {
    // Filter state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [patientType, setPatientType] = useState('');
    const [patientStatus, setPatientStatus] = useState('');
    const [sheets, setSheets] = useState<Record<SheetKey, boolean>>({ ...ALL_ON });

    // UI state
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [histCounter, setHistCounter] = useState(0);

    const selectedCount = Object.values(sheets).filter(Boolean).length;

    // ── Apply a preset ────────────────────────────────────────────────────
    const applyPreset = (preset: Preset) => {
        setDateFrom(preset.filters.date_from ?? '');
        setDateTo(preset.filters.date_to ?? '');
        setPatientType(preset.filters.patient_type ?? '');
        setPatientStatus(preset.filters.patient_status ?? '');
        setSheets({ ...ALL_OFF, ...preset.sheets } as Record<SheetKey, boolean>);
        setError(null);
    };

    // ── Toggle all ────────────────────────────────────────────────────────
    const toggleAll = () =>
        setSheets(selectedCount === SHEETS.length ? { ...ALL_OFF } : { ...ALL_ON });

    // ── Export ────────────────────────────────────────────────────────────
    const handleExport = useCallback(async () => {
        if (selectedCount === 0) {
            setError('Please select at least one sheet to export.');
            return;
        }
        setError(null);
        setDownloading(true);
        setProgress(0);

        const filters: ReportFilters = {
            ...(dateFrom && { date_from: dateFrom }),
            ...(dateTo && { date_to: dateTo }),
            ...(patientType && { patient_type: patientType as any }),
            ...(patientStatus && { patient_status: patientStatus as any }),
            ...sheets,
        };

        const label = buildLabel(filters);

        try {
            await reportService.exportExcel(filters, setProgress);
            const id = histCounter + 1;
            setHistCounter(id);
            setHistory(prev => [{
                id, timestamp: new Date().toLocaleString('en-GH'),
                label, sheets: selectedCount, status: 'success',
            }, ...prev.slice(0, 9)]);
        } catch (e: any) {
            const msg = e?.response?.data?.detail ?? e?.message ?? 'Export failed.';
            setError(msg);
            const id = histCounter + 1;
            setHistCounter(id);
            setHistory(prev => [{
                id, timestamp: new Date().toLocaleString('en-GH'),
                label, sheets: selectedCount, status: 'error',
            }, ...prev.slice(0, 9)]);
        } finally {
            setDownloading(false);
            setProgress(0);
        }
    }, [dateFrom, dateTo, patientType, patientStatus, sheets, selectedCount, histCounter]);

    return (
        <div className="space-y-6 pb-10 max-w-5xl mx-auto">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="text-2xl">📥</span> Reports & Data Export
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Export facility data to Excel. Select sheets and filters, then download.
                    </p>
                </div>
            </div>

            {/* ── Quick presets ──────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Quick Presets
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {PRESETS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => applyPreset(p)}
                            className="flex flex-col items-center gap-1.5 p-3 bg-white border border-slate-200 rounded-xl
                hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm transition-all text-center group"
                        >
                            <span className="text-2xl">{p.icon}</span>
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-teal-800 leading-tight">
                                {p.label}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-snug">{p.desc}</span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Filters + export button ──────────────────────────────────── */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Date range */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Date Range
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs text-slate-500 font-medium block mb-1">From</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    max={dateTo || todayISO()}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-medium block mb-1">To</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom}
                                    max={todayISO()}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                                />
                            </div>
                            {(dateFrom || dateTo) && (
                                <button
                                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                                >
                                    Clear dates
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Patient filters */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Patient Filter
                        </h3>
                        <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">Type</label>
                            <select
                                value={patientType}
                                onChange={e => setPatientType(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                            >
                                <option value="">All types</option>
                                <option value="pregnant">Pregnant</option>
                                <option value="regular">Regular</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">Status</label>
                            <select
                                value={patientStatus}
                                onChange={e => setPatientStatus(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                            >
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="postpartum">Postpartum</option>
                                <option value="completed">Completed</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Export button + progress */}
                    <div className="space-y-2">
                        {error && (
                            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                                <span className="text-rose-500 text-sm shrink-0">⚠️</span>
                                <p className="text-xs text-rose-700">{error}</p>
                            </div>
                        )}
                        <button
                            onClick={handleExport}
                            disabled={downloading || selectedCount === 0}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                font-semibold text-sm transition-all
                ${downloading || selectedCount === 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md active:scale-[0.98]'
                                }`}
                        >
                            {downloading ? (
                                <>
                                    <span className="animate-spin">⟳</span>
                                    {progress > 0 ? `Downloading ${progress}%…` : 'Generating…'}
                                </>
                            ) : (
                                <>
                                    <DownloadIcon />
                                    Export {selectedCount} Sheet{selectedCount !== 1 ? 's' : ''} to Excel
                                </>
                            )}
                        </button>

                        {downloading && progress > 0 && (
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}

                        {selectedCount === 0 && (
                            <p className="text-xs text-center text-slate-400">
                                Select at least one sheet to enable export
                            </p>
                        )}
                    </div>

                    {/* Active filter summary */}
                    {(dateFrom || dateTo || patientType || patientStatus) && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Active Filters
                            </p>
                            {dateFrom && <FilterPill label="From" value={dateFrom} />}
                            {dateTo && <FilterPill label="To" value={dateTo} />}
                            {patientType && <FilterPill label="Type" value={patientType} />}
                            {patientStatus && <FilterPill label="Status" value={patientStatus} />}
                        </div>
                    )}
                </div>

                {/* ── Sheet selector ─────────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Select Sheets
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {selectedCount} of {SHEETS.length} sheets selected
                                </p>
                            </div>
                            <button
                                onClick={toggleAll}
                                className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50"
                            >
                                {selectedCount === SHEETS.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {SHEETS.map(sheet => {
                                const checked = sheets[sheet.key];
                                return (
                                    <button
                                        key={sheet.key}
                                        onClick={() => setSheets(s => ({ ...s, [sheet.key]: !s[sheet.key] }))}
                                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all
                      ${checked
                                                ? `${BADGE[sheet.color]} shadow-sm`
                                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                            }`}
                                    >
                                        {/* Checkbox visual */}
                                        <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border-2 transition-all
                      ${checked ? CHECKED[sheet.color] : 'border-slate-300 bg-white'}`}
                                        >
                                            {checked && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2"
                                                        strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm">{sheet.icon}</span>
                                                <span className={`text-xs font-bold ${checked ? '' : 'text-slate-700'}`}>
                                                    {sheet.label}
                                                </span>
                                            </div>
                                            <p className="text-[10px] mt-0.5 text-slate-400 leading-snug">
                                                {sheet.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* What's included notice */}
                    {selectedCount > 0 && (
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5">
                            <p className="text-xs font-semibold text-teal-800 mb-1.5">
                                Your export will include:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {SHEETS.filter(s => sheets[s.key]).map(s => (
                                    <span key={s.key}
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${BADGE[s.color]}`}
                                    >
                                        {s.icon} {s.label}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-teal-600 mt-2">
                                The exported file will also include a <strong>Summary</strong> sheet with record counts.
                                {(dateFrom || dateTo || patientType || patientStatus) &&
                                    ' Active filters will be applied to patient-linked data.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Export history ─────────────────────────────────────────────── */}
            {history.length > 0 && (
                <section>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Session Export History
                    </h2>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {history.map(h => (
                                <div key={h.id} className="flex items-center gap-3 px-5 py-3">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${h.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 font-medium truncate">{h.label}</p>
                                        <p className="text-xs text-slate-400">{h.sheets} sheets · {h.timestamp}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.status === 'success'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-rose-50 text-rose-700'
                                        }`}>
                                        {h.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function FilterPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium w-10">{label}</span>
            <span className="bg-white border border-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-lg">
                {value}
            </span>
        </div>
    );
}

function buildLabel(filters: ReportFilters): string {
    const parts: string[] = [];
    if (filters.date_from || filters.date_to) {
        parts.push(`${filters.date_from ?? '∞'} → ${filters.date_to ?? '∞'}`);
    }
    if (filters.patient_type) parts.push(filters.patient_type);
    if (filters.patient_status) parts.push(filters.patient_status);
    return parts.length ? parts.join(' · ') : 'All data';
}

function DownloadIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    );
}