import { useState } from 'react';
import type { ElementType } from 'react';
import type { PregnantPatient } from '../../types/patient';
import type { Pregnancy } from '../../types/pregnancy';
import type { Child } from '../../types/child';
import { usePregnancies } from '../../hooks/usePregnancy';
import { useMotherChildren } from '../../hooks/useChildren';
import { Button } from '../common/Button';
import { EmptyState, LoadingSpinner } from '../common/index';
import { formatDate, PREGNANCY_OUTCOME_LABELS } from '../../utils/formatters';

import {
    Baby, Calendar, AlertTriangle, ChevronDown,
    CheckCircle2, Clock, FlaskConical, Edit2, Plus,
    HeartPulse, Activity,
} from 'lucide-react';
import { AddChildModal, ClosePregnancyModal, OpenPregnancyModal, UpdateChildModal, UpdatePregnancyModal } from '.';

interface Props { patient: PregnantPatient; }

export function PregnancySection({ patient }: Props) {
    const { data: pregnancies = [], isLoading } = usePregnancies(patient.id);
    const { data: children = [] } = useMotherChildren(patient.id);

    const [openPregnancyModal, setOpenPregnancyModal] = useState(false);
    const [closeTarget, setCloseTarget] = useState<Pregnancy | null>(null);
    const [updateTarget, setUpdateTarget] = useState<Pregnancy | null>(null);
    const [addChildTarget, setAddChildTarget] = useState<Pregnancy | null>(null);
    const [updateChildId, setUpdateChildId] = useState<string | null>(null);

    const hasActive = !!patient.active_pregnancy;
    const activePreg = pregnancies.find(p => p.is_active) ?? null;
    const pastPregs = pregnancies.filter(p => !p.is_active);
    const childForUpdate = children.find(c => c.id === updateChildId) ?? null;
    const pendingChildChecks = children.filter(c => !c.six_month_checkup_completed);
    const pendingHepBTests = children.filter(c => !c.hep_b_antibody_test_result || c.hep_b_antibody_test_result === 'pending');

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
                <PregnancyMetric label="Active Pregnancy" value={activePreg ? `#${activePreg.pregnancy_number}` : 'None'} icon={HeartPulse} tone={activePreg ? 'purple' : 'slate'} />
                <PregnancyMetric label="History" value={String(pastPregs.length)} icon={Calendar} />
                <PregnancyMetric label="Children" value={String(children.length)} icon={Baby} tone={children.length ? 'pink' : 'slate'} />
                <PregnancyMetric label="Follow-up Items" value={String(pendingChildChecks.length + pendingHepBTests.length)} icon={FlaskConical} tone={pendingChildChecks.length || pendingHepBTests.length ? 'amber' : 'slate'} />
            </div>

            {/* ── No pregnancies at all ─────────────────────────────────── */}
            {!pregnancies.length && (
                <div className="bg-white border border-slate-200 p-8">
                    <EmptyState
                        icon={<Baby className="w-8 h-8 text-slate-300" />}
                        title="No pregnancy records"
                        description="Open a new pregnancy episode to begin tracking."
                        action={<Button onClick={() => setOpenPregnancyModal(true)}>+ Open Pregnancy</Button>}
                    />
                </div>
            )}

            {/* ── Active pregnancy hero panel ───────────────────────────── */}
            {activePreg && (
                <ActivePregnancyPanel
                    pregnancy={activePreg}
                    onEdit={() => setUpdateTarget(activePreg)}
                    onClose={() => setCloseTarget(activePreg)}
                    onAddChild={() => setAddChildTarget(activePreg)}
                />
            )}

            {/* ── + New pregnancy button (only when no active one) ─────── */}
            {!hasActive && pregnancies.length > 0 && (
                <div className="flex justify-end">
                    <Button size="sm" onClick={() => setOpenPregnancyModal(true)}>
                        + Open New Pregnancy
                    </Button>
                </div>
            )}

            {/* ── Children ─────────────────────────────────────────────── */}
            {children.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Child Management</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {children.length} child{children.length > 1 ? 'ren' : ''} on record
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {children.map(child => (
                            <ChildCard
                                key={child.id}
                                child={child}
                                onUpdate={() => setUpdateChildId(child.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Pregnancy history ────────────────────────────────────── */}
            {pastPregs.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-bold text-slate-800">Pregnancy History</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-medium">
                            {pastPregs.length}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {pastPregs.map(preg => (
                            <PastPregnancyRow
                                key={preg.id}
                                pregnancy={preg}
                                onAddChild={() => setAddChildTarget(preg)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Modals ───────────────────────────────────────────────── */}
            <OpenPregnancyModal open={openPregnancyModal} onClose={() => setOpenPregnancyModal(false)} patientId={patient.id} />
            {closeTarget && <ClosePregnancyModal open onClose={() => setCloseTarget(null)} pregnancy={closeTarget} patientId={patient.id} />}
            {updateTarget && <UpdatePregnancyModal open onClose={() => setUpdateTarget(null)} pregnancy={updateTarget} patientId={patient.id} />}
            {addChildTarget && <AddChildModal open onClose={() => setAddChildTarget(null)} pregnancy={addChildTarget} patientId={patient.id} />}
            {childForUpdate && <UpdateChildModal open onClose={() => setUpdateChildId(null)} child={childForUpdate} patientId={patient.id} />}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active Pregnancy Panel
// ─────────────────────────────────────────────────────────────────────────────

function ActivePregnancyPanel({
    pregnancy, onEdit, onClose, onAddChild,
}: {
    pregnancy: Pregnancy;
    onEdit: () => void;
    onClose: () => void;
    onAddChild: () => void;
}) {
    const edd = pregnancy.expected_delivery_date ? new Date(pregnancy.expected_delivery_date) : null;
    const today = new Date();
    const daysLeft = edd ? Math.ceil((edd.getTime() - today.getTime()) / 86_400_000) : null;

    const daysLeftLabel = daysLeft == null
        ? null
        : daysLeft < 0
            ? `${Math.abs(daysLeft)} days overdue`
            : daysLeft === 0
                ? 'Due today'
                : `${daysLeft} days to EDD`;

    const daysLeftColor = daysLeft == null
        ? ''
        : daysLeft < 0
            ? 'text-red-600 bg-red-50 border-red-200'
            : daysLeft <= 14
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200';

    return (
        <div className="bg-white border border-purple-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 px-5 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 flex items-center justify-center">
                            <HeartPulse className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Active Pregnancy · #{pregnancy.pregnancy_number}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {pregnancy.gestational_age_weeks != null ? `${pregnancy.gestational_age_weeks} weeks gestation` : 'Gestation not recorded'}
                            </p>
                        </div>
                    </div>

                    {daysLeftLabel && (
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${daysLeftColor}`}>
                            {daysLeftLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Clinical dates grid */}
            <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <DateCell icon={Calendar} label="LMP" value={formatDate(pregnancy.lmp_date)} />
                    <DateCell icon={Baby} label="Expected Delivery" value={formatDate(pregnancy.expected_delivery_date)} accent />
                    <DateCell icon={Activity} label="Gestational Age"
                        value={pregnancy.gestational_age_weeks != null ? `${pregnancy.gestational_age_weeks} wks` : '—'} />
                    <DateCell icon={Activity} label="Pregnancy #" value={`#${pregnancy.pregnancy_number}`} />
                </div>

                {/* Risk factors */}
                {pregnancy.risk_factors && (
                    <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Risk Factors</p>
                            <p className="text-sm text-amber-900">{pregnancy.risk_factors}</p>
                        </div>
                    </div>
                )}

                {/* Notes */}
                {pregnancy.notes && (
                    <p className="mt-3 text-sm text-slate-500 italic border-t border-slate-100 pt-3">
                        {pregnancy.notes}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Button size="sm" variant="outline" onClick={onEdit}>
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={onAddChild}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Child
                    </Button>
                    <Button size="sm" variant="danger" onClick={onClose}>
                        Close Pregnancy
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Child Card
// ─────────────────────────────────────────────────────────────────────────────

function ChildCard({ child, onUpdate }: { child: Child; onUpdate: () => void }) {
    const dob = child.date_of_birth ? new Date(child.date_of_birth) : null;
    const ageMonths = dob ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : null;
    const ageLabel = ageMonths == null ? null : ageMonths < 12 ? `${ageMonths}mo` : `${Math.floor(ageMonths / 12)}yr ${ageMonths % 12}mo`;

    const hepBColor: Record<string, string> = {
        positive: 'bg-red-100 text-red-700 border-red-200',
        negative: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        pending: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            {/* Card top */}
            <div className="px-4 py-3.5 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                    <Baby className="w-4.5 h-4.5 w-[18px] h-[18px] text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{child.name || 'Unnamed child'}</p>
                    <p className="text-xs text-slate-400">
                        {child.sex ? capitalize(child.sex) + ' · ' : ''}{formatDate(child.date_of_birth)}
                        {ageLabel ? ` · ${ageLabel}` : ''}
                    </p>
                </div>
                <button
                    onClick={onUpdate}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Status badges */}
            <div className="px-4 py-3 flex flex-wrap gap-2">
                {/* 6-month checkup */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${child.six_month_checkup_completed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {child.six_month_checkup_completed
                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                        : <Clock className="w-3.5 h-3.5" />}
                    {child.six_month_checkup_completed ? '6-Month Done' : '6-Month Pending'}
                </div>

                {/* 6-month date */}
                {child.six_month_checkup_date && !child.six_month_checkup_completed && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                        <Calendar className="w-3 h-3" />
                        Due {formatDate(child.six_month_checkup_date)}
                    </div>
                )}

                {/* Hep B result */}
                {child.hep_b_antibody_test_result ? (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${hepBColor[child.hep_b_antibody_test_result] ?? hepBColor.pending
                        }`}>
                        <FlaskConical className="w-3.5 h-3.5" />
                        Hep B: {capitalize(child.hep_b_antibody_test_result)}
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-50 text-slate-400 border-slate-200">
                        <FlaskConical className="w-3.5 h-3.5" />
                        Hep B: Not tested
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Past Pregnancy Row (collapsible)
// ─────────────────────────────────────────────────────────────────────────────

function PastPregnancyRow({ pregnancy, onAddChild }: { pregnancy: Pregnancy; onAddChild: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const childEntry = getClosedPregnancyChildEntryState(pregnancy);

    const outcomeColor: Record<string, string> = {
        live_birth: 'bg-emerald-100 text-emerald-700',
        stillbirth: 'bg-slate-200   text-slate-600',
        miscarriage: 'bg-amber-100   text-amber-700',
        abortion: 'bg-slate-100   text-slate-500',
        ectopic: 'bg-red-100     text-red-700',
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-slate-700">
                        Pregnancy #{pregnancy.pregnancy_number}
                    </span>
                    {pregnancy.outcome && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${outcomeColor[pregnancy.outcome] ?? 'bg-slate-100 text-slate-500'}`}>
                            {PREGNANCY_OUTCOME_LABELS[pregnancy.outcome] ?? pregnancy.outcome}
                        </span>
                    )}
                    {pregnancy.actual_delivery_date && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(pregnancy.actual_delivery_date)}
                        </span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <DateCell icon={Calendar} label="LMP" value={formatDate(pregnancy.lmp_date)} />
                        <DateCell icon={Calendar} label="EDD" value={formatDate(pregnancy.expected_delivery_date)} />
                        <DateCell icon={Calendar} label="Delivered" value={formatDate(pregnancy.actual_delivery_date)} />
                        <DateCell icon={Activity} label="Gestational Age" value={pregnancy.gestational_age_weeks != null ? `${pregnancy.gestational_age_weeks} wks` : '—'} />
                    </div>

                    {pregnancy.risk_factors && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><span className="font-semibold">Risk factors:</span> {pregnancy.risk_factors}</span>
                        </div>
                    )}

                    {pregnancy.notes && (
                        <p className="text-xs text-slate-500 italic">{pregnancy.notes}</p>
                    )}

                    {pregnancy.outcome === 'live_birth' && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <p className="text-xs text-slate-500">{childEntry.message}</p>
                            {childEntry.canAdd && (
                                <Button size="sm" variant="outline" onClick={onAddChild}>
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Child
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function getClosedPregnancyChildEntryState(pregnancy: Pregnancy): { canAdd: boolean; message: string } {
    if (pregnancy.is_active || pregnancy.outcome !== 'live_birth' || !pregnancy.actual_delivery_date) {
        return { canAdd: false, message: '' };
    }

    const delivered = new Date(`${pregnancy.actual_delivery_date}T00:00:00`);
    const deadline = new Date(delivered);
    deadline.setDate(deadline.getDate() + 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today <= deadline) {
        return {
            canAdd: true,
            message: `Child registration available until ${formatDate(deadline.toISOString().slice(0, 10))}.`,
        };
    }

    return {
        canAdd: false,
        message: 'Child registration window has ended. Admin access is required for late birth records.',
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────────────────────────────────────

function DateCell({ icon: Icon, label, value, accent = false }: {
    icon: ElementType; label: string; value: string; accent?: boolean;
}) {
    return (
        <div className={`rounded-xl px-3 py-2.5 border ${accent ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-1 mb-1">
                <Icon className={`w-3 h-3 ${accent ? 'text-purple-400' : 'text-slate-400'}`} />
                <p className={`text-[10px] font-semibold uppercase tracking-wide ${accent ? 'text-purple-500' : 'text-slate-400'}`}>{label}</p>
            </div>
            <p className={`text-sm font-bold ${accent ? 'text-purple-800' : 'text-slate-800'}`}>{value || '—'}</p>
        </div>
    );
}

function PregnancyMetric({ label, value, icon: Icon, tone = 'slate' }: {
    label: string;
    value: string;
    icon: ElementType;
    tone?: 'slate' | 'purple' | 'pink' | 'amber';
}) {
    const colors = {
        slate: 'border-slate-200 bg-white text-slate-700',
        purple: 'border-purple-200 bg-purple-50 text-purple-700',
        pink: 'border-pink-200 bg-pink-50 text-pink-700',
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

function capitalize(s?: string | null): string {
    if (!s) return '—';
    return s.charAt(0).toUpperCase() + s.slice(1);
}
