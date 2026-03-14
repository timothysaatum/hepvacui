import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField, Input, Textarea } from '../common/index';
import { useReRegisterAsPregnant } from '../../hooks/usePatients';

interface Props {
    open: boolean;
    onClose: () => void;
    patient: any;
    /** Called with the patient ID after successful re-registration. Use to navigate away. */
    onSuccess?: (patientId: string) => void;
}

export function ReRegisterPregnantModal({ open, onClose, patient, onSuccess }: Props) {
    const reRegister = useReRegisterAsPregnant((id) => {
        onClose();
        onSuccess?.(id);
    });

    const [form, setForm] = useState({
        lmp_date: '',
        expected_delivery_date: '',
        gestational_age_weeks: '',
        risk_factors: '',
        notes: '',
    });

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        await reRegister.mutateAsync({
            patientId: patient.id,
            data: {
                lmp_date: form.lmp_date || undefined,
                expected_delivery_date: form.expected_delivery_date || undefined,
                gestational_age_weeks: form.gestational_age_weeks
                    ? Number(form.gestational_age_weeks)
                    : undefined,
                risk_factors: form.risk_factors || undefined,
                notes: form.notes || undefined,
            },
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Re-register as Pregnant"
            subtitle={patient?.name}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={reRegister.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} loading={reRegister.isPending}>
                        Re-register
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-800">
                    This opens a new pregnancy episode for this patient. Her previous
                    pregnancy history, children, and all records remain intact.
                    All fields are optional — clinical data can be updated later.
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="LMP Date">
                        <Input
                            type="date"
                            value={form.lmp_date}
                            onChange={e => set('lmp_date', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Expected Delivery Date">
                        <Input
                            type="date"
                            value={form.expected_delivery_date}
                            onChange={e => set('expected_delivery_date', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Gestational Age (weeks)">
                        <Input
                            type="number"
                            min={0}
                            max={45}
                            value={form.gestational_age_weeks}
                            onChange={e => set('gestational_age_weeks', e.target.value)}
                        />
                    </FormField>
                </div>

                <FormField label="Risk Factors">
                    <Textarea
                        rows={2}
                        value={form.risk_factors}
                        onChange={e => set('risk_factors', e.target.value)}
                    />
                </FormField>

                <FormField label="Notes">
                    <Textarea
                        rows={2}
                        value={form.notes}
                        onChange={e => set('notes', e.target.value)}
                    />
                </FormField>
            </div>
        </Modal>
    );
}