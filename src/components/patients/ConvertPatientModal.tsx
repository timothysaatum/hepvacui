import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PregnantPatient } from '../../types/patient';
import { useConvertToRegular } from '../../hooks/usePatients';
import { convertToRegularSchema, type ConvertToRegularFormData } from '../../utils/patientValidationSchemas';

interface ConvertPatientModalProps {
  patient: PregnantPatient;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ConvertPatientModal: React.FC<ConvertPatientModalProps> = ({
  patient,
  onClose,
  onSuccess
}) => {
  const convertMutation = useConvertToRegular();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ConvertToRegularFormData>({
    resolver: zodResolver(convertToRegularSchema),
    defaultValues: {
      actual_delivery_date: '',
      treatment_regimen: '',
    },
  });

  const onSubmit = async (data: ConvertToRegularFormData) => {
    try {
      await convertMutation.mutateAsync({
        patientId: patient.id,
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
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Convert to Regular Patient</h2>
            <p className="text-sm text-gray-600 mt-1">{patient.name}</p>
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
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Converting to Regular Patient</p>
                <p>
                  This will change the patient type from "Pregnant" to "Regular" and allow
                  full medical record management. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Expected Delivery Date:</span>
                <span className="font-medium text-gray-900">
                  {patient.expected_delivery_date
                    ? new Date(patient.expected_delivery_date).toLocaleDateString()
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Actual Delivery Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Delivery Date *
            </label>
            <input
              type="date"
              {...register('actual_delivery_date')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.actual_delivery_date
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
            />
            {errors.actual_delivery_date && (
              <p className="mt-1 text-sm text-red-600">{errors.actual_delivery_date.message}</p>
            )}
          </div>

          {/* Treatment Regimen */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment Regimen (Optional)
            </label>
            <input
              type="text"
              {...register('treatment_regimen')}
              placeholder="e.g., TDF/3TC/DTG"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.treatment_regimen
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
            />
            {errors.treatment_regimen && (
              <p className="mt-1 text-sm text-red-600">{errors.treatment_regimen.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              You can add more medical details after conversion
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || convertMutation.isPending}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || convertMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </span>
              ) : (
                'Convert Patient'
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || convertMutation.isPending}
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