import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVaccine } from '../../hooks/useVaccines';
import { useAuth } from '../../context/AuthContext';
import { createVaccineSchema, type CreateVaccineFormData } from '../../utils/validationSchemas';
import { Pill, DollarSign, Package, Eye, Info, Loader2, Plus } from 'lucide-react';

interface CreateVaccineFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateVaccineForm: React.FC<CreateVaccineFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const createMutation = useCreateVaccine();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateVaccineFormData>({
    resolver: zodResolver(createVaccineSchema),
    defaultValues: {
      vaccine_name: '',
      price_per_dose: 0,
      quantity: 0,
      batch_number: '',
      is_published: false,
    },
  });

  const onSubmit = async (data: CreateVaccineFormData) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        added_by_id: user?.id || '',
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isPublished = watch('is_published');

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vaccine Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vaccine Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Pill className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('vaccine_name')}
                  placeholder="e.g., COVID-19 Pfizer"
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
                Batch Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('batch_number')}
                  placeholder="e.g., BN-2024-001"
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
                Price Per Dose ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('price_per_dose', { valueAsNumber: true })}
                  placeholder="0.00"
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
                Initial Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="0"
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
                    Publish vaccine immediately
                  </span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Make this vaccine visible and available for vaccination records
                </p>
              </div>
            </label>
            {isPublished && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Published vaccines will be visible to all users and available for creating vaccination records.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSubmitting || createMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding Vaccine...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Vaccine
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || createMutation.isLoading}
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