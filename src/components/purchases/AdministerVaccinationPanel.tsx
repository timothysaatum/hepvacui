import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { useAdministerVaccination, useCheckEligibility } from '../../hooks/useVaccinePurchases';
import { useAuth } from '../../context/useAuth'
import { createVaccinationSchema, type CreateVaccinationFormData } from '../../utils/vaccinePurchaseValidationSchemas';
import { formatCurrency } from '../../utils/formatters';
import { SlideOverPanel } from './SlideOverPanel';

interface AdministerVaccinationPanelProps {
  purchase: VaccinePurchase | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdministerVaccinationPanel: React.FC<AdministerVaccinationPanelProps> = ({ 
  purchase, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const administerMutation = useAdministerVaccination();
  const { data: eligibility, isPending: eligibilityLoading } = useCheckEligibility(purchase?.id || '');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateVaccinationFormData>({
    resolver: zodResolver(createVaccinationSchema),
    defaultValues: {
      dose_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const onSubmit = async (data: CreateVaccinationFormData) => {
    if (!purchase) return;

    try {
      await administerMutation.mutateAsync({
        purchaseId: purchase.id,
        data: {
          ...data,
          vaccine_purchase_id: purchase.id,
          administered_by_id: user?.id || '',
        },
      });
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getDoseLabel = (doseNumber: number | null) => {
    if (!doseNumber) return 'N/A';
    const labels = ['1st', '2nd', '3rd'];
    return `${labels[doseNumber - 1]} dose`;
  };

  if (!purchase) return null;

  return (
    <SlideOverPanel
      isOpen={!!purchase}
      onClose={onClose}
      title="Administer Vaccination"
      subtitle={purchase.vaccine_name}
      gradientColor="blue"
    >
      <div className="p-6">
        {eligibilityLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : eligibility ? (
          <>
            {/* Eligibility Status */}
            <div className={`border-2 rounded-lg p-4 mb-4 ${
              eligibility.eligible 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start">
                <span className="text-2xl mr-3">
                  {eligibility.eligible ? '✓' : '⚠️'}
                </span>
                <div>
                  <p className={`font-medium ${
                    eligibility.eligible ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {eligibility.eligible ? 'Eligible for Vaccination' : 'Not Eligible'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    eligibility.eligible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {eligibility.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Vaccination Progress */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Vaccination Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Dose:</span>
                  <span className="font-medium text-blue-600">
                    {getDoseLabel(eligibility.next_dose_number)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doses Administered:</span>
                  <span className="font-medium text-gray-900">
                    {eligibility.doses_administered} / {eligibility.total_doses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doses Paid For:</span>
                  <span className="font-medium text-green-600">
                    {eligibility.doses_paid_for} / {eligibility.total_doses}
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vaccine:</span>
                  <span className="font-medium text-gray-900">{purchase.vaccine_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch Number:</span>
                  <span className="font-medium text-gray-900">{purchase.batch_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per Dose:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(purchase.price_per_dose)}
                  </span>
                </div>
              </div>
            </div>

            {eligibility.eligible ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Dose Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dose Date *
                  </label>
                  <input
                    type="date"
                    {...register('dose_date')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.dose_date
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.dose_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.dose_date.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={2}
                    placeholder="Any observations or notes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || administerMutation.isPending}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting || administerMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Administering...
                      </span>
                    ) : (
                      'Administer Dose'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting || administerMutation.isPending}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to check eligibility
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
};