import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Vaccine } from '../../types/vaccine';
import { useAddStock } from '../../hooks/useVaccines';
import { addStockSchema, type AddStockFormData } from '../../utils/validationSchemas';
import { formatNumber } from '../../utils/formatters';
import { X, Package, TrendingUp, Plus, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add Stock</h2>
              <p className="text-sm text-gray-600">{vaccine.vaccine_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Current Stock Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Current Stock
              </span>
              <span className="text-lg font-bold text-blue-600">
                {formatNumber(vaccine.quantity)} units
              </span>
            </div>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <span className="font-medium">Batch:</span>
              <span>{vaccine.batch_number}</span>
            </div>
          </div>

          {/* Quantity to Add */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity to Add <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('quantity_to_add', { valueAsNumber: true })}
                placeholder="Enter quantity"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.quantity_to_add
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-black focus:border-black'
                  }`}
              />
            </div>
            {errors.quantity_to_add && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                {errors.quantity_to_add.message}
              </p>
            )}
          </div>

          {/* New Total Preview */}
          {quantityToAdd > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  New Total
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatNumber(newTotal)} units
                </span>
              </div>
              <div className="text-xs text-gray-600">
                +{formatNumber(quantityToAdd)} units added
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || addStockMutation.isLoading || !quantityToAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSubmitting || addStockMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Stock
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || addStockMutation.isLoading}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};