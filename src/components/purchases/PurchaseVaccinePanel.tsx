import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Patient } from '../../types/patient';
import { useVaccines } from '../../hooks/useVaccines';
import { useCreateVaccinePurchase } from '../../hooks/useVaccinePurchases';
import {
  createVaccinePurchaseSchema,
  type CreateVaccinePurchaseFormData,
} from '../../utils/vaccinePurchaseValidationSchemas';
import { formatCurrency } from '../../utils/formatters';
import { SlideOverPanel } from './SlideOverPanel';

interface PurchaseVaccinePanelProps {
  patient: Patient | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PurchaseVaccinePanel: React.FC<PurchaseVaccinePanelProps> = ({
  patient,
  onClose,
  onSuccess,
}) => {
  const createPurchaseMutation = useCreateVaccinePurchase();
  const { data: vaccinesData } = useVaccines(1, 100, true); // published vaccines only

  const [selectedVaccinePrice, setSelectedVaccinePrice] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<CreateVaccinePurchaseFormData>({
    resolver: zodResolver(createVaccinePurchaseSchema),
    defaultValues: {
      vaccine_id: '',
      total_doses: 3,
    },
  });

  const selectedVaccineId = watch('vaccine_id');
  const totalDoses = watch('total_doses');

  // Sync price when vaccine selection changes
  useEffect(() => {
    if (selectedVaccineId && vaccinesData?.items) {
      const vaccine = vaccinesData.items.find((v) => v.id === selectedVaccineId);
      setSelectedVaccinePrice(vaccine?.price_per_dose ?? 0);
    } else {
      setSelectedVaccinePrice(0);
    }
  }, [selectedVaccineId, vaccinesData]);

  const totalPrice = selectedVaccinePrice * (totalDoses || 0);

  const onSubmit = async (data: CreateVaccinePurchaseFormData) => {
    if (!patient) return;
    try {
      await createPurchaseMutation.mutateAsync({
        patientId: patient.id,
        // Security: patient_id is set server-side from the URL path.
        // created_by_id is set server-side from the authenticated session.
        // Sending them from the client is redundant and a potential
        // trust-boundary violation.
        data,
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error toast handled inside useCreateVaccinePurchase
      console.error('Purchase error:', error);
    }
  };

  if (!patient) return null;

  const isBusy = isSubmitting || createPurchaseMutation.isPending;

  return (
    <SlideOverPanel
      isOpen={!!patient}
      onClose={onClose}
      title="Purchase Vaccine"
      subtitle={patient.name}
      width="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {/* Info notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden="true">💉</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Vaccine Purchase</p>
              <p>Select a vaccine and number of doses. Payments can be made in installments.</p>
            </div>
          </div>
        </div>

        {/* Select Vaccine */}
        <div>
          <label htmlFor="vaccine-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Vaccine <span className="text-red-500">*</span>
          </label>
          <select
            id="vaccine-select"
            {...register('vaccine_id')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white ${errors.vaccine_id
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
          >
            <option value="">— Select a vaccine —</option>
            {vaccinesData?.items.map((vaccine) => (
              <option key={vaccine.id} value={vaccine.id}>
                {vaccine.vaccine_name} — {formatCurrency(vaccine.price_per_dose)}/dose
              </option>
            ))}
          </select>
          {errors.vaccine_id && (
            <p className="mt-1 text-sm text-red-600">{errors.vaccine_id.message}</p>
          )}
        </div>

        {/* Total Doses */}
        <div>
          <label htmlFor="total-doses" className="block text-sm font-medium text-gray-700 mb-1">
            Total Doses <span className="text-red-500">*</span>
          </label>
          <input
            id="total-doses"
            type="number"
            min={1}
            max={10}
            {...register('total_doses', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.total_doses
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
          />
          {errors.total_doses && (
            <p className="mt-1 text-sm text-red-600">{errors.total_doses.message}</p>
          )}
        </div>

        {/* Price summary */}
        {selectedVaccineId && (totalDoses || 0) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Price per dose</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(selectedVaccinePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Number of doses</span>
                <span className="font-medium text-gray-900">{totalDoses}</span>
              </div>
              <div className="flex justify-between border-t border-green-300 pt-2 mt-2">
                <span className="font-medium text-gray-700">Total Package Price</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            Doses will be administered based on the amount paid.
            Full payment is not required upfront.
          </p>
        </div>

        {createPurchaseMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            Failed to create purchase. Please try again.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isBusy}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Purchase Vaccine'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
};