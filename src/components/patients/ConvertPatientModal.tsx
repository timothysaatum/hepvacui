import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField, Input, Select, Textarea } from '../common/index';
import { useConvertToRegular } from '../../hooks/usePatients';
import type { PregnancyOutcome } from '../../types/pregnancy';

// Outcome labels defined inline to avoid depending on an external formatters util.
const OUTCOME_OPTIONS: { value: PregnancyOutcome; label: string }[] = [
  { value: 'live_birth', label: 'Live Birth' },
  { value: 'stillbirth', label: 'Stillbirth' },
  { value: 'miscarriage', label: 'Miscarriage' },
  { value: 'abortion', label: 'Abortion' },
  { value: 'ectopic', label: 'Ectopic' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  patient: any;
  /** Called with the patient ID after a successful conversion. Use to navigate away. */
  onSuccess?: (patientId: string) => void;
}

export function ConvertPatientModal({ open, onClose, patient, onSuccess }: Props) {
  const convert = useConvertToRegular((id) => {
    onClose();
    onSuccess?.(id);
  });

  const [form, setForm] = useState({
    outcome: '' as PregnancyOutcome | '',
    actual_delivery_date: '',
    treatment_regimen: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.outcome) return;
    await convert.mutateAsync({
      patientId: patient.id,
      data: {
        outcome: form.outcome as PregnancyOutcome,
        actual_delivery_date: form.actual_delivery_date || undefined,
        treatment_regimen: form.treatment_regimen || undefined,
        notes: form.notes || undefined,
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Convert to Regular Patient"
      subtitle={patient?.name}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={convert.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={convert.isPending}
            disabled={!form.outcome}
          >
            Convert Patient
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          This will close the active pregnancy and transition the patient into
          long-term regular care. All existing records stay linked.
        </div>

        <FormField label="Pregnancy Outcome" required>
          <Select value={form.outcome} onChange={e => set('outcome', e.target.value)}>
            <option value="">Select outcome…</option>
            {OUTCOME_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Delivery Date" hint="Defaults to today if left blank">
          <Input
            type="date"
            value={form.actual_delivery_date}
            onChange={e => set('actual_delivery_date', e.target.value)}
          />
        </FormField>

        <FormField label="Treatment Regimen" hint="For ongoing HIV treatment (optional)">
          <Input
            placeholder="e.g. TDF/3TC/EFV"
            value={form.treatment_regimen}
            onChange={e => set('treatment_regimen', e.target.value)}
          />
        </FormField>

        <FormField label="Notes">
          <Textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </FormField>
      </div>
    </Modal>
  );
}