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
    const remainingDoses = purchases.reduce(
        (sum, p) => sum + Math.max((p.total_doses ?? 0) - (p.doses_administered ?? 0), 0),
        0,
    );
    const outstandingBalance = purchases.reduce((sum, p) => sum + Number(p.balance ?? 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                <VaccineMetric label="Active Packages" value={String(active.length)} icon={Syringe} tone={active.length ? 'teal' : 'slate'} />
                <VaccineMetric label="Packages Due" value={String(unpaid.length)} icon={CircleDollarSign} tone={unpaid.length ? 'amber' : 'slate'} />
                <VaccineMetric label="Doses Remaining" value={String(remainingDoses)} icon={AlertTriangle} tone={remainingDoses ? 'blue' : 'slate'} />
                <VaccineMetric label="Outstanding Balance" value={formatCurrency(outstandingBalance)} icon={CheckCircle2} tone={outstandingBalance ? 'amber' : 'slate'} />
            </div>

            <SectionCard
                title="Vaccine Programme"
                subtitle="Manage purchases, payments, and vaccine dosing for this patient"
                action={<Button size="sm" onClick={() => setBuyModal(true)}><Plus className="mr-1 h-4 w-4" /> Purchase Vaccine</Button>}
            >
                {!purchases.length ? (
                    <EmptyState
                        icon={<Syringe className="h-6 w-6" />}
                        title="No vaccine purchases yet"
                        description="This patient has no active vaccine packages. Start by purchasing a new vaccine."
                        action={<Button size="sm" onClick={() => setBuyModal(true)}>Purchase Vaccine</Button>}
                    />
                ) : (
                    <div className="space-y-5">
                        {purchases.map(purchase => (
                            <PurchaseCard
                                key={purchase.id}
                                purchase={purchase}
                                onPay={() => setPayTarget(purchase.id)}
                                onAdminister={() => setAdminTarget(purchase.id)}
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

function PurchaseCard({ purchase, onPay, onAdminister }: {
    purchase: VaccinePurchase;
    onPay: () => void;
    onAdminister: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const { data: payments = [] } = usePurchasePayments(purchase.id);
    const { data: vaccinations = [] } = usePurchaseVaccinations(purchase.id);
    const { data: eligibility } = useEligibility(purchase.id);

    const paymentPercent = getPaymentProgressPercent(purchase.amount_paid, purchase.total_package_price);
    const dosePercent = purchase.total_doses ? Math.round((purchase.doses_administered / purchase.total_doses) * 100) : 0;
    const hasBalance = purchase.balance > 0;
    const canAdminister = purchase.is_active && eligibility?.eligible;

    return (
        <div className={`rounded-2xl border overflow-hidden shadow-sm transition-shadow ${purchase.is_active ? 'border-slate-200 bg-white hover:shadow-lg' : 'border-slate-200 bg-slate-50 opacity-90'}`}>
            <button
                type="button"
                onClick={() => setExpanded(current => !current)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={expanded}
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <Syringe className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">{purchase.vaccine_name}</p>
                        <p className="truncate text-sm text-slate-500">{formatDate(purchase.purchase_date)} · {purchase.total_doses} doses · Batch {purchase.batch_number}</p>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-3">
                    <PaymentStatusBadge status={purchase.payment_status} />
                    <svg className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {expanded && (
                <div className="space-y-5 border-t border-slate-100 px-6 pb-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <ProgressCard title="Payment progress" value={`${percentageToLabel(paymentPercent)}`}>
                            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                                <span>{formatCurrency(purchase.amount_paid)} paid</span>
                                <span>{formatCurrency(purchase.total_package_price)} total</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all" style={{ width: `${paymentPercent}%` }} />
                            </div>
                        </ProgressCard>

                        <ProgressCard title="Dose status" value={`${purchase.doses_administered} / ${purchase.total_doses}`}>
                            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                                <span>{dosePercent}% completed</span>
                                <span>{purchase.total_doses - purchase.doses_administered} left</span>
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: purchase.total_doses }).map((_, index) => (
                                    <div key={index} className={`h-2.5 flex-1 rounded-full ${index < purchase.doses_administered ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                        </ProgressCard>
                    </div>

                    {eligibility && !eligibility.eligible && (
                        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4" />
                                <p>{eligibility.message}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <DetailRow label="Package total" value={formatCurrency(purchase.total_package_price)} />
                        <DetailRow label="Balance" value={formatCurrency(purchase.balance)} />
                        <DetailRow label="Price per dose" value={formatCurrency(purchase.price_per_dose)} />
                        <DetailRow
                      label="Status"
                      value={purchase.doses_administered >= (purchase.total_doses ?? 0) ? 'Completed' : purchase.is_active ? 'Active' : 'Inactive'}
                    />
                    </div>

                    {payments.length > 0 && (
                        <HistorySection heading="Payment history">
                            {payments.map(payment => (
                                <HistoryItem
                                    key={payment.id}
                                    label={`${formatDate(payment.payment_date)} · ${payment.payment_method ?? 'Cash'}`}
                                    value={formatCurrency(payment.amount)}
                                />
                            ))}
                        </HistorySection>
                    )}

                    {vaccinations.length > 0 && (
                        <HistorySection heading="Vaccination history">
                            {vaccinations.map(vaccination => (
                                <HistoryItem
                                    key={vaccination.id}
                                    label={`${getDoseLabel(vaccination.dose_number)} · ${formatDate(vaccination.dose_date)}`}
                                    value={`Batch ${vaccination.batch_number}`}
                                />
                            ))}
                        </HistorySection>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onPay}
                            disabled={!hasBalance}
                        >
                            Record Payment
                        </Button>
                        <Button
                            size="sm"
                            onClick={onAdminister}
                            disabled={!canAdminister}
                        >
                            Administer Dose {purchase.doses_administered + 1}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function percentageToLabel(percent: number) {
    if (percent === 0) return 'Not started';
    if (percent < 50) return 'In progress';
    if (percent < 100) return 'Almost done';
    return 'Completed';
}

function ProgressCard({ title, value, children }: { title: string; value: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3 gap-4">
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{value}</span>
            </div>
            {children}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 font-medium text-slate-900">{value}</p>
        </div>
    );
}

function HistorySection({ heading, children }: { heading: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">{heading}</p>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function HistoryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm text-slate-700">
            <span>{label}</span>
            <span className="font-medium text-slate-900">{value}</span>
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
        <div className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 ${colors[tone]}`}>
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
                <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-current shadow-sm">
                <Icon className="h-5 w-5 opacity-80" />
            </div>
        </div>
    );
}
