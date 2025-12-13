import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateUser, useCreateStaff } from '../../hooks/useUsers';
import { createUserSchema, type CreateUserFormData } from '../../utils/validationSchemas';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Plus, Info, Sparkles, Copy, Check } from 'lucide-react';
import { generateMemorablePassword } from '../../utils/passwordGenerator';

interface CreateUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isStaff?: boolean;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSuccess,
  onCancel,
  isStaff = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'password' | 'confirm' | null>(null);

  const createUserMutation = useCreateUser();
  const createStaffMutation = useCreateStaff();

  const mutation = isStaff ? createStaffMutation : createUserMutation;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      full_name: '',
      phone: '',
      email: '',
      password: '',
      password_confirm: '',
    },
  });

  const passwordValue = watch('password');

  const handleGeneratePassword = () => {
    const newPassword = generateMemorablePassword();
    setValue('password', newPassword, { shouldValidate: true });
    setValue('password_confirm', newPassword, { shouldValidate: true });
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleCopyPassword = async (field: 'password' | 'confirm') => {
    const password = passwordValue;
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (err) {
        console.error('Failed to copy password:', err);
      }
    }
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await mutation.mutateAsync(data);
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
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('username')}
                  placeholder="johndoe"
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
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="John Doe"
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
                  placeholder="user@example.com"
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-20 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                  {passwordValue && (
                    <button
                      type="button"
                      onClick={() => handleCopyPassword('password')}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Copy password"
                    >
                      {copiedField === 'password' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.password.message}
                </p>
              )}
              {!errors.password && (
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  8+ chars with uppercase, lowercase, digit & special character
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('password_confirm')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-20 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.password_confirm
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                  {passwordValue && (
                    <button
                      type="button"
                      onClick={() => handleCopyPassword('confirm')}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Copy password"
                    >
                      {copiedField === 'confirm' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errors.password_confirm && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.password_confirm.message}
                </p>
              )}
            </div>
          </div>

          {/* Generated Password Preview */}
          {passwordValue && showPassword && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">
                    Generated Password
                  </h4>
                  <p className="text-sm text-purple-700 font-mono bg-white px-3 py-2 rounded border border-purple-200">
                    {passwordValue}
                  </p>
                  <p className="text-xs text-purple-600 mt-2">
                    💡 Make sure to save this password securely before creating the user
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSubmitting || mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create {isStaff ? 'Staff' : 'User'}
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || mutation.isPending}
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