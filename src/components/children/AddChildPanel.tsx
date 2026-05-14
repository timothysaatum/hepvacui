import React, { useState } from 'react';
import { X, Baby, Calendar, ClipboardList, UserRound } from 'lucide-react';
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
      <div className="fixed inset-0 bg-slate-950/45 z-40 transition-opacity" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-child-title"
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
                  <h2 id="add-child-title" className="text-lg font-semibold text-slate-950">
                    Add Child
                  </h2>
                  <p className="text-sm text-slate-500">Create a birth record and six-month follow-up schedule.</p>
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
            id="add-child-form"
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
                  <p className="mt-1 text-xs text-slate-500">Record the child information linked to the completed live-birth pregnancy.</p>
                </div>

                <div className="space-y-5 p-4">
                  <div>
                    <label htmlFor="child-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Child's Name <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      id="child-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter child's full name if available"
                      maxLength={200}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="child-dob" className="mb-1.5 block text-sm font-semibold text-slate-800">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="child-dob"
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleChange}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pl-9 text-sm text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Future dates are not allowed.</p>
                    </div>

                    <div>
                      <label htmlFor="child-sex" className="mb-1.5 block text-sm font-semibold text-slate-800">
                        Sex <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <select
                        id="child-sex"
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
                </div>
              </section>

              <section className="border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Clinical Notes</h3>
                </div>
                <label htmlFor="child-notes" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Notes <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  id="child-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Birth details, neonatal concerns, counselling notes, or follow-up context"
                  maxLength={2000}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="mt-1 text-xs text-slate-500">Six-month checkup reminders are generated after saving.</p>
              </section>
            </div>
          </form>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
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
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-child-form"
                disabled={!canSubmit}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
