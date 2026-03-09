import { useState } from 'react';
import type { PregnantPatient } from '../../types/patient';
import type { Pregnancy } from '../../types/pregnancy';
import { usePregnancies } from '../../hooks/usePregnancy';
import { useMotherChildren } from '../../hooks/useChildren';
import { SectionCard } from '../common/index';
import { Button } from '../common/Button';
import { EmptyState, LoadingSpinner } from '../common/index';
import { formatDate, PREGNANCY_OUTCOME_LABELS, PREGNANCY_OUTCOME_COLORS } from '../../utils/formatters';
import { OpenPregnancyModal, ClosePregnancyModal, UpdatePregnancyModal, AddChildModal, UpdateChildModal } from '.';

interface Props { patient: PregnantPatient; }

export function PregnancySection({ patient }: Props) {
    const { data: pregnancies, isLoading } = usePregnancies(patient.id);
    const { data: children = [] } = useMotherChildren(patient.id);

    const [openPregnancyModal, setOpenPregnancyModal] = useState(false);
    const [closeTarget, setCloseTarget] = useState<Pregnancy | null>(null);
    const [updateTarget, setUpdateTarget] = useState<Pregnancy | null>(null);
    const [addChildTarget, setAddChildTarget] = useState<Pregnancy | null>(null);
    const [updateChildTarget, setUpdateChildTarget] = useState<string | null>(null);

    const hasActivePregnancy = !!patient.active_pregnancy;

    if (isLoading) return <LoadingSpinner />;

    const childForUpdate = children.find(c => c.id === updateChildTarget) ?? null;

    return (
        <div className="space-y-4">
            {/* Pregnancies */}
            <SectionCard
                title="Pregnancy Episodes"
                subtitle={`${patient.gravida} total · ${patient.para} deliveries`}
                action={
                    !hasActivePregnancy ? (
                        <Button size="sm" onClick={() => setOpenPregnancyModal(true)}>+ New Pregnancy</Button>
                    ) : undefined
                }
            >
                {!pregnancies?.length ? (
                    <EmptyState title="No pregnancies recorded" icon={<span className="text-xl">🤰</span>} />
                ) : (
                    <div className="space-y-3">
                        {pregnancies.map(preg => (
                            <PregnancyCard
                                key={preg.id}
                                pregnancy={preg}
                                onClose={() => setCloseTarget(preg)}
                                onEdit={() => setUpdateTarget(preg)}
                                onAddChild={() => setAddChildTarget(preg)}
                            />
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Children */}
            {children.length > 0 && (
                <SectionCard title="Children" subtitle={`${children.length} child${children.length > 1 ? 'ren' : ''} recorded`}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {children.map(child => (
                            <div key={child.id} className="border border-slate-200 rounded-xl p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">{child.name || 'Unnamed child'}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">DOB: {formatDate(child.date_of_birth)}</p>
                                        {child.sex && <p className="text-xs text-slate-500">{child.sex}</p>}
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => setUpdateChildTarget(child.id)}>Update</Button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${child.six_month_checkup_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {child.six_month_checkup_completed ? '✓ 6-Month Done' : '⏳ 6-Month Pending'}
                                    </span>
                                    {child.hep_b_antibody_test_result && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${child.hep_b_antibody_test_result === 'positive' ? 'bg-red-100 text-red-700' :
                                            child.hep_b_antibody_test_result === 'negative' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            Hep B: {child.hep_b_antibody_test_result}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Modals */}
            <OpenPregnancyModal open={openPregnancyModal} onClose={() => setOpenPregnancyModal(false)} patientId={patient.id} />
            {closeTarget && <ClosePregnancyModal open onClose={() => setCloseTarget(null)} pregnancy={closeTarget} patientId={patient.id} />}
            {updateTarget && <UpdatePregnancyModal open onClose={() => setUpdateTarget(null)} pregnancy={updateTarget} patientId={patient.id} />}
            {addChildTarget && <AddChildModal open onClose={() => setAddChildTarget(null)} pregnancy={addChildTarget} patientId={patient.id} />}
            {childForUpdate && <UpdateChildModal open onClose={() => setUpdateChildTarget(null)} child={childForUpdate} patientId={patient.id} />}
        </div>
    );
}

// ── Inline pregnancy card ─────────────────────────────────────────────────────

function PregnancyCard({ pregnancy, onClose, onEdit, onAddChild }: {
    pregnancy: Pregnancy;
    onClose: () => void;
    onEdit: () => void;
    onAddChild: () => void;
}) {
    const [expanded, setExpanded] = useState(pregnancy.is_active);

    return (
        <div className={`border rounded-xl overflow-hidden ${pregnancy.is_active ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200'}`}>
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">Pregnancy #{pregnancy.pregnancy_number}</span>
                    {pregnancy.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Active</span>
                    ) : pregnancy.outcome ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PREGNANCY_OUTCOME_COLORS[pregnancy.outcome]}`}>
                            {PREGNANCY_OUTCOME_LABELS[pregnancy.outcome]}
                        </span>
                    ) : null}
                    {pregnancy.expected_delivery_date && pregnancy.is_active && (
                        <span className="text-xs text-slate-500">EDD: {formatDate(pregnancy.expected_delivery_date)}</span>
                    )}
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <InfoItem label="LMP" value={formatDate(pregnancy.lmp_date)} />
                        <InfoItem label="EDD" value={formatDate(pregnancy.expected_delivery_date)} />
                        {pregnancy.gestational_age_weeks != null && (
                            <InfoItem label="Gestational Age" value={`${pregnancy.gestational_age_weeks} weeks`} />
                        )}
                        {pregnancy.actual_delivery_date && (
                            <InfoItem label="Delivered" value={formatDate(pregnancy.actual_delivery_date)} />
                        )}
                    </div>
                    {pregnancy.risk_factors && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
                            ⚠️ Risk factors: {pregnancy.risk_factors}
                        </div>
                    )}
                    {pregnancy.notes && <p className="text-xs text-slate-500">{pregnancy.notes}</p>}

                    <div className="flex flex-wrap gap-2 pt-1">
                        {pregnancy.is_active && (
                            <>
                                <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
                                <Button size="sm" variant="outline" onClick={onAddChild}>+ Add Child</Button>
                                <Button size="sm" variant="danger" onClick={onClose}>Close Pregnancy</Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value}</p>
        </div>
    );
}