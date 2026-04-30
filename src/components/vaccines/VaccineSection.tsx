import { useState } from 'react';
import type { Patient } from '../../types/patient';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import {
    usePatientPurchases,
    usePurchasePayments,
    usePurchaseVaccinations,
    useEligibility,
} from '../../hooks/useVaccinePurchase';
import { SectionCard, EmptyState, LoadingSpinner } from '../common/index';
import { Button } from '../common/Button';
import { PaymentStatusBadge } from '../common/Badge';
import { formatDate, formatCurrency, getPaymentProgressPercent, getDoseLabel } from '../../utils/formatters';
import { AdministerDoseModal, PurchaseVaccineModal, RecordPaymentModal } from '.';
import { AlertTriangle, CheckCircle2, CircleDollarSign, Plus, Syringe } from 'lucide-react';


interface Props { patient: Patient; }

export function VaccineSection({ patient }: Props) {
    const { data: purchases = [], isLoading } = usePatientPurchases(patient.id);
    const [buyModal, setBuyModal] = useState(false);
    const [payTarget, setPayTarget] = useState<string | null>(null);
    const [adminTarget, setAdminTarget] = useState<string | null>(null);

    if (isLoading) return <LoadingSpinner />;
    const active = purchases.filter(p => p.is_active);
    const unpaid = purchases.filter(p => p.payment_status !== 'completed');
    const remainingDoses = purchases.reduce((sum, p) => sum + Math.max((p.total_doses ?? 0) - (p.doses_administered ?? 0), 0), 0);
    const completed = purchases.filter(p => p.total_doses && p.doses_administered >= p.total_doses);

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
                <VaccineMetric label="Active Packages" value={String(active.length)} icon={Syringe} tone={active.length ? 'teal' : 'slate'} />
                <VaccineMetric label="Payment Due" value={String(unpaid.length)} icon={CircleDollarSign} tone={unpaid.length ? 'amber' : 'slate'} />
                <VaccineMetric label="Doses Remaining" value={String(remainingDoses)} icon={AlertTriangle} tone={remainingDoses ? 'blue' : 'slate'} />
                <VaccineMetric label="Completed" value={String(completed.length)} icon={CheckCircle2} tone="slate" />
            </div>

            <SectionCard
                title="Vaccine Programme"
                subtitle="Hep B vaccination programme"
                action={<Button size="sm" onClick={() => setBuyModal(true)}><Plus className="mr-1 h-4 w-4" /> Purchase Vaccine</Button>}
            >
                {!purchases.length ? (
                    <EmptyState
                        icon={<Syringe className="h-6 w-6" />}
                        title="No vaccine purchases"
                        description="Purchase a vaccine to begin the immunisation programme."
                        action={<Button size="sm" onClick={() => setBuyModal(true)}>Purchase Vaccine</Button>}
                    />
                ) : (
                    <div className="space-y-4">
                        {purchases.map(p => (
                            <PurchaseCard
                                key={p.id}
                                purchase={p}
                                patientId={patient.id}
                                onPay={() => setPayTarget(p.id)}
                                onAdminister={() => setAdminTarget(p.id)}
                            />
                        ))}
                    </div>
                )}
            </SectionCard>

            <PurchaseVaccineModal open={buyModal} onClose={() => setBuyModal(false)} patientId={patient.id} />
            {payTarget && <RecordPaymentModal open onClose={() => setPayTarget(null)} purchaseId={payTarget} patientId={patient.id} />}
            {adminTarget && <AdministerDoseModal open onClose={() => setAdminTarget(null)} purchaseId={adminTarget} patientId={patient.id} />}
        </div>
    );
}

// ── Purchase card ─────────────────────────────────────────────────────────────

function PurchaseCard({ purchase, onPay, onAdminister }: {
    purchase: VaccinePurchase;
    patientId: string;
    onPay: () => void;
    onAdminister: () => void;
}) {
    const [expanded, setExpanded] = useState(purchase.is_active);
    const { data: payments = [] } = usePurchasePayments(purchase.id);
    const { data: vaccinations = [] } = usePurchaseVaccinations(purchase.id);
    // useEligibility is the short alias for useCheckEligibility
    const { data: eligibility } = useEligibility(purchase.id);

    const percent = getPaymentProgressPercent(purchase.amount_paid, purchase.total_package_price);
    const dosePercent = purchase.total_doses ? Math.round((purchase.doses_administered / purchase.total_doses) * 100) : 0;

    return (
        <div className={`border overflow-hidden ${purchase.is_active ? 'border-teal-200' : 'border-slate-200 opacity-75'}`}>
            {/* Header row */}
            <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-teal-100 flex items-center justify-center">
                        <Syringe className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{purchase.vaccine_name}</p>
                        <p className="text-xs text-slate-500">{formatDate(purchase.purchase_date)} · {purchase.total_doses} doses</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <PaymentStatusBadge status={purchase.payment_status} />
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-5 border-t border-slate-100">
                    {/* Payment progress */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Payment: {formatCurrency(purchase.amount_paid)} of {formatCurrency(purchase.total_package_price)}</span>
                            <span>{percent}%</span>
                        </div>
                            <div className="h-2 bg-slate-100 overflow-hidden">
                            <div className="h-full bg-teal-500 transition-all" style={{ width: `${percent}%` }} />
                        </div>
                    </div>

                    {/* Dose progress */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Doses: {purchase.doses_administered} of {purchase.total_doses} administered</span>
                            <span>{dosePercent}%</span>
                        </div>
                        <div className="flex gap-1.5">
                            {Array.from({ length: purchase.total_doses }).map((_, i) => (
                                <div key={i} className={`h-2.5 flex-1 ${i < purchase.doses_administered ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                    </div>

                    {/* Eligibility message */}
                    {eligibility && !eligibility.eligible && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{eligibility.message}</span>
                        </div>
                    )}

                    {/* Payment history */}
                    {payments.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment History</p>
                            <div className="space-y-1.5">
                                {payments.map(pmt => (
                                    <div key={pmt.id} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">{formatDate(pmt.payment_date)} · {pmt.payment_method ?? 'Cash'}</span>
                                        <span className="font-medium text-emerald-700">{formatCurrency(pmt.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vaccination history */}
                    {vaccinations.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Doses Administered</p>
                            <div className="space-y-1.5">
                                {vaccinations.map(v => (
                                    <div key={v.id} className="flex items-center gap-3 text-sm">
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium">{getDoseLabel(v.dose_number)}</span>
                                        <span className="text-slate-600">{formatDate(v.dose_date)}</span>
                                        <span className="text-slate-400 text-xs">Batch: {v.batch_number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {purchase.is_active && (
                        <div className="flex gap-2 pt-1">
                            {purchase.payment_status !== 'completed' && (
                                <Button size="sm" variant="outline" onClick={onPay}>Record Payment</Button>
                            )}
                            {eligibility?.eligible && (
                                <Button size="sm" onClick={onAdminister}>Administer Dose {purchase.doses_administered + 1}</Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function VaccineMetric({ label, value, icon: Icon, tone = 'slate' }: {
    label: string;
    value: string;
    icon: React.ElementType;
    tone?: 'slate' | 'teal' | 'amber' | 'blue';
}) {
    const colors = {
        slate: 'border-slate-200 bg-white text-slate-700',
        teal: 'border-teal-200 bg-teal-50 text-teal-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
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
