import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField, Input, Select, Textarea } from '../common/index';
import {
    useCreateVaccinePurchase,
    useCreatePayment,
    useAdministerVaccination,
    usePurchase,
    useEligibility,
} from '../../hooks/useVaccinePurchase';
import { useToast } from '../../context/ToastContext';
import { vaccineService } from '../../services/vaccineService';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../utils/formatters';
import type { Vaccine } from '../../types/vaccine';

// ── Vaccine Picker ────────────────────────────────────────────────────────────
// Replaces <select> with a searchable scrollable list.

function VaccinePicker({
    vaccines,
    selected,
    onSelect,
}: {
    vaccines: Vaccine[];
    selected: Vaccine | null;
    onSelect: (v: Vaccine) => void;
}) {
    const [query, setQuery] = useState('');

    const filtered = vaccines.filter(v =>
        v.vaccine_name.toLowerCase().includes(query.toLowerCase()) ||
        v.batch_number?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-2">
            <Input
                placeholder="Search by name or batch…"
                value={query}
                onChange={e => setQuery(e.target.value)}
            />

            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">No vaccines found</div>
                ) : (
                    filtered.map(v => {
                        const inStock = (v.quantity ?? 0) > 0;
                        const isSelected = selected?.id === v.id;
                        return (
                            <button
                                key={v.id}
                                type="button"
                                disabled={!inStock}
                                onClick={() => onSelect(v)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors border-b border-slate-100 last:border-0
                  ${isSelected
                                        ? 'bg-teal-50 border-teal-200'
                                        : inStock
                                            ? 'hover:bg-slate-50'
                                            : 'opacity-40 cursor-not-allowed bg-slate-50'
                                    }`}
                            >
                                <div className="min-w-0">
                                    <p className={`font-medium truncate ${isSelected ? 'text-teal-800' : 'text-slate-900'}`}>
                                        {v.vaccine_name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{v.batch_number}</p>
                                </div>
                                <div className="shrink-0 text-right ml-4 space-y-0.5">
                                    <p className={`text-sm font-semibold ${isSelected ? 'text-teal-700' : 'text-slate-700'}`}>
                                        {formatCurrency(v.price_per_dose)}<span className="font-normal text-xs text-slate-400">/dose</span>
                                    </p>
                                    <p className={`text-xs font-medium ${(v.quantity ?? 0) < 50 ? 'text-amber-600' : 'text-emerald-600'
                                        }`}>
                                        {inStock ? `${v.quantity} in stock` : 'Out of stock'}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {selected && (
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Selected: <span className="font-medium text-slate-700">{selected.vaccine_name}</span></span>
                    <button
                        type="button"
                        onClick={() => onSelect(null as any)}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Purchase Vaccine Modal ────────────────────────────────────────────────────

export function PurchaseVaccineModal({
    open, onClose, patientId,
}: {
    open: boolean; onClose: () => void; patientId: string;
}) {
    const { showError } = useToast();
    const mutation = useCreateVaccinePurchase();
    const { data: vaccinesData } = useQuery({
        queryKey: ['vaccines', { publishedOnly: true }],
        queryFn: () => vaccineService.getVaccines(1, 100, true),
        enabled: open,
    });

    const vaccines = vaccinesData?.items ?? [];
    const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
    const [totalDoses, setTotalDoses] = useState('3');

    const estimatedTotal = selectedVaccine
        ? selectedVaccine.price_per_dose * Number(totalDoses || 0)
        : 0;

    const handleClose = () => {
        setSelectedVaccine(null);
        setTotalDoses('3');
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedVaccine) { showError('Please select a vaccine.'); return; }
        const doses = Number(totalDoses);
        if (!totalDoses || isNaN(doses) || doses < 1) { showError('Doses must be at least 1.'); return; }
        try {
            await mutation.mutateAsync({
                patientId,
                data: { vaccine_id: selectedVaccine.id, total_doses: doses },
            });
            handleClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Purchase failed.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Purchase Vaccine"
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Confirm Purchase</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Select Vaccine" required>
                    <VaccinePicker
                        vaccines={vaccines}
                        selected={selectedVaccine}
                        onSelect={setSelectedVaccine}
                    />
                </FormField>

                <FormField label="Number of Doses" required>
                    <Input
                        type="number"
                        min={1}
                        max={3}
                        value={totalDoses}
                        onChange={e => setTotalDoses(e.target.value)}
                    />
                </FormField>

                {selectedVaccine && Number(totalDoses) > 0 && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg px-4 py-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Price per dose</span>
                            <span className="font-medium">{formatCurrency(selectedVaccine.price_per_dose)}</span>
                        </div>
                        <div className="flex justify-between mt-1 pt-2 border-t border-teal-100">
                            <span className="font-medium text-slate-700">Total package</span>
                            <span className="font-bold text-teal-700">{formatCurrency(estimatedTotal)}</span>
                        </div>
                    </div>
                )}

                <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Full payment is not required upfront. Doses are administered based on amount paid.
                </p>
            </div>
        </Modal>
    );
}

// ── Record Payment Modal ──────────────────────────────────────────────────────

export function RecordPaymentModal({
    open, onClose, purchaseId, patientId,
}: {
    open: boolean; onClose: () => void; purchaseId: string; patientId: string;
}) {
    const { showError } = useToast();
    const mutation = useCreatePayment();
    const { data: purchase } = usePurchase(purchaseId);
    const [form, setForm] = useState({
        amount: '',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: 'cash',
        reference_number: '',
        notes: '',
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const balance = purchase?.balance ?? 0;

    const handleSubmit = async () => {
        const amount = parseFloat(form.amount);
        if (!form.amount || isNaN(amount) || amount <= 0) { showError('Enter a valid amount.'); return; }
        if (amount > balance) { showError(`Amount exceeds balance of ${formatCurrency(balance)}.`); return; }
        try {
            await mutation.mutateAsync({
                purchaseId,
                data: {
                    amount,
                    payment_date: form.payment_date,
                    payment_method: form.payment_method,
                    reference_number: form.reference_number || undefined,
                    notes: form.notes || undefined,
                },
            });
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Payment failed.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Record Payment"
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending}>Record Payment</Button>
                </>
            }
        >
            {purchase && (
                <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 text-sm space-y-1">
                    <div className="flex justify-between text-slate-500">
                        <span>Total</span><span>{formatCurrency(purchase.total_package_price)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                        <span>Paid</span><span>{formatCurrency(purchase.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-slate-200 pt-1 mt-1">
                        <span>Balance</span>
                        <span className="text-amber-700">{formatCurrency(balance)}</span>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Amount (GHS)" required>
                        <Input type="number" min={0} step={0.01} placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} />
                    </FormField>
                    <FormField label="Date" required>
                        <Input type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} />
                    </FormField>
                </div>
                <FormField label="Payment Method">
                    <Select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
                        <option value="cash">Cash</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                    </Select>
                </FormField>
                <FormField label="Reference Number">
                    <Input placeholder="Optional" value={form.reference_number} onChange={e => set('reference_number', e.target.value)} />
                </FormField>
                <FormField label="Notes">
                    <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

// ── Administer Dose Modal ─────────────────────────────────────────────────────

export function AdministerDoseModal({
    open, onClose, purchaseId, patientId,
}: {
    open: boolean; onClose: () => void; purchaseId: string; patientId: string;
}) {
    const { showError } = useToast();
    const mutation = useAdministerVaccination();
    const { data: purchase } = usePurchase(purchaseId);
    const { data: eligibility } = useEligibility(purchaseId);
    const [form, setForm] = useState({
        dose_date: new Date().toISOString().slice(0, 10),
        notes: '',
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const canAdminister = eligibility?.eligible;
    const nextDose = eligibility?.next_dose_number;

    const handleSubmit = async () => {
        if (!canAdminister) { showError('Patient is not eligible for this dose.'); return; }
        try {
            await mutation.mutateAsync({
                purchaseId,
                data: { dose_date: form.dose_date, notes: form.notes || undefined },
            });
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Administration failed.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Administer Dose"
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={mutation.isPending} disabled={!canAdminister}>
                        Confirm Administration
                    </Button>
                </>
            }
        >
            {purchase && (
                <p className="text-sm font-medium text-slate-700 mb-4">{purchase.vaccine_name}</p>
            )}

            {eligibility && !eligibility.eligible && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-800">
                    🚫 {eligibility.message}
                </div>
            )}

            {eligibility?.eligible && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4 text-sm text-emerald-800">
                    ✓ Eligible for Dose {nextDose} of {eligibility.total_doses}
                    <span className="ml-2 text-xs text-emerald-600">
                        ({eligibility.doses_paid_for - eligibility.doses_administered} dose{eligibility.doses_paid_for - eligibility.doses_administered !== 1 ? 's' : ''} paid &amp; ready)
                    </span>
                </div>
            )}

            <div className="space-y-4">
                <FormField label="Administration Date" required>
                    <Input type="date" value={form.dose_date} onChange={e => set('dose_date', e.target.value)} />
                </FormField>
                <FormField label="Notes">
                    <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}