import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { AlertTriangle, Beaker, CheckCircle2, FilePlus2, Plus, TestTube2 } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input, Select, Textarea } from '../common';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAddLabResult, useCreateLabTest, useLabTests } from '../../hooks/useLabTests';
import type { Patient } from '../../types/patient';
import type { LabResultFlag, LabResultPayload, LabTest, LabTestType } from '../../services/labTestService';

const TEST_LABELS: Record<LabTestType, string> = {
    hep_b: 'Hep B',
    rft: 'RFT',
    lft: 'LFT',
};

const COMMON_COMPONENTS: Record<LabTestType, string[]> = {
    hep_b: ['HBsAg', 'Anti-HBs', 'HBeAg', 'HBV DNA'],
    rft: ['Creatinine', 'Urea', 'eGFR', 'Sodium', 'Potassium'],
    lft: ['ALT', 'AST', 'ALP', 'GGT', 'Bilirubin', 'Albumin'],
};

function formatDateTime(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function LabTestSection({ patient }: { patient: Patient }) {
    const { data: testsRaw, isLoading } = useLabTests(patient.id);
    const tests = Array.isArray(testsRaw) ? testsRaw : [];
    const [addTestOpen, setAddTestOpen] = useState(false);

    const abnormal = tests.filter(t => t.has_abnormal_results).length;
    const completed = tests.filter(t => t.status === 'completed').length;
    const latest = tests[0];

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Total Tests" value={String(tests.length)} icon={TestTube2} />
                <Metric label="Completed" value={String(completed)} icon={CheckCircle2} tone="emerald" />
                <Metric label="Abnormal" value={String(abnormal)} icon={AlertTriangle} tone={abnormal ? 'rose' : 'slate'} />
            </div>

            <section className="border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Lab Tests</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {latest ? `Latest ${latest.test_name} ordered ${formatDateTime(latest.ordered_at)}` : 'No lab tests recorded yet'}
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setAddTestOpen(true)}>
                        <FilePlus2 className="mr-1 h-4 w-4" />
                        Add Test
                    </Button>
                </div>

                {isLoading ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-400">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <Beaker className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No lab tests recorded</p>
                        <p className="mt-1 text-xs text-slate-400">Add Hep B, renal function, or liver function results.</p>
                        <Button size="sm" className="mt-4" onClick={() => setAddTestOpen(true)}>Add Test</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tests.map(test => <LabTestRow key={test.id} patientId={patient.id} test={test} />)}
                    </div>
                )}
            </section>

            <LabTestModal
                open={addTestOpen}
                onClose={() => setAddTestOpen(false)}
                patientId={patient.id}
            />
        </div>
    );
}

