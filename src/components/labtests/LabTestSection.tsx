import { useMemo, useState } from 'react';
import { AlertTriangle, Beaker, CheckCircle2, ChevronRight, ClipboardCheck, FileCheck2, FilePlus2, Printer, Search, Save } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input, Textarea } from '../common';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAddLabResult, useCreateLabTest, useLabTestDefinitions, useLabTests, useUpdateLabResult, useUpdateLabTest } from '../../hooks/useLabTests';
import { getErrorMessage } from '../../utils/errorUtils';
import type { Patient } from '../../types/patient';
import type { LabResult, LabResultFlag, LabResultPayload, LabTest, LabTestDefinition, LabTestParameterDefinition } from '../../services/labTestService';

type LabWorkflowStage = 'draft' | 'filed' | 'verified';

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

function getLabWorkflowStage(test: LabTest): LabWorkflowStage {
    if (test.reviewed_by) return 'verified';
    if (test.status === 'completed' || test.reported_at) return 'filed';
    return 'draft';
}

function getStageMeta(stage: LabWorkflowStage) {
    switch (stage) {
        case 'verified':
            return {
                label: 'Verified',
                tone: 'bg-emerald-100 text-emerald-700',
                description: 'Signed and ready for clinical use.',
            };
        case 'filed':
            return {
                label: 'Filed',
                tone: 'bg-sky-100 text-sky-700',
                description: 'Filed by staff and awaiting supervisor/admin signature.',
            };
        default:
            return {
                label: 'Draft',
                tone: 'bg-amber-100 text-amber-700',
                description: 'Editable result entry in progress.',
            };
    }
}

