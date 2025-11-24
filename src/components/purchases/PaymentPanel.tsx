import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { useCreatePayment } from '../../hooks/useVaccinePurchases';
import { useAuth } from '../../context/AuthContext';
import { createPaymentSchema, type CreatePaymentFormData } from '../../utils/vaccinePurchaseValidationSchemas';
import { formatCurrency } from '../../utils/formatters';
import { SlideOverPanel } from './SlideOverPanel';

interface PaymentPanelProps {
  purchase: VaccinePurchase | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
  purchase, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const createPaymentMutation = useCreatePayment();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: 0,
      payment_method: 'cash',
      reference_number: '',
    },
  });

  const paymentAmount = watch('amount');
  const remainingBalance = purchase ? purchase.balance - (paymentAmount || 0) : 0;

  const onSubmit = async (data: CreatePaymentFormData) => {
    if (!purchase) return;

    try {
      await createPaymentMutation.mutateAsync({
        purchaseId: purchase.id,
        data: {
          ...data,
          vaccine_purchase_id: purchase.id,
          received_by_id: user?.id || '',
        },
      });
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!purchase) return null;

  return (
    <SlideOverPanel
      isOpen={!!purchase}
      onClose={onClose}
      title="Record Payment"
      subtitle={purchase.vaccine_name}
      gradientColor="green"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Purchase Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Package Price:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(purchase.total_package_price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(purchase.amount_paid)}
              </span>
            </div>
            <div className="flex justify-between border-t border-blue-300 pt-2">
              <span className="font-medium text-gray-700">Current Balance:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(purchase.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount (GHS) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            placeholder="0.00"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.amount
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setValue('amount', purchase.balance)}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
            >
              Pay Full Balance
            </button>
            <button
              type="button"
              onClick={() => setValue('amount', purchase.price_per_dose)}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Pay for 1 Dose
            </button>
          </div>
        </div>

        {/* Remaining Balance Preview */}
        {paymentAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Remaining Balance:</span>
              <span className={`text-lg font-bold ${remainingBalance <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(Math.max(0, remainingBalance))}
              </span>
            </div>
            {remainingBalance <= 0 && (
              <p className="text-xs text-green-600 mt-2">✓ Package will be fully paid</p>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method *
          </label>
          <select
            {...register('payment_method')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.payment_method
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
          >
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
          </select>
          {errors.payment_method && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
          )}
        </div>

        {/* Reference Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number (Optional)
          </label>
          <input
            type="text"
            {...register('reference_number')}
            placeholder="e.g., TXN123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.reference_number && (
            <p className="mt-1 text-sm text-red-600">{errors.reference_number.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || createPaymentMutation.isLoading || !paymentAmount}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting || createPaymentMutation.isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recording...
              </span>
            ) : (
              'Record Payment'
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || createPaymentMutation.isLoading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
};