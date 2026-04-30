// =============================================================================
// Date Formatting
// =============================================================================

/**
 * Format a date string for display.
 *
 * Changes from original:
 * - First arg now accepts `string | null | undefined` — returns '—' for empty
 *   values so components don't need to guard before calling.
 * - The `format` parameter is kept exactly as before (default: 'short').
 */
export const formatDate = (
  dateString: string | null | undefined,
  format: 'short' | 'long' = 'short'
): string => {
  if (!dateString) return '—';

  const date = new Date(dateString);

  if (format === 'short') {
    return date.toLocaleDateString();
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// =============================================================================
// Currency Formatting
// =============================================================================

/**
 * Format a monetary value as GHS currency.
 *
 * Changes from original:
 * - Amount now accepts `string | number | null | undefined` so decimal fields
 *   from the API (stored as strings by some ORMs) render correctly.
 * - Existing numeric calls (`formatCurrency(someNumber)`) are unaffected.
 * - Returns '—' for null/undefined/NaN instead of throwing.
 */
export const formatCurrency = (
  amount: string | number | null | undefined,
  currency: string = 'GHS'
): string => {
  if (amount === null || amount === undefined) return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';

  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// =============================================================================
// Number Formatting  (unchanged)
// =============================================================================

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-GH').format(num);
};

// =============================================================================
// Role / User helpers  (unchanged)
// =============================================================================

export const getRoleBadgeColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800',
    staff: 'bg-blue-100 text-blue-800',
    doctor: 'bg-green-100 text-green-800',
    nurse: 'bg-teal-100 text-teal-800',
  };
  return colors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export const getUserStatusBadge = (isActive: boolean, isSuspended: boolean) => {
  if (isSuspended) return { text: 'Suspended', className: 'bg-red-100 text-red-800' };
  if (isActive) return { text: 'Active', className: 'bg-green-100 text-green-800' };
  return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
};

// =============================================================================
// Vaccine / Stock helpers  (unchanged)
// =============================================================================

export const getStockStatusBadge = (quantity: number, isLowStock: boolean) => {
  if (quantity === 0) return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
  if (isLowStock) return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
  return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
};

export const getPublishedStatusBadge = (isPublished: boolean) => {
  if (isPublished) return { text: 'Published', className: 'bg-blue-100 text-blue-800' };
  return { text: 'Draft', className: 'bg-gray-100 text-gray-800' };
};

// =============================================================================
// Name helpers  (unchanged)
// =============================================================================

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// =============================================================================
// Patient status labels & colors  (new — used by Badge.tsx)
// =============================================================================

export const PATIENT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  postpartum: 'Postpartum',
  completed: 'Completed',
  converted: 'Converted',
};

export const PATIENT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-slate-100 text-slate-600',
  postpartum: 'bg-purple-100 text-purple-800',
  completed: 'bg-blue-100 text-blue-800',
  converted: 'bg-slate-100 text-slate-800',
};

export const PATIENT_TYPE_LABELS: Record<string, string> = {
  pregnant: 'Pregnant',
  regular: 'Regular',
};

export const PATIENT_TYPE_COLORS: Record<string, string> = {
  pregnant: 'bg-purple-100 text-purple-800',
  regular: 'bg-blue-100 text-blue-800',
};

// =============================================================================
// Pregnancy outcome labels & colors  (new — used by PregnancySection)
// =============================================================================

export const PREGNANCY_OUTCOME_LABELS: Record<string, string> = {
  live_birth: 'Live Birth',
  stillbirth: 'Stillbirth',
  miscarriage: 'Miscarriage',
  abortion: 'Abortion',
  ectopic: 'Ectopic Pregnancy',
};

export const PREGNANCY_OUTCOME_COLORS: Record<string, string> = {
  live_birth: 'bg-emerald-100 text-emerald-800',
  stillbirth: 'bg-slate-100 text-slate-600',
  miscarriage: 'bg-orange-100 text-orange-800',
  abortion: 'bg-slate-100 text-slate-600',
  ectopic: 'bg-red-100 text-red-800',
};

// =============================================================================
// Payment status labels & colors  (new — used by Badge.tsx)
// =============================================================================

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  partial: 'Partial',
  completed: 'Paid',
  overdue: 'Overdue',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  partial: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
};

// =============================================================================
// Reminder labels & colors  (new — used by Badge.tsx and ReminderSection)
// =============================================================================

export const REMINDER_TYPE_LABELS: Record<string, string> = {
  delivery_week: 'Delivery Week',
  child_6month_checkup: '6-Month Checkup',
  medication_due: 'Medication Due',
  payment_due: 'Payment Due',
  vaccination_due: 'Vaccination Due',
};

export const REMINDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  sent: 'Sent',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const REMINDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  sent: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-100 text-slate-600',
};

// =============================================================================
// Misc patient helpers  (new — used by PatientCard, PatientHeader)
// =============================================================================

/** Returns a "G2 P1" style gravida/para label when counts are available. */
export const getGravidaParaLabel = (gravida?: number | null, para?: number | null): string => {
  const hasGravida = typeof gravida === 'number' && Number.isFinite(gravida);
  const hasPara = typeof para === 'number' && Number.isFinite(para);
  return hasGravida || hasPara ? `G${hasGravida ? gravida : '-'} P${hasPara ? para : '-'}` : 'Pregnancy care';
};

/** Returns "Dose 1 / 2 / 3" label from API dose_number strings. */
export const getDoseLabel = (dose: string): string => {
  const map: Record<string, string> = {
    '1st dose': 'Dose 1',
    '2nd dose': 'Dose 2',
    '3rd dose': 'Dose 3',
  };
  return map[dose] ?? dose;
};

/** Returns payment completion percentage clamped to 0–100. */
export const getPaymentProgressPercent = (amountPaid: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((amountPaid / total) * 100));
};
