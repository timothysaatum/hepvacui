import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useConvertToRegular } from '../../hooks/usePatients';

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

  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async () => {
    if (!confirmed) return;
    await convert.mutateAsync({
      patientId: patient.id,
      data: {},
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
            disabled={!confirmed}
          >
            Convert Patient
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Conversion is available only after the active pregnancy has been closed from the Pregnancy tab.
          Existing pregnancy history, children, vaccines, lab tests, and clinical records remain linked and viewable.
        </div>

        <label className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={event => setConfirmed(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span>
            I confirm there is no active pregnancy and this patient should continue as a regular patient.
          </span>
        </label>
      </div>
    </Modal>
  );
}
