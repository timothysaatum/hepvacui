import React, { useState, useEffect } from 'react';
import { X, Baby } from 'lucide-react';
import { useUpdateChild } from '../../hooks/useChildren';
import type { Child, UpdateChildPayload } from '../../types/child';

interface EditChildPanelProps {
  child: Child | null;
  motherId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditChildPanel: React.FC<EditChildPanelProps> = ({ child, motherId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    sex: '' as 'male' | 'female' | '',
    six_month_checkup_date: '',
    six_month_checkup_completed: false,
    hep_b_antibody_test_result: '',
    test_date: '',
    notes: '',
  });

  const updateChildMutation = useUpdateChild();

  useEffect(() => {
    if (child) {
      setFormData({
        name: child.name || '',
        sex: child.sex || '',
        six_month_checkup_date: child.six_month_checkup_date || '',
        six_month_checkup_completed: child.six_month_checkup_completed,
        hep_b_antibody_test_result: child.hep_b_antibody_test_result || '',
        test_date: child.test_date || '',
        notes: child.notes || '',
      });
    }
  }, [child]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!child) return;

    const payload: UpdateChildPayload = {};

    if (formData.name.trim()) payload.name = formData.name.trim();
    if (formData.sex) payload.sex = formData.sex;
    if (formData.six_month_checkup_date) payload.six_month_checkup_date = formData.six_month_checkup_date;
    payload.six_month_checkup_completed = formData.six_month_checkup_completed;
    if (formData.hep_b_antibody_test_result.trim()) 
      payload.hep_b_antibody_test_result = formData.hep_b_antibody_test_result.trim();
    if (formData.test_date) payload.test_date = formData.test_date;
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    updateChildMutation.mutate(
      { childId: child.id, motherId, data: payload },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!child) return null;

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
                  <h2 className="text-xl font-bold text-black">Edit Child</h2>
                  <p className="text-sm text-gray-600">
                    {child.name || 'Update child information'}
                  </p>
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
              {/* Basic Information */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-black mb-4">Basic Information</h3>
                
                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Child's Name
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

                {/* Sex */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Sex
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
              </div>

              {/* 6-Month Checkup */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-black mb-4">6-Month Checkup</h3>
                
                {/* Checkup Date */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Checkup Date
                  </label>
                  <input
                    type="date"
                    name="six_month_checkup_date"
                    value={formData.six_month_checkup_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>

                {/* Checkup Completed */}
                <div className="flex items-center">
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
                    className="ml-3 text-sm font-medium text-black"
                  >
                    Checkup Completed
                  </label>
                </div>
              </div>

              {/* Hepatitis B Test */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-black mb-4">Hepatitis B Antibody Test</h3>
                
                {/* Test Result */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Test Result
                  </label>
                  <input
                    type="text"
                    name="hep_b_antibody_test_result"
                    value={formData.hep_b_antibody_test_result}
                    onChange={handleChange}
                    placeholder="Enter test result"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>

                {/* Test Date */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Test Date
                  </label>
                  <input
                    type="date"
                    name="test_date"
                    value={formData.test_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Notes
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
                disabled={updateChildMutation.isPending}
                className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateChildMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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