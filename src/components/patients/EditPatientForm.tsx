import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Patient, PregnantPatient, RegularPatient } from '../../types/patient';
import {
  useUpdatePregnantPatient,
  useUpdateRegularPatient,
} from '../../hooks/usePatients';
import { useAuth } from '../../context/useAuth';
import {
  updatePregnantPatientSchema,
  updateRegularPatientSchema,
  type UpdatePregnantPatientFormData,
  type UpdateRegularPatientFormData,
} from '../../utils/patientValidationSchemas';

interface EditPatientFormProps {
  patient: Patient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Utility function to clean empty date strings
const cleanDateFields = <T extends Record<string, any>>(data: T): T => {
  const cleaned: any = { ...data };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === '' || cleaned[key] === null) {
      cleaned[key] = undefined;
    }
  });
  return cleaned as T;
};

export const EditPatientForm: React.FC<EditPatientFormProps> = ({
  patient,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const isPregnant = patient.patient_type === 'pregnant';

  const updatePregnantMutation = useUpdatePregnantPatient();
  const updateRegularMutation = useUpdateRegularPatient();

  // Memoize the patient data with proper typing
  const pregnantData = useMemo(() =>
    isPregnant ? (patient as PregnantPatient) : null,
    [patient, isPregnant]
  );

  const regularData = useMemo(() =>
    !isPregnant ? (patient as RegularPatient) : null,
    [patient, isPregnant]
  );

  const {
    register: registerPregnant,
    handleSubmit: handleSubmitPregnant,
    formState: { errors: errorsPregnant, isSubmitting: isSubmittingPregnant },
    reset: resetPregnant,
  } = useForm<UpdatePregnantPatientFormData>({
    resolver: zodResolver(updatePregnantPatientSchema),
  });

  const {
    register: registerRegular,
    handleSubmit: handleSubmitRegular,
    formState: { errors: errorsRegular, isSubmitting: isSubmittingRegular },
    reset: resetRegular,
  } = useForm<UpdateRegularPatientFormData>({
    resolver: zodResolver(updateRegularPatientSchema),
  });

  // Populate form when patient data is available
  useEffect(() => {
    if (isPregnant && pregnantData) {
      resetPregnant({
        name: pregnantData.name,
        phone: pregnantData.phone,
        age: pregnantData.age,
        expected_delivery_date: pregnantData.expected_delivery_date ?? undefined,
        actual_delivery_date: pregnantData.actual_delivery_date ?? undefined,
        status: ['active', 'inactive', 'converted'].includes(pregnantData.status)
          ? (pregnantData.status as 'active' | 'inactive' | 'converted')
          : undefined,
      });
    }
  }, [pregnantData, resetPregnant, isPregnant]);

  useEffect(() => {
    if (!isPregnant && regularData) {
      resetRegular({
        name: regularData.name,
        phone: regularData.phone,
        age: regularData.age,
        diagnosis_date: regularData.diagnosis_date || undefined,
        viral_load: regularData.viral_load || undefined,
        last_viral_load_date: regularData.last_viral_load_date || undefined,
        treatment_start_date: regularData.treatment_start_date || undefined,
        treatment_regimen: regularData.treatment_regimen || undefined,
        medical_history: regularData.medical_history || undefined,
        allergies: regularData.allergies || undefined,
        notes: regularData.notes || undefined,
        status: ['active', 'inactive', 'converted'].includes(regularData.status)
          ? (regularData.status as 'active' | 'inactive' | 'converted')
          : undefined,
      });
    }
  }, [regularData, resetRegular, isPregnant]);

  const onSubmitPregnant = async (data: UpdatePregnantPatientFormData) => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }

    try {
      // Clean empty strings from date fields
      const cleanedData = cleanDateFields(data);

      await updatePregnantMutation.mutateAsync({
        patientId: patient.id,
        data: {
          ...cleanedData,
        },
      });
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const onSubmitRegular = async (data: UpdateRegularPatientFormData) => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }

    try {
      // Clean empty strings from date fields
      const cleanedData = cleanDateFields(data);

      await updateRegularMutation.mutateAsync({
        patientId: patient.id,
        data: {
          ...cleanedData,
        },
      });
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isSubmitting = isSubmittingPregnant || isSubmittingRegular;
  const isMutating = updatePregnantMutation.isPending || updateRegularMutation.isPending;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        Edit {isPregnant ? 'Pregnant' : 'Regular'} Patient
      </h2>

      {/* Pregnant Patient Form */}
      {isPregnant && (
        <form onSubmit={handleSubmitPregnant(onSubmitPregnant)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...registerPregnant('name')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsPregnant.name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
              />
              {errorsPregnant.name && (
                <p className="mt-1 text-sm text-red-600">{errorsPregnant.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...registerPregnant('phone')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsPregnant.phone
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
              />
              {errorsPregnant.phone && (
                <p className="mt-1 text-sm text-red-600">{errorsPregnant.phone.message}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...registerPregnant('age', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsPregnant.age
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
              />
              {errorsPregnant.age && (
                <p className="mt-1 text-sm text-red-600">{errorsPregnant.age.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...registerPregnant('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="converted">Converted</option>
              </select>
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...registerPregnant('expected_delivery_date')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsPregnant.expected_delivery_date
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
              />
              {errorsPregnant.expected_delivery_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errorsPregnant.expected_delivery_date.message}
                </p>
              )}
            </div>

            {/* Actual Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Delivery Date (Optional)
              </label>
              <input
                type="date"
                {...registerPregnant('actual_delivery_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isMutating}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || isMutating ? 'Updating...' : 'Update Patient'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || isMutating}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Regular Patient Form */}
      {!isPregnant && (
        <form onSubmit={handleSubmitRegular(onSubmitRegular)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...registerRegular('name')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsRegular.name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
              />
              {errorsRegular.name && (
                <p className="mt-1 text-sm text-red-600">{errorsRegular.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...registerRegular('phone')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsRegular.phone
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
              />
              {errorsRegular.phone && (
                <p className="mt-1 text-sm text-red-600">{errorsRegular.phone.message}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...registerRegular('age', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsRegular.age
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
              />
              {errorsRegular.age && (
                <p className="mt-1 text-sm text-red-600">{errorsRegular.age.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...registerRegular('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="converted">Converted</option>
              </select>
            </div>

            {/* Diagnosis Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Date (Optional)
              </label>
              <input
                type="date"
                {...registerRegular('diagnosis_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Treatment Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Start Date (Optional)
              </label>
              <input
                type="date"
                {...registerRegular('treatment_start_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Viral Load */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viral Load (Optional)
              </label>
              <input
                type="text"
                {...registerRegular('viral_load')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Last Viral Load Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Viral Load Date (Optional)
              </label>
              <input
                type="date"
                {...registerRegular('last_viral_load_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Treatment Regimen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Regimen (Optional)
              </label>
              <input
                type="text"
                {...registerRegular('treatment_regimen')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Allergies */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies (Optional)
              </label>
              <textarea
                {...registerRegular('allergies')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Medical History */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical History (Optional)
              </label>
              <textarea
                {...registerRegular('medical_history')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                {...registerRegular('notes')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isMutating}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || isMutating ? 'Updating...' : 'Update Patient'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || isMutating}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};