function LabTestRow({ patientId, test }: { patientId: string; test: LabTest }) {
    const [resultOpen, setResultOpen] = useState(false);
    const statusTone = test.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

    return (
        <>
            <div className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{test.test_name}</p>
                            <span className="bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{TEST_LABELS[test.test_type]}</span>
                            <span className={`px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone}`}>{test.status.replace('_', ' ')}</span>
                            {test.has_abnormal_results && (
                                <span className="inline-flex items-center gap-1 bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                    <AlertTriangle className="h-3 w-3" />
                                    Abnormal
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Ordered {formatDateTime(test.ordered_at)} · Reported {formatDateTime(test.reported_at)}
                        </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setResultOpen(true)}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Result
                    </Button>
                </div>

                <div className="mt-4 overflow-x-auto">
                    {test.results.length === 0 ? (
                        <p className="text-sm text-slate-400">No component results added.</p>
                    ) : (
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-400">
                                    <th className="py-2 pr-4">Component</th>
                                    <th className="py-2 pr-4">Value</th>
                                    <th className="py-2 pr-4">Range</th>
                                    <th className="py-2 pr-4">Indicator</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {test.results.map(result => (
                                    <tr key={result.id}>
                                        <td className="py-2 pr-4 font-medium text-slate-800">{result.component_name}</td>
                                        <td className="py-2 pr-4 text-slate-700">
                                            {result.value_numeric ?? result.value_text ?? '—'} {result.unit ?? ''}
                                        </td>
                                        <td className="py-2 pr-4 text-slate-500">
                                            {result.reference_min ?? '—'} - {result.reference_max ?? '—'} {result.unit ?? ''}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <ResultFlag flag={result.abnormal_flag} abnormal={result.is_abnormal} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <LabResultModal
                open={resultOpen}
                onClose={() => setResultOpen(false)}
                patientId={patientId}
                test={test}
            />
        </>
    );
}

function LabTestModal({ open, onClose, patientId }: { open: boolean; onClose: () => void; patientId: string }) {
    const { showSuccess, showError } = useToast();
    const createMutation = useCreateLabTest(patientId);
    const [form, setForm] = useState({ test_type: 'hep_b' as LabTestType, notes: '' });
    const busy = createMutation.isPending;

    const handleSubmit = async () => {
        try {
            await createMutation.mutateAsync({
                test_type: form.test_type,
                notes: form.notes.trim() || undefined,
            });
            showSuccess('Lab test added.');
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to add lab test.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add Lab Test"
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={busy}>Add Test</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Test Type">
                    <Select value={form.test_type} onChange={e => setForm(f => ({ ...f, test_type: e.target.value as LabTestType }))}>
                        <option value="hep_b">Hep B</option>
                        <option value="rft">RFT</option>
                        <option value="lft">LFT</option>
                    </Select>
                </FormField>
                <FormField label="Notes">
                    <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </FormField>
            </div>
        </Modal>
    );
}

function LabResultModal({
    open,
    onClose,
    patientId,
    test,
}: {
    open: boolean;
    onClose: () => void;
    patientId: string;
    test: LabTest;
}) {
    const { showSuccess, showError } = useToast();
    const addMutation = useAddLabResult(patientId);
    const componentOptions = useMemo(() => COMMON_COMPONENTS[test.test_type], [test.test_type]);
    const [form, setForm] = useState({
        component_name: componentOptions[0] ?? '',
        value_numeric: '',
        value_text: '',
        unit: '',
        reference_min: '',
        reference_max: '',
        abnormal_flag: 'normal' as LabResultFlag,
        notes: '',
    });
    const busy = addMutation.isPending;

    const parseNumber = (value: string) => value.trim() === '' ? undefined : Number(value);

    const handleSubmit = async () => {
        if (!form.component_name.trim()) {
            showError('Component name is required.');
            return;
        }
        if (!form.value_numeric.trim() && !form.value_text.trim()) {
            showError('Enter a numeric or text value.');
            return;
        }

        const payload: LabResultPayload = {
            component_name: form.component_name.trim(),
            value_numeric: parseNumber(form.value_numeric),
            value_text: form.value_text.trim() || undefined,
            unit: form.unit.trim() || undefined,
            reference_min: parseNumber(form.reference_min),
            reference_max: parseNumber(form.reference_max),
            abnormal_flag: form.abnormal_flag === 'normal' ? undefined : form.abnormal_flag,
            notes: form.notes.trim() || undefined,
        };

        try {
            await addMutation.mutateAsync({ testId: test.id, data: payload });
            showSuccess('Result added.');
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to add result.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Add Result: ${test.test_name}`}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={busy}>Add Result</Button>
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Component">
                    <Select value={form.component_name} onChange={e => setForm(f => ({ ...f, component_name: e.target.value }))}>
                        {componentOptions.map(component => <option key={component} value={component}>{component}</option>)}
                    </Select>
                </FormField>
                <FormField label="Unit">
                    <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="IU/L, umol/L, mmol/L" />
                </FormField>
                <FormField label="Numeric Value">
                    <Input type="number" step="any" value={form.value_numeric} onChange={e => setForm(f => ({ ...f, value_numeric: e.target.value }))} />
                </FormField>
                <FormField label="Text Value">
                    <Input value={form.value_text} onChange={e => setForm(f => ({ ...f, value_text: e.target.value }))} placeholder="Positive, negative, reactive" />
                </FormField>
                <FormField label="Reference Min">
                    <Input type="number" step="any" value={form.reference_min} onChange={e => setForm(f => ({ ...f, reference_min: e.target.value }))} />
                </FormField>
                <FormField label="Reference Max">
                    <Input type="number" step="any" value={form.reference_max} onChange={e => setForm(f => ({ ...f, reference_max: e.target.value }))} />
                </FormField>
                <FormField label="Manual Indicator">
                    <Select value={form.abnormal_flag} onChange={e => setForm(f => ({ ...f, abnormal_flag: e.target.value as LabResultFlag }))}>
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="low">Low</option>
                        <option value="high">High</option>
                        <option value="critical_low">Critical low</option>
                        <option value="critical_high">Critical high</option>
                    </Select>
                </FormField>
                <FormField label="Notes" className="sm:col-span-2">
                    <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </FormField>
            </div>
        </Modal>
    );
}

function ResultFlag({ flag, abnormal }: { flag: LabResultFlag; abnormal: boolean }) {
    const tone = abnormal ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700';
    return <span className={`px-2 py-0.5 text-[11px] font-semibold capitalize ${tone}`}>{flag.replace('_', ' ')}</span>;
}

function Metric({ label, value, icon: Icon, tone = 'slate' }: {
    label: string;
    value: string;
    icon: ElementType;
    tone?: 'slate' | 'emerald' | 'rose';
}) {
    const colors = {
        slate: 'border-slate-200 bg-white text-slate-700',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rose: 'border-rose-200 bg-rose-50 text-rose-700',
    };
    return (
        <div className={`flex items-center justify-between border px-4 py-3 ${colors[tone]}`}>
            <div>
                <p className="text-[11px] font-semibold uppercase opacity-70">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
            <Icon className="h-5 w-5 opacity-70" />
        </div>
    );
}
