import React, { useState, useEffect } from 'react';
import { X, Baby, UserRound, Calendar, ClipboardList } from 'lucide-react';
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
      <div className="fixed inset-0 bg-slate-950/45 z-40 transition-opacity" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-child-title"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl"
      >
        <div className="h-full flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-600">
                  <Baby className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="edit-child-title" className="text-lg font-semibold text-slate-950">
                    Edit Child
                  </h2>
                  <p className="text-sm text-slate-500">{child.name || 'Update birth record and follow-up information.'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
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
            <div className="space-y-5">
              <section className="border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Birth Details</h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Update child information and birth details.</p>
                </div>

                <div className="space-y-5 p-4">
                  <div>
                    <label htmlFor="edit-child-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Child's Name <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      id="edit-child-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter child's full name if available"
                      maxLength={200}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-child-sex" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Sex <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <select
                      id="edit-child-sex"
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-semibold text-slate-900">6-Month Follow-Up</h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Track checkup status and test results.</p>
                </div>

                <div className="space-y-5 p-4">
                  <div>
                    <label htmlFor="edit-checkup-date" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Checkup Date <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      id="edit-checkup-date"
                      type="date"
                      name="six_month_checkup_date"
                      value={formData.six_month_checkup_date}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      name="six_month_checkup_completed"
                      id="six_month_checkup_completed"
                      checked={formData.six_month_checkup_completed}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label
                      htmlFor="six_month_checkup_completed"
                      className="text-sm font-medium text-slate-900 cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>

                  <div>
                    <label htmlFor="edit-hepb-result" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Hepatitis B Antibody Test Result <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <select
                      id="edit-hepb-result"
                      name="hep_b_antibody_test_result"
                      value={formData.hep_b_antibody_test_result}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select result</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="indeterminate">Indeterminate</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-test-date" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Test Date <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      id="edit-test-date"
                      type="date"
                      name="test_date"
                      value={formData.test_date}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </section>

              <section className="border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Clinical Notes</h3>
                </div>
                <label htmlFor="edit-child-notes" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Notes <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  id="edit-child-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Birth details, neonatal concerns, counselling notes, or follow-up context"
                  maxLength={2000}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </section>
            </div>
          </form>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
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
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-child-form"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
