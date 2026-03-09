/**
 * Vaccine purchase, payment, and vaccination types.
 *
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 */
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue';

export type DoseNumber = '1st dose' | '2nd dose' | '3rd dose';

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

export interface VaccinePurchase {
  id: string;
  patient_id: string;
  vaccine_id: string;
  vaccine_name: string;
  /** Stored as Decimal server-side — arrives as a number in JSON response. */
  price_per_dose: number;
  batch_number: string;
  total_doses: number;
  total_package_price: number;
  amount_paid: number;
  balance: number;
  payment_status: PaymentStatus;
  doses_administered: number;
  purchase_date: string;
  is_active: boolean;
  notes?: string | null;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  vaccine_purchase_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  received_by_id: string | null;
  created_at: string;
}

export interface Vaccination {
  id: string;
  patient_id: string;
  vaccine_purchase_id: string;
  dose_number: DoseNumber;
  dose_date: string;
  batch_number: string;
  vaccine_name: string;
  vaccine_price: number;
  administered_by_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface EligibilityCheck {
  eligible: boolean;
  message: string;
  next_dose_number: number | null;
  doses_administered: number;
  doses_paid_for: number;
  total_doses: number;
}

/**
 * representations to preserve precision.
 *
 * Use `parseDecimal(progress.total_price)` at display time only.
 * Never coerce to number early.
 */
export interface PaymentProgress {
  /** Decimal string e.g. "150.00" */
  total_price: string;
  /** Decimal string e.g. "75.00" */
  amount_paid: string;
  /** Decimal string e.g. "75.00" */
  balance: string;
  payment_status: PaymentStatus;
  total_doses: number;
  doses_paid_for: number;
  doses_administered: number;
  eligible_doses: number;
  is_completed: boolean;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

/**
 * - patient_id is injected from the URL path server-side.
 * - created_by_id is derived from the authenticated user server-side.
 * Sending these from the client is unnecessary and should not be trusted.
 *
 * Sent to POST /api/v1/purchase-vaccine/{patient_id}.
 */
export interface CreateVaccinePurchasePayload {
  vaccine_id: string;
  total_doses: number;
}

export interface UpdateVaccinePurchasePayload {
  notes?: string;
  is_active?: boolean;
}

/**
 * Payment creation payload.
 * `vaccine_purchase_id` and `received_by_id` are set server-side.
 * Sent to POST /api/v1/vaccine-payment/{purchase_id}.
 */
export interface CreatePaymentPayload {
  amount: number;
  payment_date: string;           // ISO date "YYYY-MM-DD"
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

/**
 * Vaccination administration payload.
 * `patient_id` and `administered_by_id` are set server-side.
 * Sent to POST /api/v1/administer/{purchase_id}.
 */
export interface CreateVaccinationPayload {
  dose_date: string;              // ISO date "YYYY-MM-DD"
  notes?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely parses a Decimal string returned by the API into a JavaScript number.
 * Use ONLY at display time (formatting, rendering). Never use for arithmetic
 * that feeds back into the API.
 *
 * @example
 * const display = parseDecimal(progress.total_price).toFixed(2); // "150.00"
 */
export function parseDecimal(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    console.warn(`parseDecimal: could not parse "${value}" as a number`);
    return 0;
  }
  return parsed;
}

/**
 * Formats a Decimal string as a localised currency string.
 *
 * @example
 * formatCurrency(progress.balance, 'GHS') // "GHS 75.00"
 */
export function formatCurrency(
  value: string | number,
  currency: string = 'GHS',
  locale: string = 'en-GH'
): string {
  const num = parseDecimal(value);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}