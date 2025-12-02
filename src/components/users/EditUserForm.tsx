import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser, useUpdateUser } from '../../hooks/useUsers';
import { updateUserSchema, type UpdateUserFormData } from '../../utils/validationSchemas';
import { User, Mail, Phone, Loader2, Save, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';

interface EditUserFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({
  userId,
  onSuccess,
  onCancel
}) => {
  const { data: user, isPending: fetchLoading, error: fetchError } = useUser(userId);
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        is_active: user.is_active,
        is_suspended: user.is_suspended,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      await updateMutation.mutateAsync({ userId, data });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Failed to load user data</h3>
              <p className="text-sm text-red-700 mt-0.5">Please try again later</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('username')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.username
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('full_name')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.full_name
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  {...register('phone')}
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
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
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
          </div>

          {/* Status Section */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">User Status</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-start cursor-pointer group">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                  />
                </div>
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">User can access the system</p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer group">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    {...register('is_suspended')}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                  />
                </div>
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Suspended</span>
                    <Ban className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Temporarily block access</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSubmitting || updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update User
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || updateMutation.isPending}
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