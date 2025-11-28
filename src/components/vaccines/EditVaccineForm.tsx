import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVaccine, useUpdateVaccine } from '../../hooks/useVaccines';
import { updateVaccineSchema, type UpdateVaccineFormData } from '../../utils/validationSchemas';
import { Pill, DollarSign, Package, Eye, Info, Loader2, Save, AlertTriangle } from 'lucide-react';

interface EditVaccineFormProps {
  vaccineId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditVaccineForm: React.FC<EditVaccineFormProps> = ({
  vaccineId,
  onSuccess,
  onCancel,
}) => {
  const { data: vaccine, isLoading: fetchLoading, error: fetchError } = useVaccine(vaccineId);
  const updateMutation = useUpdateVaccine();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UpdateVaccineFormData>({
    resolver: zodResolver(updateVaccineSchema),
  });

  useEffect(() => {
    if (vaccine) {
      reset({
        vaccine_name: vaccine.vaccine_name,
        price_per_dose: vaccine.price_per_dose,
        quantity: vaccine.quantity,
        batch_number: vaccine.batch_number,
        is_published: vaccine.is_published,
      });
    }
  }, [vaccine, reset]);

  const onSubmit = async (data: UpdateVaccineFormData) => {
    try {
      await updateMutation.mutateAsync({ vaccineId, data });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isPublished = watch('is_published');

  if (fetchLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading vaccine data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Failed to load vaccine data</h3>
              <p className="text-sm text-red-700 mt-0.5">Please try again later</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vaccine Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vaccine Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Pill className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('vaccine_name')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.vaccine_name
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.vaccine_name && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.vaccine_name.message}
                </p>
              )}
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Batch Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('batch_number')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.batch_number
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.batch_number && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.batch_number.message}
                </p>
              )}
            </div>

            {/* Price Per Dose */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Per Dose ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('price_per_dose', { valueAsNumber: true })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.price_per_dose
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.price_per_dose && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.price_per_dose.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.quantity
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.quantity && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.quantity.message}
                </p>
              )}
              <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <p className="text-xs text-amber-700 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  To add stock, use the "Add Stock" button from the vaccine list instead
                </p>
              </div>
            </div>
          </div>

          {/* Publish Status */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-start cursor-pointer group">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  {...register('is_published')}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                />
              </div>
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Published (visible to users)
                  </span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Control whether this vaccine is visible and available for use
                </p>
              </div>
            </label>
            {isPublished && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700">
                    This vaccine is currently published and visible to all users.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSubmitting || updateMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Vaccine
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || updateMutation.isLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};