import { useMemo, useState } from 'react';
import { AlertTriangle, Beaker, ChevronRight, FilePlus2, Search, Save } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input, Textarea } from '../common';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAddLabResult, useCreateLabTest, useLabTestDefinitions, useLabTests, useUpdateLabResult } from '../../hooks/useLabTests';
import { getErrorMessage } from '../../utils/errorUtils';
import type { Patient } from '../../types/patient';
import type { LabResult, LabResultFlag, LabResultPayload, LabTest, LabTestDefinition, LabTestParameterDefinition } from '../../services/labTestService';

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

function formatParameterRange(parameter: LabTestParameterDefinition) {
    const min = parameter.reference_min;
    const max = parameter.reference_max;
    const unit = parameter.unit ?? '';
    if (min === null && max === null) return 'No configured range';
    if (min !== null && max !== null) return `${min} - ${max} ${unit}`.trim();
    if (min !== null) return `>= ${min} ${unit}`.trim();
    return `<= ${max} ${unit}`.trim();
}

function numericConfigValue(value: string | number | null) {
    if (value === null) return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
}

function deriveResultIndicator(
    parameter: LabTestParameterDefinition | undefined,
    valueNumeric: string,
    valueText: string,
): Pick<LabResultPayload, 'abnormal_flag' | 'is_abnormal'> {
    const numericValue = valueNumeric.trim() === '' ? undefined : Number(valueNumeric);
    if (numericValue !== undefined && Number.isFinite(numericValue)) {
        const min = numericConfigValue(parameter?.reference_min ?? null);
        const max = numericConfigValue(parameter?.reference_max ?? null);
        if (min !== undefined && numericValue < min) return { abnormal_flag: 'low', is_abnormal: true };
        if (max !== undefined && numericValue > max) return { abnormal_flag: 'high', is_abnormal: true };
    }

    const normalizedText = valueText.trim().toLowerCase();
    if (normalizedText) {
        if (parameter?.abnormal_values?.some(value => value.toLowerCase() === normalizedText)) {
            return { abnormal_flag: 'abnormal', is_abnormal: true };
        }
        if (parameter?.normal_values?.some(value => value.toLowerCase() === normalizedText)) {
            return { abnormal_flag: 'normal', is_abnormal: false };
        }
    }

    return { abnormal_flag: 'normal', is_abnormal: false };
}

export function LabTestSection({ patient }: { patient: Patient }) {
    const { data: testsRaw, isLoading } = useLabTests(patient.id);
    const { data: definitionsRaw, isError: definitionsError, error: definitionsErrorObj } = useLabTestDefinitions();
    const { showError: showErrorToast } = useToast();
    const definitions = useMemo(() => Array.isArray(definitionsRaw) ? definitionsRaw : [], [definitionsRaw]);
    const tests = useMemo(() => Array.isArray(testsRaw) ? testsRaw : [], [testsRaw]);
    const [addTestOpen, setAddTestOpen] = useState(false);

    // Show error if definitions query fails
    if (definitionsError && definitionsErrorObj) {
        const errorMsg = getErrorMessage(definitionsErrorObj, 'Failed to load lab test definitions');
        showErrorToast(errorMsg);
    }

    return (
        <div className="space-y-4">
            <section className="border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Lab Tests</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {tests.length ? 'Open a test to view parameters and enter results.' : 'No lab tests recorded yet'}
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setAddTestOpen(true)} disabled={definitionsError || definitions.length === 0}>
                        <FilePlus2 className="mr-1 h-4 w-4" />
                        Add Test
                    </Button>
                </div>

                {definitionsError ? (
                    <div className="px-5 py-12 text-center">
                        <AlertTriangle className="mx-auto h-8 w-8 text-rose-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">Failed to load lab test definitions</p>
                        <p className="mt-1 text-xs text-slate-400">Unable to add new tests at this time. Please try again later.</p>
                    </div>
                ) : isLoading ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-400">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <Beaker className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No lab tests recorded</p>
                        <p className="mt-1 text-xs text-slate-400">Add configured tests and enter parameter results.</p>
                        <Button size="sm" className="mt-4" onClick={() => setAddTestOpen(true)} disabled={definitions.length === 0}>Add Test</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tests.map(test => <LabTestRow key={test.id} patientId={patient.id} test={test} />)}
                    </div>
                )}
            </section>

            {addTestOpen && (
                <LabTestModal
                    open={addTestOpen}
                    onClose={() => setAddTestOpen(false)}
                    patientId={patient.id}
                    definitions={definitions}
                />
            )}
        </div>
    );
}