function canSignLabResults(userRoles: string[]) {
    const elevatedRoles = ['admin', 'superadmin', 'super_admin', 'supervisor', 'lab_supervisor', 'manager'];
    return userRoles.some(role => elevatedRoles.includes(role.toLowerCase()));
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
                        {tests.map(test => <LabTestRow key={test.id} patient={patient} test={test} />)}
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

function LabTestRow({ patient, test }: { patient: Patient; test: LabTest }) {
    const [detailOpen, setDetailOpen] = useState(false);
    const definition = test.test_definition;
    const stage = getLabWorkflowStage(test);
    const stageMeta = getStageMeta(stage);

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
                            <span className={`px-2 py-0.5 text-[11px] font-semibold ${stageMeta.tone}`}>{stageMeta.label}</span>
                            {test.has_abnormal_results && (
                                <span className="bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">Abnormal</span>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Ordered {formatDateTime(test.ordered_at)} · Filed {formatDateTime(test.reported_at)}
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
                    patient={patient}
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
                    status: 'ordered',
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
    patient,
    test,
}: {
    open: boolean;
    onClose: () => void;
    patient: Patient;
    test: LabTest;
}) {
    const { showSuccess, showError } = useToast();
    const { user } = useAuth();
    const addMutation = useAddLabResult(patient.id);
    const updateMutation = useUpdateLabResult(patient.id);
    const updateTestMutation = useUpdateLabTest(patient.id);
    const definition = test.test_definition;
    const stage = getLabWorkflowStage(test);
    const stageMeta = getStageMeta(stage);
    const userRoles = user?.roles?.map(role => role.name) ?? [];
    const canVerify = canSignLabResults(userRoles);
    const canEditResults = stage === 'draft';
    const parameters = useMemo(
        () => (definition?.parameters ?? [])
            .filter(parameter => parameter.is_active)
            .sort((a, b) => a.display_order - b.display_order),
        [definition],
    );
    const busy = addMutation.isPending || updateMutation.isPending || updateTestMutation.isPending;

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

    const handleSaveResults = async (nextStage: 'draft' | 'filed') => {
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

        if (nextStage === 'filed') {
            const missingRequired = parameters.filter(parameter => {
                if (!parameter.is_required) return false;
                const draft = drafts[parameter.id] ?? emptyResultDraft();
                return !draft.value_numeric.trim() && !draft.value_text.trim();
            });

            if (missingRequired.length) {
                showError(`Complete required parameter${missingRequired.length === 1 ? '' : 's'} before filing: ${missingRequired.map(item => item.name).join(', ')}.`);
                return;
            }
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
            await updateTestMutation.mutateAsync({
                id: test.id,
                data: nextStage === 'filed'
                    ? { status: 'completed', reported_at: test.reported_at ?? new Date().toISOString() }
                    : { status: 'in_progress' },
            });
            showSuccess(nextStage === 'filed' ? 'Results filed for verification.' : 'Draft results saved.');
            onClose();
        } catch (e: unknown) {
            showError(getErrorMessage(e, nextStage === 'filed' ? 'Failed to file results.' : 'Failed to save draft results.'));
        }
    };

    const handleVerify = async () => {
        if (!canVerify) {
            showError('Only a supervisor or administrator can sign and verify filed results.');
            return;
        }
        if (stage === 'draft') {
            showError('File the results before signing them.');
            return;
        }
        try {
            await updateTestMutation.mutateAsync({
                id: test.id,
                data: { status: 'completed', reported_at: test.reported_at ?? new Date().toISOString() },
            });
            showSuccess('Results signed and verified.');
            onClose();
        } catch (e: unknown) {
            showError(getErrorMessage(e, 'Failed to verify results.'));
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
            subtitle={`Ordered ${formatDateTime(test.ordered_at)} · Filed ${formatDateTime(test.reported_at)}`}
            size="2xl"
            footer={
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                    <Button variant="outline" onClick={() => printLabResult(patient, test, parameters, resultsByParameter)} disabled={busy}>
                        <Printer className="mr-1 h-4 w-4" />
                        Print
                    </Button>
                    <div className="flex flex-wrap justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                        {canEditResults && (
                            <Button variant="secondary" onClick={() => handleSaveResults('draft')} loading={busy}>
                                <Save className="mr-1 h-4 w-4" />
                                Save Draft
                            </Button>
                        )}
                        {canEditResults && (
                            <Button onClick={() => handleSaveResults('filed')} loading={busy}>
                                <FileCheck2 className="mr-1 h-4 w-4" />
                                File Results
                            </Button>
                        )}
                        {stage === 'filed' && (
                            <Button onClick={handleVerify} loading={busy} disabled={!canVerify}>
                                <ClipboardCheck className="mr-1 h-4 w-4" />
                                Sign & Verify
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <div className="space-y-5">
                <div className="grid gap-3 border border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase ${stageMeta.tone}`}>{stageMeta.label}</span>
                            {test.reviewed_by && (
                                <span className="text-xs text-slate-500">Signed by {test.reviewed_by.name}</span>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{stageMeta.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <StageStep active done={stage !== 'draft'} label="Draft" />
                        <StageStep active={stage !== 'draft'} done={stage === 'verified'} label="Filed" />
                        <StageStep active={stage === 'verified'} done={stage === 'verified'} label="Verified" />
                    </div>
                </div>

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
                                                    disabled={!canEditResults || parameter.value_type === 'text'}
                                                    className="min-w-28"
                                                />
                                            </td>
                                            <td className="px-3 py-3 align-top">
                                                <Input
                                                    value={draft.value_text}
                                                    onChange={e => updateDraft(parameter.id, { value_text: e.target.value })}
                                                    disabled={!canEditResults || parameter.value_type === 'numeric'}
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
                                                    disabled={!canEditResults}
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

function StageStep({ active, done, label }: { active: boolean; done: boolean; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1 ${active ? 'text-slate-700' : 'text-slate-400'}`}>
            {done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
                <span className={`h-2 w-2 rounded-full ${active ? 'bg-sky-500' : 'bg-slate-300'}`} />
            )}
            {label}
        </span>
    );
}

function printLabResult(
    patient: Patient,
    test: LabTest,
    parameters: LabTestParameterDefinition[],
    resultsByParameter: Map<string, LabResult>,
) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stage = getLabWorkflowStage(test);
    const verified = stage === 'verified';
    const signedBy = test.reviewed_by?.name ?? (verified ? 'Verified supervisor/admin' : 'Pending');
    const reportRows = parameters.map(parameter => {
        const result = resultsByParameter.get(parameter.id) ?? resultsByParameter.get(parameter.code);
        const value = formatPrintableResult(parameter, result, verified);
        const flag = verified && result ? result.abnormal_flag.replace('_', ' ') : 'Pending';
        return `
            <tr>
                <td>${escapeHtml(parameter.name)}<br><span>${escapeHtml(parameter.code)}</span></td>
                <td>${escapeHtml(formatParameterRange(parameter))}</td>
                <td>${escapeHtml(value)}</td>
                <td>${escapeHtml(flag)}</td>
                <td>${escapeHtml(verified ? result?.notes ?? '' : 'Pending')}</td>
            </tr>
        `;
    }).join('');

    printWindow.document.write(`
        <!doctype html>
        <html>
            <head>
                <title>${escapeHtml(test.test_name)} Result</title>
                <style>
                    * { box-sizing: border-box; }
                    body { color: #0f172a; font-family: Arial, sans-serif; margin: 32px; }
                    .header { border-bottom: 2px solid #0f766e; display: flex; justify-content: space-between; gap: 24px; padding-bottom: 16px; }
                    h1 { font-size: 22px; margin: 0 0 4px; }
                    h2 { font-size: 15px; margin: 24px 0 10px; }
                    p { margin: 3px 0; }
                    .muted { color: #64748b; font-size: 12px; }
                    .status { border: 1px solid #cbd5e1; display: inline-block; font-size: 12px; font-weight: 700; padding: 5px 8px; text-transform: uppercase; }
                    .status.pending { color: #b45309; }
                    .status.verified { color: #047857; }
                    .grid { display: grid; gap: 8px 24px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 18px; }
                    .label { color: #64748b; display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                    table { border-collapse: collapse; margin-top: 8px; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; font-size: 12px; padding: 9px; text-align: left; vertical-align: top; }
                    th { background: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase; }
                    td span { color: #64748b; font-size: 11px; }
                    .signature { border-top: 1px solid #94a3b8; margin-top: 42px; padding-top: 8px; width: 280px; }
                    .notice { background: #fffbeb; border: 1px solid #f59e0b; color: #92400e; margin-top: 18px; padding: 10px; }
                    @media print { body { margin: 18mm; } button { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>${escapeHtml(test.test_name)}</h1>
                        <p class="muted">Laboratory result report</p>
                    </div>
                    <div>
                        <span class="status ${verified ? 'verified' : 'pending'}">${verified ? 'Verified' : 'Pending verification'}</span>
                    </div>
                </div>

                <div class="grid">
                    <p><span class="label">Patient</span>${escapeHtml(patient.name)}</p>
                    <p><span class="label">MRN</span>${escapeHtml(patient.medical_record_number ?? '-')}</p>
                    <p><span class="label">Sex / Age</span>${escapeHtml(`${patient.sex}${patient.age ? ` / ${patient.age} years` : ''}`)}</p>
                    <p><span class="label">Facility</span>${escapeHtml(patient.facility?.name ?? '-')}</p>
                    <p><span class="label">Ordered</span>${escapeHtml(formatDateTime(test.ordered_at))}</p>
                    <p><span class="label">Filed</span>${escapeHtml(formatDateTime(test.reported_at))}</p>
                </div>

                ${verified ? '' : '<div class="notice">This report has not been signed. Result parameters are shown as Pending until supervisor/admin verification.</div>'}

                <h2>Parameters</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Reference Range</th>
                            <th>Result</th>
                            <th>Indicator</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>${reportRows || '<tr><td colspan="5">No configured parameters.</td></tr>'}</tbody>
                </table>

                <div class="signature">
                    <p><span class="label">Signed by</span>${escapeHtml(signedBy)}</p>
                    <p><span class="label">Printed</span>${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function formatPrintableResult(
    parameter: LabTestParameterDefinition,
    result: LabResult | undefined,
    verified: boolean,
) {
    if (!verified || !result) return 'Pending';
    const values = [
        result.value_numeric === null ? '' : String(result.value_numeric),
        result.value_text ?? '',
    ].filter(Boolean);
    if (!values.length) return 'Pending';
    const unit = result.unit ?? parameter.unit;
    return `${values.join(' / ')}${unit ? ` ${unit}` : ''}`;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
