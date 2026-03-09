import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePregnantPatient, useCreateRegularPatient } from '../../hooks/usePatients';
import { useAuth } from '../../context/useAuth';
import {
  createPregnantPatientSchema,
  createRegularPatientSchema,
  type CreatePregnantPatientFormData,
  type CreateRegularPatientFormData,
} from '../../utils/patientValidationSchemas';

/**
 * NOTE: patientValidationSchemas must be updated to reflect these changes:
 *
 *  createPregnantPatientSchema:
 *    - remove `age` (computed server-side from date_of_birth)
 *    - add `date_of_birth` (optional date string)
 *    - add `first_pregnancy` object (optional):
 *        lmp_date, expected_delivery_date, gestational_age_weeks, risk_factors, notes
 *
 *  createRegularPatientSchema:
 *    - remove `age` (computed server-side from date_of_birth)
 *    - add `date_of_birth` (optional date string)
 */

interface CreatePatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Strips empty strings and null values from form data before submission.
 * The backend rejects empty string dates — they must be absent or valid ISO strings.
 */
const sanitisePayload = <T extends Record<string, unknown>>(data: T): T => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === null || value === undefined) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') result[key] = trimmed;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively sanitise nested objects (e.g. first_pregnancy)
      const nested = sanitisePayload(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) result[key] = nested;
    } else {
      result[key] = value;
    }
  }
  return result as T;
};

const INPUT_CLASSES = (hasError: boolean) =>
  `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${hasError
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
  }`;

