import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePregnantPatient, useCreateRegularPatient } from '../../hooks/usePatients';
import { useAuth } from '../../context/AuthContext';
import {
  createPregnantPatientSchema,
  createRegularPatientSchema,
  type CreatePregnantPatientFormData,
  type CreateRegularPatientFormData,
} from '../../utils/patientValidationSchemas';

interface CreatePatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreatePatientForm: React.FC<CreatePatientFormProps> = ({ onSuccess, onCancel }) => {
  useAuth();
  const [patientType, setPatientType] = useState<'pregnant' | 'regular'>('regular');
  const createPregnantMutation = useCreatePregnantPatient();
  const createRegularMutation = useCreateRegularPatient();

  const {
    register: registerPregnant,
    handleSubmit: handleSubmitPregnant,
    formState: { errors: errorsPregnant, isSubmitting: isSubmittingPregnant },
    reset: resetPregnant,
  } = useForm<CreatePregnantPatientFormData>({
    resolver: zodResolver(createPregnantPatientSchema),
    defaultValues: {
      name: '',
      phone: '',
      sex: 'female',
      age: 25,
      expected_delivery_date: '',
    },
  });

  const {
    register: registerRegular,
    handleSubmit: handleSubmitRegular,
    formState: { errors: errorsRegular, isSubmitting: isSubmittingRegular },
    reset: resetRegular,
  } = useForm<CreateRegularPatientFormData>({
    resolver: zodResolver(createRegularPatientSchema),
    defaultValues: {
      name: '',
      phone: '',
      sex: 'male',
      age: 30,
      diagnosis_date: '',
      viral_load: '',
      last_viral_load_date: '',
      treatment_start_date: '',
      treatment_regimen: '',
      medical_history: '',
      allergies: '',
      notes: '',
    },
  });

  const onSubmitPregnant = async (data: CreatePregnantPatientFormData) => {
    try {
      await createPregnantMutation.mutateAsync(data);
      resetPregnant();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const onSubmitRegular = async (data: CreateRegularPatientFormData) => {
    try {
      await createRegularMutation.mutateAsync(data);
      resetRegular();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isLoading = createPregnantMutation.isLoading || createRegularMutation.isLoading;
  const isSubmitting = isSubmittingPregnant || isSubmittingRegular;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Patient</h2>

      {/* Patient Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Patient Type *
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPatientType('regular')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              patientType === 'regular'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-1">👤</div>
            <div className="font-medium">Regular Patient</div>
          </button>
          <button
            type="button"
            onClick={() => setPatientType('pregnant')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              patientType === 'pregnant'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-1">🤰</div>
            <div className="font-medium">Pregnant Patient</div>
          </button>
        </div>
      </div>

      {/* Pregnant Patient Form */}
      {patientType === 'pregnant' && (
        <form onSubmit={handleSubmitPregnant(onSubmitPregnant)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...registerPregnant('name')}
                placeholder="e.g., Mariam Mardia"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsPregnant.name
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
                Phone Number *
              </label>
              <input
                type="text"
                {...registerPregnant('phone')}
                placeholder="e.g., 0594438287"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsPregnant.phone
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
                Age *
              </label>
              <input
                type="number"
                {...registerPregnant('age', { valueAsNumber: true })}
                placeholder="25"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsPregnant.age
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
              />
              {errorsPregnant.age && (
                <p className="mt-1 text-sm text-red-600">{errorsPregnant.age.message}</p>
              )}
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                {...registerPregnant('expected_delivery_date')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsPregnant.expected_delivery_date
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
              />
              {errorsPregnant.expected_delivery_date && (
                <p className="mt-1 text-sm text-red-600">{errorsPregnant.expected_delivery_date.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || isLoading ? 'Adding Patient...' : 'Add Patient'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Regular Patient Form */}
      {patientType === 'regular' && (
        <form onSubmit={handleSubmitRegular(onSubmitRegular)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...registerRegular('name')}
                placeholder="e.g., John Doe"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsRegular.name
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
                Phone Number *
              </label>
              <input
                type="text"
                {...registerRegular('phone')}
                placeholder="e.g., 0201234567"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsRegular.phone
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
              />
              {errorsRegular.phone && (
                <p className="mt-1 text-sm text-red-600">{errorsRegular.phone.message}</p>
              )}
            </div>

            {/* Sex */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex *
              </label>
              <select
                {...registerRegular('sex')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsRegular.sex
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errorsRegular.sex && (
                <p className="mt-1 text-sm text-red-600">{errorsRegular.sex.message}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                {...registerRegular('age', { valueAsNumber: true })}
                placeholder="30"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorsRegular.age
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
              />
              {errorsRegular.age && (
                <p className="mt-1 text-sm text-red-600">{errorsRegular.age.message}</p>
              )}
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Medical Information (Optional)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diagnosis Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis Date
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
                  Treatment Start Date
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
                  Viral Load
                </label>
                <input
                  type="text"
                  {...registerRegular('viral_load')}
                  placeholder="e.g., Undetectable"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Last Viral Load Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Viral Load Date
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
                  Treatment Regimen
                </label>
                <input
                  type="text"
                  {...registerRegular('treatment_regimen')}
                  placeholder="e.g., TDF/3TC/DTG"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Allergies */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <textarea
                  {...registerRegular('allergies')}
                  rows={2}
                  placeholder="List any known allergies"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Medical History */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  {...registerRegular('medical_history')}
                  rows={3}
                  placeholder="Enter relevant medical history"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...registerRegular('notes')}
                  rows={2}
                  placeholder="Additional notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || isLoading ? 'Adding Patient...' : 'Add Patient'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
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