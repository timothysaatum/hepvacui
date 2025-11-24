import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVaccine } from '../../hooks/useVaccines';
import { useAuth } from '../../context/AuthContext';
import { createVaccineSchema, type CreateVaccineFormData } from '../../utils/validationSchemas';

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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Vaccine</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vaccine Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vaccine Name *
            </label>
            <input
              type="text"
              {...register('vaccine_name')}
              placeholder="e.g., COVID-19 Pfizer"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.vaccine_name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
            {errors.vaccine_name && (
              <p className="mt-1 text-sm text-red-600">{errors.vaccine_name.message}</p>
            )}
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number *
            </label>
            <input
              type="text"
              {...register('batch_number')}
              placeholder="e.g., BN-2024-001"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.batch_number
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
            {errors.batch_number && (
              <p className="mt-1 text-sm text-red-600">{errors.batch_number.message}</p>
            )}
          </div>

          {/* Price Per Dose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Dose ($) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price_per_dose', { valueAsNumber: true })}
              placeholder="0.00"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.price_per_dose
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
            {errors.price_per_dose && (
              <p className="mt-1 text-sm text-red-600">{errors.price_per_dose.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Quantity *
            </label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              placeholder="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.quantity
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        {/* Publish Status */}
        <div className="border-t border-gray-200 pt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('is_published')}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Publish vaccine immediately (make visible to users)
            </span>
          </label>
          {isPublished && (
            <p className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              ℹ️ Published vaccines will be visible and available for vaccination records.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isLoading}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting || createMutation.isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Vaccine...
              </span>
            ) : (
              'Add Vaccine'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || createMutation.isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};