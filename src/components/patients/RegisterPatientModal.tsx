import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField, Input, Select, Textarea } from '../common/index';
import { useCreatePregnantPatient, useCreateRegularPatient } from '../../hooks/usePatient';
import { useToast } from '../../context/ToastContext';
import type { PatientType } from '../../types/patient';

interface Props {
    open: boolean;
    onClose: () => void;
    defaultType?: PatientType;
}

export function RegisterPatientModal({ open, onClose, defaultType = 'pregnant' }: Props) {
    const { showSuccess, showError } = useToast();
    const [type, setType] = useState<PatientType>(defaultType);

    const [form, setForm] = useState({
        name: '', phone: '', date_of_birth: '', sex: 'female' as 'male' | 'female',
        // Pregnancy fields
        lmp_date: '', expected_delivery_date: '', gestational_age_weeks: '',
        risk_factors: '', pregnancy_notes: '',
        // Regular fields
        diagnosis_date: '', viral_load: '', treatment_start_date: '',
        treatment_regimen: '', medical_history: '', allergies: '', notes: '',
    });

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const createPregnant = useCreatePregnantPatient();
    const createRegular = useCreateRegularPatient();

    const loading = createPregnant.isPending || createRegular.isPending;

    const handleSubmit = async () => {
        if (!form.name || !form.phone) {
            showError('Name and phone are required.');
            return;
        }

        try {
            if (type === 'pregnant') {
                await createPregnant.mutateAsync({
                    name: form.name,
                    phone: form.phone,
                    sex: 'female',
                    date_of_birth: form.date_of_birth || undefined,
                    first_pregnancy: {
                        lmp_date: form.lmp_date || undefined,
                        expected_delivery_date: form.expected_delivery_date || undefined,
                        gestational_age_weeks: form.gestational_age_weeks ? Number(form.gestational_age_weeks) : undefined,
                        risk_factors: form.risk_factors || undefined,
                        notes: form.pregnancy_notes || undefined,
                    },
                });
            } else {
                await createRegular.mutateAsync({
                    name: form.name,
                    phone: form.phone,
                    sex: form.sex,
                    date_of_birth: form.date_of_birth || undefined,
                    diagnosis_date: form.diagnosis_date || undefined,
                    viral_load: form.viral_load || undefined,
                    treatment_start_date: form.treatment_start_date || undefined,
                    treatment_regimen: form.treatment_regimen || undefined,
                    medical_history: form.medical_history || undefined,
                    allergies: form.allergies || undefined,
                    notes: form.notes || undefined,
                });
            }
            showSuccess('Patient registered successfully.');
            onClose();
        } catch (e: any) {
            showError(e?.response?.data?.detail || 'Failed to register patient.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Register Patient"
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={loading}>Register Patient</Button>
                </>
            }
        >
            {/* Type selector */}
            <div className="flex gap-3 mb-6 p-1 bg-slate-100 rounded-xl">
                {(['pregnant', 'regular'] as PatientType[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === t ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t === 'pregnant' ? '🤰 Pregnant Patient' : '👤 Regular Patient'}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {/* Common fields */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Full Name" required>
                        <Input placeholder="e.g. Akua Mensah" value={form.name} onChange={e => set('name', e.target.value)} />
                    </FormField>
                    <FormField label="Phone Number" required>
                        <Input placeholder="+233501234567" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Date of Birth">
                        <Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                    </FormField>
                    {type === 'regular' && (
                        <FormField label="Sex" required>
                            <Select value={form.sex} onChange={e => set('sex', e.target.value as 'male' | 'female')}>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                            </Select>
                        </FormField>
                    )}
                </div>

                {/* Pregnancy-specific */}
                {type === 'pregnant' && (
                    <>
                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pregnancy Details</p>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Last Menstrual Period (LMP)">
                                    <Input type="date" value={form.lmp_date} onChange={e => set('lmp_date', e.target.value)} />
                                </FormField>
                                <FormField label="Expected Delivery Date">
                                    <Input type="date" value={form.expected_delivery_date} onChange={e => set('expected_delivery_date', e.target.value)} />
                                </FormField>
                                <FormField label="Gestational Age (weeks)">
                                    <Input type="number" min={0} max={45} placeholder="e.g. 24" value={form.gestational_age_weeks} onChange={e => set('gestational_age_weeks', e.target.value)} />
                                </FormField>
                            </div>
                            <div className="mt-4 space-y-3">
                                <FormField label="Risk Factors">
                                    <Textarea placeholder="Any known risk factors..." value={form.risk_factors} onChange={e => set('risk_factors', e.target.value)} />
                                </FormField>
                                <FormField label="Notes">
                                    <Textarea placeholder="Clinical notes..." value={form.pregnancy_notes} onChange={e => set('pregnancy_notes', e.target.value)} />
                                </FormField>
                            </div>
                        </div>
                    </>
                )}

                {/* Regular-specific */}
                {type === 'regular' && (
                    <div className="border-t border-slate-100 pt-4 space-y-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Treatment Information</p>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Diagnosis Date">
                                <Input type="date" value={form.diagnosis_date} onChange={e => set('diagnosis_date', e.target.value)} />
                            </FormField>
                            <FormField label="Treatment Start Date">
                                <Input type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
                            </FormField>
                            <FormField label="Viral Load">
                                <Input placeholder="e.g. Undetectable" value={form.viral_load} onChange={e => set('viral_load', e.target.value)} />
                            </FormField>
                            <FormField label="Treatment Regimen">
                                <Input placeholder="e.g. TDF/3TC/EFV" value={form.treatment_regimen} onChange={e => set('treatment_regimen', e.target.value)} />
                            </FormField>
                        </div>
                        <FormField label="Medical History">
                            <Textarea value={form.medical_history} onChange={e => set('medical_history', e.target.value)} />
                        </FormField>
                        <FormField label="Allergies">
                            <Textarea rows={2} value={form.allergies} onChange={e => set('allergies', e.target.value)} />
                        </FormField>
                    </div>
                )}
            </div>
        </Modal>
    );
}
