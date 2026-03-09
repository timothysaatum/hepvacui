import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField, Input, Select, Textarea } from '../common/index';
import { useConvertToRegular } from '../../hooks/usePatient';
import { useToast } from '../../context/ToastContext';
import type { PregnantPatient } from '../../types/patient';
import type { PregnancyOutcome } from '../../types/pregnancy';
import { PREGNANCY_OUTCOME_LABELS } from '../../utils/formatters';

const OUTCOMES: PregnancyOutcome[] = ['live_birth', 'stillbirth', 'miscarriage', 'abortion', 'ectopic'];

interface Props {
  open: boolean;
  onClose: () => void;
  patient: PregnantPatient;
}

export function ConvertPatientModal({ open, onClose, patient }: Props) {
  const { showError } = useToast();
  // useConvertToRegular() takes no args — patientId goes in mutateAsync variables
  const convert = useConvertToRegular();
  const [form, setForm] = useState({
    outcome: '' as PregnancyOutcome | '',
    actual_delivery_date: '',
    treatment_regimen: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.outcome) { showError('Please select a pregnancy outcome.'); return; }
    try {
      await convert.mutateAsync({
        patientId: patient.id,
        data: {
          outcome: form.outcome as PregnancyOutcome,
          actual_delivery_date: form.actual_delivery_date || undefined,
          treatment_regimen: form.treatment_regimen || undefined,
          notes: form.notes || undefined,
        },
      });
      onClose();
    } catch {
      // error toast handled by onError in hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Convert to Regular Patient"
      subtitle={`${patient.name} — close active pregnancy and transition to long-term care`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={convert.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} loading={convert.isPending}>Confirm Conversion</Button>
        </>
      }
    >
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
        ⚠️ This will close the active pregnancy and convert the patient to the regular treatment pathway. This action cannot be undone.
      </div>

      <div className="space-y-4">
        <FormField label="Pregnancy Outcome" required>
          <Select value={form.outcome} onChange={e => set('outcome', e.target.value)}>
            <option value="">Select outcome…</option>
            {OUTCOMES.map(o => (
              <option key={o} value={o}>{PREGNANCY_OUTCOME_LABELS[o]}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Actual Delivery Date">
          <Input type="date" value={form.actual_delivery_date} onChange={e => set('actual_delivery_date', e.target.value)} />
        </FormField>

        <FormField label="Treatment Regimen" hint="HIV regimen to start post-delivery">
          <Input placeholder="e.g. TDF/3TC/EFV" value={form.treatment_regimen} onChange={e => set('treatment_regimen', e.target.value)} />
        </FormField>

        <FormField label="Notes">
          <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} />
        </FormField>
      </div>
    </Modal>
  );
}