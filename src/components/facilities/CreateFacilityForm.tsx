import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFacility } from '../../hooks/useFacilities';
import { createFacilitySchema, type CreateFacilityFormData } from '../../utils/validationSchemas';
import { Building2, Phone, Mail, MapPin, Loader2, Plus } from 'lucide-react';

interface CreateFacilityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateFacilityForm: React.FC<CreateFacilityFormProps> = ({ onSuccess, onCancel }) => {
  const createMutation = useCreateFacility();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateFacilityFormData>({
    resolver: zodResolver(createFacilitySchema),
    defaultValues: {
      facility_name: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const onSubmit = async (data: CreateFacilityFormData) => {
    try {
      await createMutation.mutateAsync(data);
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facility Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Facility Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('facility_name')}
                  placeholder="e.g., City General Hospital"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.facility_name
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.facility_name && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.facility_name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.phone
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="facility@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <textarea
                  {...register('address')}
                  rows={3}
                  placeholder="123 Main St, City, State, ZIP"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${errors.address
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.address && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Facility
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || createMutation.isPending}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};