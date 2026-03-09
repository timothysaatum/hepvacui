import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField, Input, Select, Textarea } from '../common/index';
import { useOpenPregnancy, useUpdatePregnancy, useClosePregnancy } from '../../hooks/usePregnancy';
import { useCreateChild, useUpdateChild } from '../../hooks/useChildren';
import { useToast } from '../../context/ToastContext';
import type { Pregnancy, PregnancyOutcome } from '../../types/pregnancy';
import type { Child } from '../../types/child';
import { PREGNANCY_OUTCOME_LABELS } from '../../utils/formatters';

const OUTCOMES: PregnancyOutcome[] = ['live_birth', 'stillbirth', 'miscarriage', 'abortion', 'ectopic'];

// ── Open Pregnancy ─────────────────────────────────────────────────────────────

export function OpenPregnancyModal({ open, onClose, patientId }: { open: boolean; onClose: () => void; patientId: string }) {
    const { showSuccess, showError } = useToast();
    const mutation = useOpenPregnancy(); // no args
    const [form, setForm] = useState({ lmp_date: '', expected_delivery_date: '', gestational_age_weeks: '', risk_factors: '', notes: '' });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        try {
            await mutation.mutateAsync({
                patientId,
                data: {
                    lmp_date: form.lmp_date || undefined,
                    expected_delivery_date: form.expected_delivery_date || undefined,
                    gestational_age_weeks: form.gestational_age_weeks ? Number(form.gestational_age_weeks) : undefined,
                    risk_factors: form.risk_factors || undefined,
                    notes: form.notes || undefined,
                },
            });
            showSuccess('New pregnancy episode opened.');
            onClose();
        } catch (e: any) { showError(e?.response?.data?.detail || 'Failed to open pregnancy.'); }
    };

    return (
        <Modal open={open} onClose={onClose} title="Open New Pregnancy" size="md"
            footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} loading={mutation.isPending}>Open Pregnancy</Button></>}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="LMP Date"><Input type="date" value={form.lmp_date} onChange={e => set('lmp_date', e.target.value)} /></FormField>
                    <FormField label="Expected Delivery Date"><Input type="date" value={form.expected_delivery_date} onChange={e => set('expected_delivery_date', e.target.value)} /></FormField>
                    <FormField label="Gestational Age (weeks)"><Input type="number" min={0} max={45} value={form.gestational_age_weeks} onChange={e => set('gestational_age_weeks', e.target.value)} /></FormField>
                </div>
                <FormField label="Risk Factors"><Textarea value={form.risk_factors} onChange={e => set('risk_factors', e.target.value)} /></FormField>
                <FormField label="Notes"><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
            </div>
        </Modal>
    );
}

// ── Update Pregnancy ──────────────────────────────────────────────────────────

export function UpdatePregnancyModal({ open, onClose, pregnancy, patientId }: { open: boolean; onClose: () => void; pregnancy: Pregnancy; patientId: string }) {
    const { showSuccess, showError } = useToast();
    const mutation = useUpdatePregnancy(); // no args
    const [form, setForm] = useState({
        lmp_date: pregnancy.lmp_date ?? '',
        expected_delivery_date: pregnancy.expected_delivery_date ?? '',
        gestational_age_weeks: String(pregnancy.gestational_age_weeks ?? ''),
        risk_factors: pregnancy.risk_factors ?? '',
        notes: pregnancy.notes ?? '',
    });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        try {
            await mutation.mutateAsync({
                pregnancyId: pregnancy.id,
                patientId,
                data: {
                    lmp_date: form.lmp_date || undefined,
                    expected_delivery_date: form.expected_delivery_date || undefined,
                    gestational_age_weeks: form.gestational_age_weeks ? Number(form.gestational_age_weeks) : undefined,
                    risk_factors: form.risk_factors || undefined,
                    notes: form.notes || undefined,
                },
            });
            showSuccess('Pregnancy updated.');
            onClose();
        } catch (e: any) { showError(e?.response?.data?.detail || 'Update failed.'); }
    };

    return (
        <Modal open={open} onClose={onClose} title="Update Pregnancy" size="md"
            footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} loading={mutation.isPending}>Save Changes</Button></>}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="LMP Date"><Input type="date" value={form.lmp_date} onChange={e => set('lmp_date', e.target.value)} /></FormField>
                    <FormField label="Expected Delivery Date"><Input type="date" value={form.expected_delivery_date} onChange={e => set('expected_delivery_date', e.target.value)} /></FormField>
                    <FormField label="Gestational Age (weeks)"><Input type="number" min={0} max={45} value={form.gestational_age_weeks} onChange={e => set('gestational_age_weeks', e.target.value)} /></FormField>
                </div>
                <FormField label="Risk Factors"><Textarea value={form.risk_factors} onChange={e => set('risk_factors', e.target.value)} /></FormField>
                <FormField label="Notes"><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
            </div>
        </Modal>
    );
}

// ── Close Pregnancy ───────────────────────────────────────────────────────────