function LabTestRow({ patientId, test }: { patientId: string; test: LabTest }) {
    const [detailOpen, setDetailOpen] = useState(false);
    const definition = test.test_definition;
    const statusTone = test.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

    return (
        <>
            <button
                type="button"
                onClick={() => setDetailOpen(true)}
                className="block w-full px-5 py-4 text-left transition-colors hover:bg-teal-50/60"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{test.test_name}</p>
                            <span className="bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                {definition?.short_name ?? definition?.code ?? test.test_type ?? 'Custom'}
                            </span>
                            <span className={`px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone}`}>{test.status.replace('_', ' ')}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Ordered {formatDateTime(test.ordered_at)} · Reported {formatDateTime(test.reported_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{test.results.length} result{test.results.length === 1 ? '' : 's'}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                </div>
            </button>

            {detailOpen && (
                <LabTestDetailModal
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    patientId={patientId}
                    test={test}
                />
            )}
        </>
    );
}

function LabTestModal({
    open,
    onClose,
    patientId,
    definitions,
}: {
    open: boolean;
    onClose: () => void;
    patientId: string;
    definitions: LabTestDefinition[];
}) {
    const { showSuccess, showError } = useToast();
    const createMutation = useCreateLabTest(patientId);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const busy = createMutation.isPending;
    const filteredDefinitions = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return definitions;
        return definitions.filter(definition =>
            definition.name.toLowerCase().includes(term) ||
            definition.code.toLowerCase().includes(term) ||
            definition.short_name?.toLowerCase().includes(term) ||
            definition.category?.toLowerCase().includes(term),
        );
    }, [definitions, search]);

    const toggleDefinition = (definitionId: string) => {
        setSelectedIds(current =>
            current.includes(definitionId)
                ? current.filter(id => id !== definitionId)
                : [...current, definitionId],
        );
    };

    const handleClose = () => {
        setSearch('');
        setSelectedIds([]);
        setNotes('');
        onClose();
    };

    const handleSubmit = async () => {
        const selectedDefinitions = definitions.filter(item => selectedIds.includes(item.id));
        if (!selectedDefinitions.length) {
            showError('Select at least one configured lab test.');
            return;
        }
        try {
            for (const definition of selectedDefinitions) {
                await createMutation.mutateAsync({
                    test_definition_id: definition.id,
                    test_name: definition.name,
                    notes: notes.trim() || undefined,
                });
            }
            showSuccess(`${selectedDefinitions.length} lab test${selectedDefinitions.length === 1 ? '' : 's'} added.`);
            handleClose();
        } catch (e: unknown) {
            showError(getErrorMessage(e, 'Failed to add lab test.'));
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Add Lab Test"
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={handleClose} disabled={busy}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={busy}>Add Selected</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search configured tests..."
                        className="pl-9"
                    />
                </div>
                <div className="max-h-72 overflow-y-auto border border-slate-200">
                    {filteredDefinitions.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">No configured tests match your search.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredDefinitions.map(definition => {
                                const selected = selectedIds.includes(definition.id);
                                return (
                                    <label
                                        key={definition.id}
                                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-teal-50/60 ${selected ? 'bg-teal-50' : 'bg-white'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => toggleDefinition(definition.id)}
                                            className="mt-1 h-4 w-4"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-slate-900">{definition.name}</span>
                                            <span className="mt-0.5 block text-xs text-slate-500">
                                                {definition.short_name ?? definition.code} · {definition.parameters.length} parameters
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
                <FormField label="Notes">
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
                </FormField>
            </div>
        </Modal>
    );
}

type ResultDraft = {
    value_numeric: string;
    value_text: string;
    notes: string;
};

function LabTestDetailModal({
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
    const updateMutation = useUpdateLabResult(patientId);
    const definition = test.test_definition;
    const parameters = useMemo(
        () => (definition?.parameters ?? [])
            .filter(parameter => parameter.is_active)
            .sort((a, b) => a.display_order - b.display_order),
        [definition],
    );
    const busy = addMutation.isPending || updateMutation.isPending;

    const resultsByParameter = useMemo(() => {
        const map = new Map<string, LabResult>();
        for (const result of test.results) {
            if (result.parameter_definition_id) map.set(result.parameter_definition_id, result);
            if (result.component_code) map.set(result.component_code, result);
        }
        return map;
    }, [test.results]);
    const [drafts, setDrafts] = useState<Record<string, ResultDraft>>(() =>
        buildInitialDrafts(parameters, resultsByParameter)
    );

    const handleSubmit = async () => {
        const entries = parameters
            .map(parameter => ({ parameter, draft: drafts[parameter.id] ?? emptyResultDraft() }))
            .filter(({ parameter, draft }) => {
                const existing = resultsByParameter.get(parameter.id) ?? resultsByParameter.get(parameter.code);
                return existing || draft.value_numeric.trim() || draft.value_text.trim();
            });

        if (!entries.length) {
            showError('Enter at least one result value.');
            return;
        }

        try {
            for (const { parameter, draft } of entries) {
                const indicator = deriveResultIndicator(parameter, draft.value_numeric, draft.value_text);
                const payload: LabResultPayload = {
                    component_name: parameter.name,
                    component_code: parameter.code,
                    parameter_definition_id: parameter.id,
                    value_numeric: parseNumber(draft.value_numeric),
                    value_text: draft.value_text.trim() || undefined,
                    unit: parameter.unit ?? undefined,
                    reference_min: parseNumber(String(parameter.reference_min ?? '')),
                    reference_max: parseNumber(String(parameter.reference_max ?? '')),
                    abnormal_flag: indicator.abnormal_flag,
                    is_abnormal: indicator.is_abnormal,
                    notes: draft.notes.trim() || undefined,
                };
                const existing = resultsByParameter.get(parameter.id) ?? resultsByParameter.get(parameter.code);
                if (existing) {
                    await updateMutation.mutateAsync({ resultId: existing.id, data: payload });
                } else {
                    await addMutation.mutateAsync({ testId: test.id, data: payload });
                }
            }
            showSuccess('Results saved.');
            onClose();
        } catch (e: unknown) {
            showError(getErrorMessage(e, 'Failed to save results.'));
        }
    };

    function updateDraft(parameterId: string, patch: Partial<ResultDraft>) {
        setDrafts(current => ({
            ...current,
            [parameterId]: {
                ...(current[parameterId] ?? emptyResultDraft()),
                ...patch,
            },
        }));
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={test.test_name}
            subtitle={`Ordered ${formatDateTime(test.ordered_at)} · Reported ${formatDateTime(test.reported_at)}`}
            size="2xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={busy}>
                        <Save className="mr-1 h-4 w-4" />
                        Save Results
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                {parameters.length === 0 ? (
                    <div className="border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        This test has no active configured parameters.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200">
                        <table className="min-w-[900px] w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                                    <th className="px-3 py-3">Parameter</th>
                                    <th className="px-3 py-3">Range</th>
                                    <th className="px-3 py-3">Numeric</th>
                                    <th className="px-3 py-3">Text</th>
                                    <th className="px-3 py-3">Indicator</th>
                                    <th className="px-3 py-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {parameters.map(parameter => {
                                    const draft = drafts[parameter.id] ?? emptyResultDraft();
                                    const indicator = deriveResultIndicator(parameter, draft.value_numeric, draft.value_text);
                                    return (
                                        <tr key={parameter.id}>
                                            <td className="px-3 py-3 align-top">
                                                <p className="font-semibold text-slate-900">{parameter.name}</p>
                                                <p className="text-xs text-slate-400">{parameter.code} · {parameter.unit ?? 'No unit'}</p>
                                            </td>
                                            <td className="px-3 py-3 align-top text-xs text-slate-500">{formatParameterRange(parameter)}</td>
                                            <td className="px-3 py-3 align-top">
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={draft.value_numeric}
                                                    onChange={e => updateDraft(parameter.id, { value_numeric: e.target.value })}
                                                    disabled={parameter.value_type === 'text'}
                                                    className="min-w-28"
                                                />
                                            </td>
                                            <td className="px-3 py-3 align-top">
                                                <Input
                                                    value={draft.value_text}
                                                    onChange={e => updateDraft(parameter.id, { value_text: e.target.value })}
                                                    disabled={parameter.value_type === 'numeric'}
                                                    className="min-w-32"
                                                />
                                            </td>
                                            <td className="px-3 py-3 align-top">
                                                <ResultFlag
                                                    flag={(indicator.abnormal_flag ?? 'normal') as LabResultFlag}
                                                    abnormal={Boolean(indicator.is_abnormal)}
                                                />
                                            </td>
                                            <td className="px-3 py-3 align-top">
                                                <Input
                                                    value={draft.notes}
                                                    onChange={e => updateDraft(parameter.id, { notes: e.target.value })}
                                                    className="min-w-36"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Indicator guide</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <ResultFlag flag="normal" abnormal={false} />
                        <ResultFlag flag="high" abnormal />
                        <ResultFlag flag="low" abnormal />
                        <ResultFlag flag="abnormal" abnormal />
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function emptyResultDraft(): ResultDraft {
    return {
        value_numeric: '',
        value_text: '',
        notes: '',
    };
}

function resultToDraft(result: LabResult): ResultDraft {
    return {
        value_numeric: result.value_numeric === null ? '' : String(result.value_numeric),
        value_text: result.value_text ?? '',
        notes: result.notes ?? '',
    };
}

function buildInitialDrafts(parameters: LabTestParameterDefinition[], resultsByParameter: Map<string, LabResult>) {
    const next: Record<string, ResultDraft> = {};
    for (const parameter of parameters) {
        const result = resultsByParameter.get(parameter.id) ?? resultsByParameter.get(parameter.code);
        next[parameter.id] = result ? resultToDraft(result) : emptyResultDraft();
    }
    return next;
}

const parseNumber = (value: string) => value.trim() === '' ? undefined : Number(value);

function ResultFlag({ flag, abnormal }: { flag: LabResultFlag; abnormal: boolean }) {
    const label = flag === 'high' || flag === 'critical_high'
        ? 'H'
        : flag === 'low' || flag === 'critical_low'
            ? 'L'
            : flag.replace('_', ' ');
    const tone = flag === 'high' || flag === 'critical_high'
        ? 'bg-rose-100 text-rose-700'
        : flag === 'low' || flag === 'critical_low'
            ? 'bg-amber-100 text-amber-700'
            : abnormal
                ? 'bg-fuchsia-100 text-fuchsia-700'
                : 'bg-emerald-100 text-emerald-700';
    return <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase ${tone}`}>{label}</span>;
}
