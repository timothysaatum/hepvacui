export type PaymentStatus = 'pending' | 'partial' | 'completed';
export type DoseNumber = '1st dose' | '2nd dose' | '3rd dose';

export interface VaccinePurchase {
  id: string;
  patient_id: string;
  vaccine_id: string;
  vaccine_name: string;
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
  notes?: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  vaccine_purchase_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  received_by_id: string;
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
  administered_by_id: string;
  notes?: string;
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

export interface PaymentProgress {
  total_price: number;
  amount_paid: number;
  balance: number;
  payment_status: PaymentStatus;
  total_doses: number;
  doses_paid_for: number;
  doses_administered: number;
  eligible_doses: number;
  is_completed: boolean;
}

export interface CreateVaccinePurchasePayload {
  patient_id: string;
  vaccine_id: string;
  total_doses: number;
  created_by_id: string;
}

export interface UpdateVaccinePurchasePayload {
  notes?: string;
  is_active?: boolean;
}

export interface CreatePaymentPayload {
  vaccine_purchase_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  received_by_id: string;
}

export interface CreateVaccinationPayload {
  vaccine_purchase_id: string;
  dose_date: string;
  administered_by_id: string;
  notes?: string;
}