export const CreatePatientForm: React.FC<CreatePatientFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [patientType, setPatientType] = useState<'pregnant' | 'regular'>('regular');

  const createPregnantMutation = useCreatePregnantPatient();
  const createRegularMutation = useCreateRegularPatient();

  // ── Pregnant patient form ──────────────────────────────────────────────────
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
      date_of_birth: '',
      first_pregnancy: {
        lmp_date: '',
        expected_delivery_date: '',
        gestational_age_weeks: undefined,
        risk_factors: '',
      },
    },
  });

  // ── Regular patient form ───────────────────────────────────────────────────
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
      date_of_birth: '',
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
    if (!user?.id || !user?.facility?.id) return;
    try {
      await createPregnantMutation.mutateAsync({
        ...sanitisePayload(data),
        facility_id: user.facility.id,
        created_by_id: user.id,
      });
      resetPregnant();
      onSuccess?.();
    } catch (error) {
      console.error('Create pregnant patient error:', error);
    }
  };

  const onSubmitRegular = async (data: CreateRegularPatientFormData) => {
    if (!user?.id || !user?.facility?.id) return;
    try {
      await createRegularMutation.mutateAsync({
        ...sanitisePayload(data),
        facility_id: user.facility.id,
        created_by_id: user.id,
      });
      resetRegular();
      onSuccess?.();
    } catch (error) {
      console.error('Create regular patient error:', error);
    }
  };

  const isBusy =
    createPregnantMutation.isPending ||
    createRegularMutation.isPending ||
    isSubmittingPregnant ||
    isSubmittingRegular;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Patient</h2>

      {/* Patient type selector */}
      <div className="mb-6">
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Patient Type <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPatientType('regular')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${patientType === 'regular'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
          >
            <div className="text-2xl mb-1" aria-hidden="true">👤</div>
            <div className="font-medium">Regular Patient</div>
          </button>
          <button
            type="button"
            onClick={() => setPatientType('pregnant')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${patientType === 'pregnant'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
          >
            <div className="text-2xl mb-1" aria-hidden="true">🤰</div>
            <div className="font-medium">Pregnant Patient</div>
          </button>
        </div>
      </div>

      {/* ── Pregnant Patient Form ───────────────────────────────────────────── */}
      {patientType === 'pregnant' && (
        <form onSubmit={handleSubmitPregnant(onSubmitPregnant)} className="space-y-6">
          {/* ── Personal details ──────────────────────────────────────────── */}
          <fieldset>
            <legend className="text-base font-semibold text-gray-900 mb-3">
              Personal Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="p-name"
                  type="text"
                  {...registerPregnant('name')}
                  placeholder="e.g., Mariam Asante"
                  maxLength={200}
                  className={INPUT_CLASSES(!!errorsPregnant.name)}
                />
                {errorsPregnant.name && (
                  <p className="mt-1 text-sm text-red-600">{errorsPregnant.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="p-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="p-phone"
                  type="tel"
                  {...registerPregnant('phone')}
                  placeholder="e.g., 0594438287"
                  maxLength={20}
                  className={INPUT_CLASSES(!!errorsPregnant.phone)}
                />
                {errorsPregnant.phone && (
                  <p className="mt-1 text-sm text-red-600">{errorsPregnant.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="p-dob" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth{' '}
                  <span className="text-gray-400 font-normal">(Optional — used to calculate age)</span>
                </label>
                <input
                  id="p-dob"
                  type="date"
                  {...registerPregnant('date_of_birth')}
                  max={new Date().toISOString().split('T')[0]}
                  className={INPUT_CLASSES(!!errorsPregnant.date_of_birth)}
                />
                {errorsPregnant.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errorsPregnant.date_of_birth.message}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* ── Pregnancy details ─────────────────────────────────────────── */}
          <fieldset className="border-t border-gray-200 pt-4">
            <legend className="text-base font-semibold text-gray-900 mb-3">
              Pregnancy Details{' '}
              <span className="text-sm font-normal text-gray-500">(all optional)</span>
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p-lmp" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Menstrual Period (LMP)
                </label>
                <input
                  id="p-lmp"
                  type="date"
                  {...registerPregnant('first_pregnancy.lmp_date')}
                  max={new Date().toISOString().split('T')[0]}
                  className={INPUT_CLASSES(!!errorsPregnant.first_pregnancy?.lmp_date)}
                />
              </div>

              <div>
                <label htmlFor="p-edd" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date (EDD)
                </label>
                <input
                  id="p-edd"
                  type="date"
                  {...registerPregnant('first_pregnancy.expected_delivery_date')}
                  className={INPUT_CLASSES(!!errorsPregnant.first_pregnancy?.expected_delivery_date)}
                />
              </div>

              <div>
                <label htmlFor="p-ga" className="block text-sm font-medium text-gray-700 mb-1">
                  Gestational Age (weeks)
                </label>
                <input
                  id="p-ga"
                  type="number"
                  min={1}
                  max={42}
                  {...registerPregnant('first_pregnancy.gestational_age_weeks', { valueAsNumber: true })}
                  placeholder="e.g., 12"
                  className={INPUT_CLASSES(!!errorsPregnant.first_pregnancy?.gestational_age_weeks)}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="p-risk" className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Factors
                </label>
                <textarea
                  id="p-risk"
                  {...registerPregnant('first_pregnancy.risk_factors')}
                  rows={2}
                  placeholder="e.g., gestational diabetes, hypertension..."
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </fieldset>

          <ActionButtons isBusy={isBusy} onCancel={onCancel} label="Add Patient" />
        </form>
      )}

      {/* ── Regular Patient Form ────────────────────────────────────────────── */}
      {patientType === 'regular' && (
        <form onSubmit={handleSubmitRegular(onSubmitRegular)} className="space-y-6">
          {/* ── Personal details ──────────────────────────────────────────── */}
          <fieldset>
            <legend className="text-base font-semibold text-gray-900 mb-3">
              Personal Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="r-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="r-name"
                  type="text"
                  {...registerRegular('name')}
                  placeholder="e.g., John Mensah"
                  maxLength={200}
                  className={INPUT_CLASSES(!!errorsRegular.name)}
                />
                {errorsRegular.name && (
                  <p className="mt-1 text-sm text-red-600">{errorsRegular.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="r-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="r-phone"
                  type="tel"
                  {...registerRegular('phone')}
                  placeholder="e.g., 0201234567"
                  maxLength={20}
                  className={INPUT_CLASSES(!!errorsRegular.phone)}
                />
                {errorsRegular.phone && (
                  <p className="mt-1 text-sm text-red-600">{errorsRegular.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="r-sex" className="block text-sm font-medium text-gray-700 mb-1">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  id="r-sex"
                  {...registerRegular('sex')}
                  className={INPUT_CLASSES(!!errorsRegular.sex) + ' bg-white'}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errorsRegular.sex && (
                  <p className="mt-1 text-sm text-red-600">{errorsRegular.sex.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="r-dob" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth{' '}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="r-dob"
                  type="date"
                  {...registerRegular('date_of_birth')}
                  max={new Date().toISOString().split('T')[0]}
                  className={INPUT_CLASSES(!!errorsRegular.date_of_birth)}
                />
              </div>
            </div>
          </fieldset>

          {/* ── Medical information ───────────────────────────────────────── */}
          <fieldset className="border-t border-gray-200 pt-4">
            <legend className="text-base font-semibold text-gray-900 mb-3">
              Medical Information{' '}
              <span className="text-sm font-normal text-gray-500">(all optional)</span>
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="r-diag" className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis Date
                </label>
                <input
                  id="r-diag"
                  type="date"
                  {...registerRegular('diagnosis_date')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="r-ts" className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Start Date
                </label>
                <input
                  id="r-ts"
                  type="date"
                  {...registerRegular('treatment_start_date')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="r-vl" className="block text-sm font-medium text-gray-700 mb-1">
                  Viral Load
                </label>
                <input
                  id="r-vl"
                  type="text"
                  {...registerRegular('viral_load')}
                  placeholder="e.g., Undetectable"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="r-lvld" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Viral Load Date
                </label>
                <input
                  id="r-lvld"
                  type="date"
                  {...registerRegular('last_viral_load_date')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="r-regimen" className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Regimen
                </label>
                <input
                  id="r-regimen"
                  type="text"
                  {...registerRegular('treatment_regimen')}
                  placeholder="e.g., TDF/3TC/DTG"
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="r-allergies" className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <textarea
                  id="r-allergies"
                  {...registerRegular('allergies')}
                  rows={2}
                  placeholder="List any known allergies"
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="r-history" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  id="r-history"
                  {...registerRegular('medical_history')}
                  rows={3}
                  placeholder="Enter relevant medical history"
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="r-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="r-notes"
                  {...registerRegular('notes')}
                  rows={2}
                  placeholder="Additional notes"
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </fieldset>

          <ActionButtons isBusy={isBusy} onCancel={onCancel} label="Add Patient" />
        </form>
      )}
    </div>
  );
};

// ── Small shared sub-component ─────────────────────────────────────────────────

const ActionButtons: React.FC<{
  isBusy: boolean;
  onCancel?: () => void;
  label: string;
}> = ({ isBusy, onCancel, label }) => (
  <div className="flex gap-3 pt-4 border-t border-gray-100">
    <button
      type="submit"
      disabled={isBusy}
      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {isBusy ? 'Saving...' : label}
    </button>
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        disabled={isBusy}
        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-medium disabled:opacity-50"
      >
        Cancel
      </button>
    )}
  </div>
);