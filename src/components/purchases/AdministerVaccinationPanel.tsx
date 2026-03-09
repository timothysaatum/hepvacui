import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { useAdministerVaccination, useCheckEligibility } from '../../hooks/useVaccinePurchases';
import {
  createVaccinationSchema,
  type CreateVaccinationFormData,
} from '../../utils/vaccinePurchaseValidationSchemas';
import { formatCurrency } from '../../utils/formatters';
import { SlideOverPanel } from './SlideOverPanel';

interface AdministerVaccinationPanelProps {
  purchase: VaccinePurchase | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const DOSE_LABELS: Record<number, string> = {
  1: '1st dose',
  2: '2nd dose',
  3: '3rd dose',
};

const getDoseLabel = (doseNumber: number | null): string =>
  doseNumber != null ? DOSE_LABELS[doseNumber] ?? `Dose ${doseNumber}` : 'N/A';

export const AdministerVaccinationPanel: React.FC<AdministerVaccinationPanelProps> = ({
  purchase,
  onClose,
  onSuccess,
}) => {
  const administerMutation = useAdministerVaccination();
  const { data: eligibility, isPending: eligibilityLoading } = useCheckEligibility(
    purchase?.id ?? ''
  );

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
        // Security: vaccine_purchase_id is set server-side from the URL path.
        // administered_by_id is set server-side from the authenticated session.
        // Neither should be trusted from the client payload.
        data,
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error toast handled inside useAdministerVaccination
      console.error('Administer vaccination error:', error);
    }
  };

  if (!purchase) return null;

  const isBusy = isSubmitting || administerMutation.isPending;

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
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : eligibility ? (
          <>
            {/* Eligibility badge */}
            <div
              className={`border-2 rounded-lg p-4 mb-4 ${eligibility.eligible
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
                }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {eligibility.eligible ? '✓' : '⚠️'}
                </span>
                <div>
                  <p
                    className={`font-medium ${eligibility.eligible ? 'text-green-800' : 'text-red-800'
                      }`}
                  >
                    {eligibility.eligible ? 'Eligible for Vaccination' : 'Not Currently Eligible'}
                  </p>
                  <p
                    className={`text-sm mt-1 ${eligibility.eligible ? 'text-green-700' : 'text-red-700'
                      }`}
                  >
                    {eligibility.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Vaccination progress */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Vaccination Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Dose</span>
                  <span className="font-medium text-blue-600">
                    {getDoseLabel(eligibility.next_dose_number)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doses Administered</span>
                  <span className="font-medium text-gray-900">
                    {eligibility.doses_administered} / {eligibility.total_doses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doses Paid For</span>
                  <span className="font-medium text-green-600">
                    {eligibility.doses_paid_for} / {eligibility.total_doses}
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vaccine</span>
                  <span className="font-medium text-gray-900">{purchase.vaccine_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch Number</span>
                  <span className="font-medium text-gray-900">{purchase.batch_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per Dose</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(purchase.price_per_dose)}
                  </span>
                </div>
              </div>
            </div>

            {eligibility.eligible ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Dose date */}
                <div>
                  <label htmlFor="dose-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Dose Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dose-date"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    {...register('dose_date')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.dose_date
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                  />
                  {errors.dose_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.dose_date.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="vaccination-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes{' '}
                    <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="vaccination-notes"
                    {...register('notes')}
                    rows={2}
                    placeholder="Any observations or notes..."
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>

                {administerMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                    Failed to administer dose. Please try again.
                  </div>
                )}

                <div className="flex gap-3">
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
                        Administering...
                      </span>
                    ) : (
                      'Administer Dose'
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
          <div className="text-center py-12 text-gray-500">
            <p className="text-3xl mb-2" aria-hidden="true">⚠️</p>
            <p className="text-sm">Failed to check eligibility. Please close and try again.</p>
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
};