export function ClosePregnancyModal({ open, onClose, pregnancy, patientId }: { open: boolean; onClose: () => void; pregnancy: Pregnancy; patientId: string }) {
    const { showSuccess, showError } = useToast();
    const mutation = useClosePregnancy(); // no args
    const [form, setForm] = useState({ outcome: '' as PregnancyOutcome | '', delivery_date: '' });

    const PARA_OUTCOMES: PregnancyOutcome[] = ['live_birth', 'stillbirth'];

    const handleSubmit = async () => {
        if (!form.outcome) { showError('Please select an outcome.'); return; }
        try {
            await mutation.mutateAsync({
                pregnancyId: pregnancy.id,
                patientId,
                data: {
                    outcome: form.outcome as PregnancyOutcome,
                    delivery_date: form.delivery_date || undefined,
                    increment_para: PARA_OUTCOMES.includes(form.outcome as PregnancyOutcome),
                },
            });
            showSuccess('Pregnancy closed.');
            onClose();
        } catch (e: any) { showError(e?.response?.data?.detail || 'Failed to close pregnancy.'); }
    };

    return (
        <Modal open={open} onClose={onClose} title="Close Pregnancy" subtitle={`Pregnancy #${pregnancy.pregnancy_number}`} size="sm"
            footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={handleSubmit} loading={mutation.isPending}>Close Pregnancy</Button></>}
        >
            <div className="space-y-4">
                <FormField label="Outcome" required>
                    <Select value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value as PregnancyOutcome }))}>
                        <option value="">Select outcome…</option>
                        {OUTCOMES.map(o => <option key={o} value={o}>{PREGNANCY_OUTCOME_LABELS[o]}</option>)}
                    </Select>
                </FormField>
                <FormField label="Delivery Date" hint="Defaults to today if left blank">
                    <Input type="date" value={form.delivery_date} onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))} />
                </FormField>
            </div>
        </Modal>
    );
}

// ── Add Child ─────────────────────────────────────────────────────────────────

export function AddChildModal({ open, onClose, pregnancy, patientId }: { open: boolean; onClose: () => void; pregnancy: Pregnancy; patientId: string }) {
    const { showSuccess, showError } = useToast();
    const mutation = useCreateChild(); // no args
    const [form, setForm] = useState({ name: '', date_of_birth: '', sex: '' as 'male' | 'female' | '', notes: '' });
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.date_of_birth) { showError('Date of birth is required.'); return; }
        try {
            await mutation.mutateAsync({
                pregnancyId: pregnancy.id,
                patientId,
                data: {
                    name: form.name || undefined,
                    date_of_birth: form.date_of_birth,
                    sex: form.sex || undefined,
                    notes: form.notes || undefined,
                },
            });
            showSuccess('Child record created.');
            onClose();
        } catch (e: any) { showError(e?.response?.data?.detail || 'Failed to create child record.'); }
    };

    return (
        <Modal open={open} onClose={onClose} title="Add Child" subtitle={`From Pregnancy #${pregnancy.pregnancy_number}`} size="sm"
            footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} loading={mutation.isPending}>Add Child</Button></>}
        >
            <div className="space-y-4">
                <FormField label="Child's Name"><Input placeholder="Optional" value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Date of Birth" required><Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /></FormField>
                    <FormField label="Sex">
                        <Select value={form.sex} onChange={e => set('sex', e.target.value)}>
                            <option value="">Unknown</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                        </Select>
                    </FormField>
                </div>
                <FormField label="Notes"><Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
            </div>
        </Modal>
    );
}

// ── Update Child ──────────────────────────────────────────────────────────────

export function UpdateChildModal({ open, onClose, child, patientId }: { open: boolean; onClose: () => void; child: Child; patientId: string }) {
    const { showSuccess, showError } = useToast();
    const mutation = useUpdateChild(); // no args
    const [form, setForm] = useState({
        six_month_checkup_date: child.six_month_checkup_date ?? '',
        six_month_checkup_completed: child.six_month_checkup_completed,
        hep_b_antibody_test_result: child.hep_b_antibody_test_result ?? '',
        test_date: child.test_date ?? '',
        notes: child.notes ?? '',
    });
    const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        try {
            await mutation.mutateAsync({
                childId: child.id,
                pregnancyId: child.pregnancy_id,
                patientId,
                data: {
                    six_month_checkup_date: form.six_month_checkup_date || undefined,
                    six_month_checkup_completed: form.six_month_checkup_completed,
                    hep_b_antibody_test_result: form.hep_b_antibody_test_result || undefined,
                    test_date: form.test_date || undefined,
                    notes: form.notes || undefined,
                },
            });
            showSuccess('Child record updated.');
            onClose();
        } catch (e: any) { showError(e?.response?.data?.detail || 'Update failed.'); }
    };

    return (
        <Modal open={open} onClose={onClose} title="Update Child Record" subtitle={child.name || 'Unnamed child'} size="sm"
            footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} loading={mutation.isPending}>Save</Button></>}
        >
            <div className="space-y-4">
                <FormField label="6-Month Checkup Date"><Input type="date" value={form.six_month_checkup_date} onChange={e => set('six_month_checkup_date', e.target.value)} /></FormField>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="checkup_done" checked={form.six_month_checkup_completed} onChange={e => set('six_month_checkup_completed', e.target.checked)} className="w-4 h-4 text-teal-600" />
                    <label htmlFor="checkup_done" className="text-sm text-slate-700">6-Month checkup completed</label>
                </div>
                <FormField label="Hep B Antibody Test Result">
                    <Select value={form.hep_b_antibody_test_result} onChange={e => set('hep_b_antibody_test_result', e.target.value)}>
                        <option value="">Not tested</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="indeterminate">Indeterminate</option>
                        <option value="pending">Pending</option>
                    </Select>
                </FormField>
                <FormField label="Test Date"><Input type="date" value={form.test_date} onChange={e => set('test_date', e.target.value)} /></FormField>
                <FormField label="Notes"><Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
            </div>
        </Modal>
    );
}