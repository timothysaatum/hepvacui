import React, { useState, useEffect } from 'react';
import { X, Baby } from 'lucide-react';
import { useUpdateChild } from '../../hooks/useChildren';
import type { Child, UpdateChildPayload } from '../../types/child';

interface EditChildPanelProps {
  child: Child | null;
  /**
   * The pregnancy episode the child belongs to.
   * Required for scoped cache invalidation after update.
   */
  pregnancyId: string;
  /**
   * The mother's patient ID.
   * Required for cross-pregnancy "all children" cache invalidation.
   */
  patientId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  sex: 'male' | 'female' | '';
  six_month_checkup_date: string;
  six_month_checkup_completed: boolean;
  hep_b_antibody_test_result: '' | 'positive' | 'negative' | 'indeterminate' | 'pending';
  test_date: string;
  notes: string;
}

const buildInitialForm = (child: Child): FormState => ({
  name: child.name ?? '',
  sex: child.sex ?? '',
  six_month_checkup_date: child.six_month_checkup_date ?? '',
  six_month_checkup_completed: child.six_month_checkup_completed ?? false,
  hep_b_antibody_test_result: child.hep_b_antibody_test_result ?? '',
  test_date: child.test_date ?? '',
  notes: child.notes ?? '',
});

export const EditChildPanel: React.FC<EditChildPanelProps> = ({
  child,
  pregnancyId,
  patientId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    sex: '',
    six_month_checkup_date: '',
    six_month_checkup_completed: false,
    hep_b_antibody_test_result: '',
    test_date: '',
    notes: '',
  });

  const updateChildMutation = useUpdateChild();

  useEffect(() => {
    if (child) {
      setFormData(buildInitialForm(child));
    }
  }, [child]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!child) return;

    // Only include fields that have values — never send empty strings for optional fields
    const payload: UpdateChildPayload = {
      six_month_checkup_completed: formData.six_month_checkup_completed,
    };

    if (formData.name.trim())
      payload.name = formData.name.trim();
    if (formData.sex)
      payload.sex = formData.sex;
    if (formData.six_month_checkup_date)
      payload.six_month_checkup_date = formData.six_month_checkup_date;
    if (formData.hep_b_antibody_test_result)
      payload.hep_b_antibody_test_result = formData.hep_b_antibody_test_result;
    if (formData.test_date)
      payload.test_date = formData.test_date;
    if (formData.notes.trim())
      payload.notes = formData.notes.trim();

    updateChildMutation.mutate(
      { childId: child.id, pregnancyId, patientId, data: payload },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!child) return null;

  const isSubmitting = updateChildMutation.isPending;

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
        aria-labelledby="edit-child-title"
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
                  <h2 id="edit-child-title" className="text-xl font-bold text-black">
                    Edit Child
                  </h2>
                  <p className="text-sm text-gray-600">
                    {child.name || 'Update child information'}
                  </p>
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
            id="edit-child-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6"
          >
            <div className="space-y-6">
              {/* Basic Information */}
              <section className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-black mb-4">Basic Information</h3>

                <div className="mb-4">
                  <label htmlFor="edit-child-name" className="block text-sm font-semibold text-black mb-2">
                    Child's Name
                  </label>
                  <input
                    id="edit-child-name"
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
                  <label htmlFor="edit-child-sex" className="block text-sm font-semibold text-black mb-2">
                    Sex
                  </label>
                  <select
                    id="edit-child-sex"
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
              </section>

              {/* 6-Month Checkup */}
              <section className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-black mb-4">6-Month Checkup</h3>

                <div className="mb-4">
                  <label htmlFor="edit-checkup-date" className="block text-sm font-semibold text-black mb-2">
                    Checkup Date
                  </label>
                  <input
                    id="edit-checkup-date"
                    type="date"
                    name="six_month_checkup_date"
                    value={formData.six_month_checkup_date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="six_month_checkup_completed"
                    id="six_month_checkup_completed"
                    checked={formData.six_month_checkup_completed}
                    onChange={handleChange}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-2 focus:ring-black"
                  />
                  <label
                    htmlFor="six_month_checkup_completed"
                    className="text-sm font-medium text-black cursor-pointer"
                  >
                    Checkup Completed
                  </label>
                </div>
              </section>

              {/* Hepatitis B Test */}
              <section className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-black mb-4">
                  Hepatitis B Antibody Test
                </h3>

                <div className="mb-4">
                  <label htmlFor="edit-hepb-result" className="block text-sm font-semibold text-black mb-2">
                    Test Result
                  </label>
                  <select
                    id="edit-hepb-result"
                    name="hep_b_antibody_test_result"
                    value={formData.hep_b_antibody_test_result}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select result</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="indeterminate">Indeterminate</option>
                    <option value="pending">Pending</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose the official antibody result category used for follow-up reporting.
                  </p>
                </div>

                <div>
                  <label htmlFor="edit-test-date" className="block text-sm font-semibold text-black mb-2">
                    Test Date
                  </label>
                  <input
                    id="edit-test-date"
                    type="date"
                    name="test_date"
                    value={formData.test_date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              </section>

              {/* Notes */}
              <div>
                <label htmlFor="edit-child-notes" className="block text-sm font-semibold text-black mb-2">
                  Notes
                </label>
                <textarea
                  id="edit-child-notes"
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
            {updateChildMutation.isError && (
              <p className="mb-3 text-sm text-red-600">
                Failed to update child record. Please try again.
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
                form="edit-child-form"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Updating...
                  </>
                ) : (
                  'Update Child'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
