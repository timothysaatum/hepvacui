import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Patient } from '../../types/patient';
import { useVaccines } from '../../hooks/useVaccines';
import { useCreateVaccinePurchase } from '../../hooks/useVaccinePurchases';
import { useAuth } from '../../context/useAuth'
import { createVaccinePurchaseSchema, type CreateVaccinePurchaseFormData } from '../../utils/vaccinePurchaseValidationSchemas';
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
  onSuccess 
}) => {
  const { user } = useAuth();
  const createPurchaseMutation = useCreateVaccinePurchase();
  const { data: vaccinesData } = useVaccines(1, 100, true); // Get published vaccines

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

  // Update price when vaccine changes
  useEffect(() => {
    if (selectedVaccineId && vaccinesData?.items) {
      const vaccine = vaccinesData.items.find(v => v.id === selectedVaccineId);
      setSelectedVaccinePrice(vaccine?.price_per_dose || 0);
    }
  }, [selectedVaccineId, vaccinesData]);

  const totalPrice = selectedVaccinePrice * (totalDoses || 0);

  const onSubmit = async (data: CreateVaccinePurchaseFormData) => {
    if (!patient) return;

    try {
      await createPurchaseMutation.mutateAsync({
        patientId: patient.id,
        data: {
          ...data,
          patient_id: patient.id,
          created_by_id: user?.id || '',
        },
      });
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!patient) return null;

  return (
    <SlideOverPanel
      isOpen={!!patient}
      onClose={onClose}
      title="Purchase Vaccine"
      subtitle={patient.name}
      width="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">💉</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Vaccine Purchase</p>
              <p>
                Select a vaccine and number of doses. Payment can be made in installments.
              </p>
            </div>
          </div>
        </div>

        {/* Select Vaccine */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Vaccine *
          </label>
          <select
            {...register('vaccine_id')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.vaccine_id
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
          >
            <option value="">-- Select Vaccine --</option>
            {vaccinesData?.items.map((vaccine) => (
              <option key={vaccine.id} value={vaccine.id}>
                {vaccine.vaccine_name} - {formatCurrency(vaccine.price_per_dose)}/dose
              </option>
            ))}
          </select>
          {errors.vaccine_id && (
            <p className="mt-1 text-sm text-red-600">{errors.vaccine_id.message}</p>
          )}
        </div>

        {/* Total Doses */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Doses *
          </label>
          <input
            type="number"
            {...register('total_doses', { valueAsNumber: true })}
            placeholder="3"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.total_doses
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
          />
          {errors.total_doses && (
            <p className="mt-1 text-sm text-red-600">{errors.total_doses.message}</p>
          )}
        </div>

        {/* Price Summary */}
        {selectedVaccineId && totalDoses > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Price per dose:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(selectedVaccinePrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Number of doses:</span>
                <span className="font-medium text-gray-900">{totalDoses}</span>
              </div>
              <div className="border-t border-green-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Package Price:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800">
            ℹ️ Payment can be made in installments. Doses will be administered based on amount paid.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || createPurchaseMutation.isPending}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting || createPurchaseMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            disabled={isSubmitting || createPurchaseMutation.isPending}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
};