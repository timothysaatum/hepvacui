import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Save, Search, Settings2, X } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input, Select, Textarea } from '../common';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { formatCurrency } from '../../utils/formatters';
import {
    useCreateLabTestDefinition,
    useCreateLabTestParameter,
    useLabTestDefinitions,
    useUpdateLabTestDefinition,
    useUpdateLabTestParameter,
} from '../../hooks/useLabTests';
import type {
    LabTestDefinition,
    LabTestDefinitionPayload,
    LabTestParameterDefinition,
    LabTestParameterDefinitionPayload,
    LabValueType,
} from '../../services/labTestService';

type ParameterDraft = {
    code: string;
    name: string;
    value_type: LabValueType;
    unit: string;
    reference_min: string;
    reference_max: string;
    normal_values: string;
    abnormal_values: string;
    is_required: boolean;
};

const emptyParameter = (): ParameterDraft => ({
    code: '',
    name: '',
    value_type: 'numeric',
    unit: '',
    reference_min: '',
    reference_max: '',
    normal_values: '',
    abnormal_values: '',
    is_required: false,
});

const parseNumber = (value: string) => value.trim() === '' ? undefined : Number(value);
const splitValues = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean);

function parameterPayload(parameter: ParameterDraft, displayOrder = 0): LabTestParameterDefinitionPayload {
    return {
        code: parameter.code.trim().toLowerCase(),
        name: parameter.name.trim(),
        value_type: parameter.value_type,
        unit: parameter.unit.trim() || undefined,
        reference_min: parseNumber(parameter.reference_min),
        reference_max: parseNumber(parameter.reference_max),
        normal_values: splitValues(parameter.normal_values),
        abnormal_values: splitValues(parameter.abnormal_values),
        display_order: displayOrder,
        is_required: parameter.is_required,
        is_active: true,
    };
}

function parameterToDraft(parameter: LabTestParameterDefinition): ParameterDraft {
    return {
        code: parameter.code,
        name: parameter.name,
        value_type: parameter.value_type,
        unit: parameter.unit ?? '',
        reference_min: parameter.reference_min === null ? '' : String(parameter.reference_min),
        reference_max: parameter.reference_max === null ? '' : String(parameter.reference_max),
        normal_values: parameter.normal_values?.join(', ') ?? '',
        abnormal_values: parameter.abnormal_values?.join(', ') ?? '',
        is_required: parameter.is_required,
    };
}

function formatRange(parameter: LabTestParameterDefinition) {
    const unit = parameter.unit ?? '';
    if (parameter.reference_min === null && parameter.reference_max === null) return 'No range';
    if (parameter.reference_min !== null && parameter.reference_max !== null) {
        return `${parameter.reference_min} - ${parameter.reference_max} ${unit}`.trim();
    }
    if (parameter.reference_min !== null) return `>= ${parameter.reference_min} ${unit}`.trim();
    return `<= ${parameter.reference_max} ${unit}`.trim();
}

