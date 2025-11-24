import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Vaccine } from '../../types/vaccine';
import { useAddStock } from '../../hooks/useVaccines';
import { addStockSchema, type AddStockFormData } from '../../utils/validationSchemas';
import { formatNumber } from '../../utils/formatters';

interface AddStockModalProps {
  vaccine: Vaccine;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({ vaccine, onClose, onSuccess }) => {
  const addStockMutation = useAddStock();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<AddStockFormData>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      quantity_to_add: 0,
    },
  });

  const quantityToAdd = watch('quantity_to_add');
  const newTotal = vaccine.quantity + (quantityToAdd || 0);

  const onSubmit = async (data: AddStockFormData) => {
    try {
      await addStockMutation.mutateAsync({
        vaccineId: vaccine.id,
        data,
      });
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Stock</h2>
            <p className="text-sm text-gray-600 mt-1">{vaccine.vaccine_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Current Stock Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Current Stock:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatNumber(vaccine.quantity)} units
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Batch: {vaccine.batch_number}
            </div>
          </div>

          {/* Quantity to Add */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add *
            </label>
            <input
              type="number"
              {...register('quantity_to_add', { valueAsNumber: true })}
              placeholder="Enter quantity"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.quantity_to_add
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
            {errors.quantity_to_add && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity_to_add.message}</p>
            )}
          </div>

          {/* New Total Preview */}
          {quantityToAdd > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">New Total:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatNumber(newTotal)} units
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                +{formatNumber(quantityToAdd)} units added
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || addStockMutation.isLoading || !quantityToAdd}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || addStockMutation.isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                'Add Stock'
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || addStockMutation.isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};