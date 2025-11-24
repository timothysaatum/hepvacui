import { z } from 'zod';

// Create Vaccine Purchase Schema
export const createVaccinePurchaseSchema = z.object({
  vaccine_id: z.string().uuid('Invalid vaccine ID'),
  total_doses: z.number().min(1, 'Total doses must be at least 1').max(10, 'Total doses cannot exceed 10'),
});

// Update Vaccine Purchase Schema
export const updateVaccinePurchaseSchema = z.object({
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  is_active: z.boolean().optional(),
});

// Create Payment Schema
export const createPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.string().min(1, 'Payment method is required').max(50, 'Payment method is too long'),
  reference_number: z.string().max(100, 'Reference number is too long').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Create Vaccination Schema
export const createVaccinationSchema = z.object({
  dose_date: z.string().min(1, 'Dose date is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Type exports
export type CreateVaccinePurchaseFormData = z.infer<typeof createVaccinePurchaseSchema>;
export type UpdateVaccinePurchaseFormData = z.infer<typeof updateVaccinePurchaseSchema>;
export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;
export type CreateVaccinationFormData = z.infer<typeof createVaccinationSchema>;