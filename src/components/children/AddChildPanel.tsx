import React, { useState } from 'react';
import { X, Baby } from 'lucide-react';
import { useCreateChild } from '../../hooks/useChildren';
import type { CreateChildPayload } from '../../types/child';

interface AddChildPanelProps {
  /**
   * The pregnancy episode this child belongs to.
   * Use `patient.active_pregnancy.id` from the PregnantPatient response.
   * Children are linked to a specific pregnancy episode, NOT directly to the mother.
   */
  pregnancyId: string | null;
  /**
   * The mother's patient ID.
   * Required for cross-pregnancy cache invalidation so the lifetime
   * "all children for this mother" view refreshes after creation.
   */
  patientId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  date_of_birth: string;
  sex: 'male' | 'female' | '';
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  date_of_birth: '',
  sex: '',
  notes: '',
};

export const AddChildPanel: React.FC<AddChildPanelProps> = ({
  pregnancyId,
  patientId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const createChildMutation = useCreateChild();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregnancyId || !patientId || !formData.date_of_birth) return;

    const payload: CreateChildPayload = {
      date_of_birth: formData.date_of_birth,
    };
    if (formData.name.trim()) payload.name = formData.name.trim();
    if (formData.sex) payload.sex = formData.sex;
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    createChildMutation.mutate(
      { pregnancyId, patientId, data: payload },
      {
        onSuccess: () => {
          setFormData(INITIAL_FORM);
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!pregnancyId || !patientId) return null;

  const isSubmitting = createChildMutation.isPending;
  const canSubmit = !!formData.date_of_birth && !isSubmitting;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-child-title"
        className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl z-50"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="add-child-title" className="text-xl font-bold text-black">
                    Add Child
                  </h2>
                  <p className="text-sm text-gray-600">Register a new child record</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            id="add-child-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6"
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="child-name" className="block text-sm font-semibold text-black mb-2">
                  Child's Name{' '}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="child-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter child's name"
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="child-dob" className="block text-sm font-semibold text-black mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  id="child-dob"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="child-sex" className="block text-sm font-semibold text-black mb-2">
                  Sex <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  id="child-sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="child-notes" className="block text-sm font-semibold text-black mb-2">
                  Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="child-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any additional notes..."
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            {createChildMutation.isError && (
              <p className="mb-3 text-sm text-red-600">
                Failed to add child record. Please try again.
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 text-black rounded-xl font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-child-form"
                disabled={!canSubmit}
                className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Adding...
                  </>
                ) : (
                  'Add Child'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};