export function LabTestDefinitionManager() {
    const navigate = useNavigate();
    const { testDefinitionId } = useParams<{ testDefinitionId?: string }>();
    const { data, isLoading } = useLabTestDefinitions(true);
    const definitions = useMemo(() => Array.isArray(data) ? data : [], [data]);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const selected = useMemo(
        () => definitions.find(definition => definition.id === testDefinitionId) ?? null,
        [definitions, testDefinitionId],
    );
    const filteredDefinitions = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return definitions;
        return definitions.filter(definition =>
            [
                definition.name,
                definition.code,
                definition.short_name,
                definition.category,
                definition.specimen,
                definition.method,
            ].some(value => value?.toLowerCase().includes(term)),
        );
    }, [definitions, search]);

    if (testDefinitionId) {
        return (
            <section className="border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={() => navigate('/tests')}
                        className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to tests
                    </button>
                    <h2 className="text-base font-semibold text-slate-900">
                        {selected ? `Edit ${selected.name}` : 'Lab Test Configuration'}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Update test details, pricing, availability, parameters, and result rules.
                    </p>
                </div>
                <div className="p-5">
                    {isLoading ? (
                        <div className="py-12 text-center text-sm text-slate-400">Loading test definition...</div>
                    ) : selected ? (
                        <DefinitionDetail key={selected.id} definition={selected} />
                    ) : (
                        <div className="py-12 text-center text-sm text-slate-500">Lab test definition not found.</div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Lab Test Configuration</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Define reusable tests, parameters, reference ranges, and abnormal result rules.
                    </p>
                </div>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    New Test
                </Button>
            </div>

            <div className="p-5">
                <div className="relative mb-4">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search tests by name, code, category, specimen..."
                        className="pl-9"
                    />
                </div>
                {isLoading ? (
                    <div className="py-12 text-center text-sm text-slate-400">Loading test definitions...</div>
                ) : filteredDefinitions.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                        {definitions.length === 0 ? 'No lab tests configured yet.' : 'No lab tests match your search.'}
                    </div>
                ) : (
                    <div className="overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                                        <th className="px-4 py-3">Test</th>
                                        <th className="px-4 py-3">Code</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Parameters</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredDefinitions.map(definition => (
                                        <tr
                                            key={definition.id}
                                            onClick={() => navigate(`/tests/${definition.id}`)}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    navigate(`/tests/${definition.id}`);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            className="cursor-pointer transition-colors hover:bg-teal-50/60"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-slate-900">{definition.name}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {definition.short_name || definition.specimen || 'No short name'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 font-mono text-xs text-slate-600">{definition.code}</td>
                                            <td className="px-4 py-4 text-slate-600">{definition.category || '—'}</td>
                                            <td className="px-4 py-4 text-slate-600">{definition.parameters.length}</td>
                                            <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(definition.price)}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-0.5 text-[11px] font-semibold ${definition.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {definition.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        navigate(`/tests/${definition.id}`);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                                                >
                                                    Edit
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <CreateDefinitionModal open={createOpen} onClose={() => setCreateOpen(false)} />
        </section>
    );
}

function DefinitionDetail({ definition }: { definition: LabTestDefinition }) {
    const { showSuccess, showError } = useToast();
    const updateDefinition = useUpdateLabTestDefinition();
    const createParameter = useCreateLabTestParameter();
    const updateParameter = useUpdateLabTestParameter();
    const [definitionForm, setDefinitionForm] = useState({
        name: definition.name,
        code: definition.code,
        short_name: definition.short_name ?? '',
        category: definition.category ?? '',
        specimen: definition.specimen ?? '',
        method: definition.method ?? '',
        price: String(definition.price ?? 0),
        description: definition.description ?? '',
        is_active: definition.is_active,
    });
    const [newParameter, setNewParameter] = useState<ParameterDraft>(emptyParameter());
    const [editingParameterId, setEditingParameterId] = useState<string | null>(null);
    const [editingParameter, setEditingParameter] = useState<ParameterDraft>(emptyParameter());

    const saveDefinition = async () => {
        try {
            await updateDefinition.mutateAsync({
                id: definition.id,
                data: cleanDefinitionPayload(definitionForm),
            });
            showSuccess('Lab test definition saved.');
        } catch (error: unknown) {
            showError(getErrorMessage(error, 'Failed to save lab test definition.'));
        }
    };

    const addParameter = async () => {
        if (!newParameter.code.trim() || !newParameter.name.trim()) {
            showError('Parameter code and name are required.');
            return;
        }
        try {
            await createParameter.mutateAsync({
                testDefinitionId: definition.id,
                data: parameterPayload(newParameter, definition.parameters.length + 1),
            });
            setNewParameter(emptyParameter());
            showSuccess('Parameter added.');
        } catch (error: unknown) {
            showError(getErrorMessage(error, 'Failed to add parameter.'));
        }
    };

    const saveParameter = async (parameterId: string) => {
        try {
            await updateParameter.mutateAsync({
                id: parameterId,
                data: parameterPayload(editingParameter),
            });
            setEditingParameterId(null);
            showSuccess('Parameter saved.');
        } catch (error: unknown) {
            showError(getErrorMessage(error, 'Failed to save parameter.'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Test Name">
                    <Input value={definitionForm.name} onChange={e => setDefinitionForm(f => ({ ...f, name: e.target.value }))} />
                </FormField>
                <FormField label="Code">
                    <Input value={definitionForm.code} onChange={e => setDefinitionForm(f => ({ ...f, code: e.target.value }))} />
                </FormField>
                <FormField label="Short Name">
                    <Input value={definitionForm.short_name} onChange={e => setDefinitionForm(f => ({ ...f, short_name: e.target.value }))} />
                </FormField>
                <FormField label="Category">
                    <Input value={definitionForm.category} onChange={e => setDefinitionForm(f => ({ ...f, category: e.target.value }))} />
                </FormField>
                <FormField label="Specimen">
                    <Input value={definitionForm.specimen} onChange={e => setDefinitionForm(f => ({ ...f, specimen: e.target.value }))} />
                </FormField>
                <FormField label="Method">
                    <Input value={definitionForm.method} onChange={e => setDefinitionForm(f => ({ ...f, method: e.target.value }))} />
                </FormField>
                <FormField label="Price">
                    <Input type="number" min={0} step="0.01" value={definitionForm.price} onChange={e => setDefinitionForm(f => ({ ...f, price: e.target.value }))} />
                </FormField>
                <FormField label="Description" className="md:col-span-2">
                    <Textarea value={definitionForm.description} onChange={e => setDefinitionForm(f => ({ ...f, description: e.target.value }))} />
                </FormField>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        checked={definitionForm.is_active}
                        onChange={e => setDefinitionForm(f => ({ ...f, is_active: e.target.checked }))}
                    />
                    Available for patient orders
                </label>
                <Button size="sm" onClick={saveDefinition} loading={updateDefinition.isPending}>
                    <Save className="mr-1 h-4 w-4" />
                    Save Test
                </Button>
            </div>

            <div className="border-t border-slate-100 pt-5">
                <div className="mb-3 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Parameters</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-400">
                                <th className="py-2 pr-3">Name</th>
                                <th className="py-2 pr-3">Type</th>
                                <th className="py-2 pr-3">Unit</th>
                                <th className="py-2 pr-3">Range</th>
                                <th className="py-2 pr-3">Text Rules</th>
                                <th className="py-2 pr-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {definition.parameters.map(parameter => {
                                const editing = editingParameterId === parameter.id;
                                return (
                                    <tr key={parameter.id}>
                                        <td className="py-2 pr-3">
                                            {editing ? (
                                                <Input value={editingParameter.name} onChange={e => setEditingParameter(p => ({ ...p, name: e.target.value }))} />
                                            ) : (
                                                <div>
                                                    <p className="font-medium text-slate-800">{parameter.name}</p>
                                                    <p className="text-xs text-slate-400">{parameter.code}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {editing ? <ValueTypeSelect value={editingParameter.value_type} onChange={value => setEditingParameter(p => ({ ...p, value_type: value }))} /> : parameter.value_type}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {editing ? <Input value={editingParameter.unit} onChange={e => setEditingParameter(p => ({ ...p, unit: e.target.value }))} /> : parameter.unit ?? '—'}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {editing ? (
                                                <div className="grid min-w-[180px] grid-cols-2 gap-2">
                                                    <Input type="number" step="any" value={editingParameter.reference_min} onChange={e => setEditingParameter(p => ({ ...p, reference_min: e.target.value }))} placeholder="Min" />
                                                    <Input type="number" step="any" value={editingParameter.reference_max} onChange={e => setEditingParameter(p => ({ ...p, reference_max: e.target.value }))} placeholder="Max" />
                                                </div>
                                            ) : formatRange(parameter)}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {editing ? (
                                                <div className="grid min-w-[220px] gap-2">
                                                    <Input value={editingParameter.normal_values} onChange={e => setEditingParameter(p => ({ ...p, normal_values: e.target.value }))} placeholder="Normal values" />
                                                    <Input value={editingParameter.abnormal_values} onChange={e => setEditingParameter(p => ({ ...p, abnormal_values: e.target.value }))} placeholder="Abnormal values" />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500">
                                                    N: {parameter.normal_values?.join(', ') || '—'}<br />
                                                    A: {parameter.abnormal_values?.join(', ') || '—'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 pr-3 text-right">
                                            {editing ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => saveParameter(parameter.id)} loading={updateParameter.isPending}>Save</Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingParameterId(null)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingParameterId(parameter.id);
                                                        setEditingParameter(parameterToDraft(parameter));
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-900">Add Parameter</h4>
                    <ParameterDraftForm value={newParameter} onChange={setNewParameter} />
                    <div className="mt-3 flex justify-end">
                        <Button size="sm" onClick={addParameter} loading={createParameter.isPending}>
                            <Plus className="mr-1 h-4 w-4" />
                            Add Parameter
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreateDefinitionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { showSuccess, showError } = useToast();
    const createDefinition = useCreateLabTestDefinition();
    const [form, setForm] = useState({
        code: '',
        name: '',
        short_name: '',
        category: '',
        specimen: '',
        method: '',
        price: '',
        description: '',
    });
    const [parameters, setParameters] = useState<ParameterDraft[]>([emptyParameter()]);

    const submit = async () => {
        if (!form.code.trim() || !form.name.trim()) {
            showError('Test code and name are required.');
            return;
        }

        const payload: LabTestDefinitionPayload = {
            ...cleanDefinitionPayload(form),
            parameters: parameters
                .filter(parameter => parameter.code.trim() && parameter.name.trim())
                .map((parameter, index) => parameterPayload(parameter, index + 1)),
        };

        try {
            await createDefinition.mutateAsync(payload);
            showSuccess('Lab test definition created.');
            setForm({ code: '', name: '', short_name: '', category: '', specimen: '', method: '', price: '', description: '' });
            setParameters([emptyParameter()]);
            onClose();
        } catch (error: unknown) {
            showError(getErrorMessage(error, 'Failed to create lab test definition.'));
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New Lab Test Definition"
            size="xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={submit} loading={createDefinition.isPending}>Create Test</Button>
                </>
            }
        >
            <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Test Name" required>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Liver function test" />
                    </FormField>
                    <FormField label="Code" required hint="Lowercase identifier, for example lft">
                        <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="lft" />
                    </FormField>
                    <FormField label="Short Name">
                        <Input value={form.short_name} onChange={e => setForm(f => ({ ...f, short_name: e.target.value }))} placeholder="LFT" />
                    </FormField>
                    <FormField label="Category">
                        <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Chemistry" />
                    </FormField>
                    <FormField label="Specimen">
                        <Input value={form.specimen} onChange={e => setForm(f => ({ ...f, specimen: e.target.value }))} placeholder="Blood" />
                    </FormField>
                    <FormField label="Method">
                        <Input value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} />
                    </FormField>
                    <FormField label="Price">
                        <Input type="number" min={0} step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                    </FormField>
                    <FormField label="Description" className="sm:col-span-2">
                        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </FormField>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">Initial Parameters</h3>
                    </div>
                    <div className="space-y-4">
                        {parameters.map((parameter, index) => (
                            <div key={index} className="border border-slate-200 p-3">
                                <ParameterDraftForm
                                    value={parameter}
                                    onChange={next => setParameters(items => items.map((item, itemIndex) => itemIndex === index ? next : item))}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="sticky bottom-0 mt-4 flex justify-end border-t border-slate-200 bg-white/95 py-3">
                        <Button size="sm" variant="outline" onClick={() => setParameters(items => [...items, emptyParameter()])}>
                            <Plus className="mr-1 h-4 w-4" />
                            Add Parameter
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function ParameterDraftForm({ value, onChange }: { value: ParameterDraft; onChange: (value: ParameterDraft) => void }) {
    return (
        <div className="mt-3 grid gap-3 md:grid-cols-4">
            <FormField label="Code">
                <Input value={value.code} onChange={e => onChange({ ...value, code: e.target.value })} placeholder="ast" />
            </FormField>
            <FormField label="Name">
                <Input value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} placeholder="AST" />
            </FormField>
            <FormField label="Type">
                <ValueTypeSelect value={value.value_type} onChange={next => onChange({ ...value, value_type: next })} />
            </FormField>
            <FormField label="Unit">
                <Input value={value.unit} onChange={e => onChange({ ...value, unit: e.target.value })} placeholder="U/L" />
            </FormField>
            <FormField label="Reference Min">
                <Input type="number" step="any" value={value.reference_min} onChange={e => onChange({ ...value, reference_min: e.target.value })} />
            </FormField>
            <FormField label="Reference Max">
                <Input type="number" step="any" value={value.reference_max} onChange={e => onChange({ ...value, reference_max: e.target.value })} />
            </FormField>
            <FormField label="Normal Text Values">
                <Input value={value.normal_values} onChange={e => onChange({ ...value, normal_values: e.target.value })} placeholder="negative, non-reactive" />
            </FormField>
            <FormField label="Abnormal Text Values">
                <Input value={value.abnormal_values} onChange={e => onChange({ ...value, abnormal_values: e.target.value })} placeholder="positive, reactive" />
            </FormField>
        </div>
    );
}

function ValueTypeSelect({ value, onChange }: { value: LabValueType; onChange: (value: LabValueType) => void }) {
    return (
        <Select value={value} onChange={e => onChange(e.target.value as LabValueType)}>
            <option value="numeric">Numeric</option>
            <option value="text">Text</option>
            <option value="both">Both</option>
        </Select>
    );
}

function cleanDefinitionPayload(form: {
    code: string;
    name: string;
    short_name: string;
    category: string;
    specimen: string;
    method: string;
    price: string;
    description: string;
    is_active?: boolean;
}): LabTestDefinitionPayload {
    return {
        code: form.code.trim().toLowerCase(),
        name: form.name.trim(),
        short_name: form.short_name.trim() || undefined,
        category: form.category.trim() || undefined,
        specimen: form.specimen.trim() || undefined,
        method: form.method.trim() || undefined,
        price: parseNumber(form.price) ?? 0,
        description: form.description.trim() || undefined,
        is_active: form.is_active,
    };
}
