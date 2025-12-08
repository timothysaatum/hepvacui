import React, { useState } from 'react';
import { X, Baby } from 'lucide-react';
import { useCreateChild } from '../../hooks/useChildren';
import type { CreateChildPayload } from '../../types/child';

interface AddChildPanelProps {
  motherId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddChildPanel: React.FC<AddChildPanelProps> = ({ motherId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    sex: '' as 'male' | 'female' | '',
    notes: '',
  });

  const createChildMutation = useCreateChild();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motherId) return;

    const payload: CreateChildPayload = {
      date_of_birth: formData.date_of_birth,
    };

    if (formData.name.trim()) payload.name = formData.name.trim();
    if (formData.sex) payload.sex = formData.sex;
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    createChildMutation.mutate(
      { motherId, data: payload },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!motherId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl z-50 transform transition-transform">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Add Child</h2>
                  <p className="text-sm text-gray-600">Register a new child</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Child's Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter child's name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Sex <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-black rounded-xl font-medium hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.date_of_birth || createChildMutation.isPending}
                className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createChildMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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