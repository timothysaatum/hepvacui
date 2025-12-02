import { z } from 'zod';

// Pregnant Patient Schema
export const createPregnantPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
  sex: z.literal('female'),
  age: z.number().min(13, 'Age must be at least 13').max(60, 'Age must be less than 60'),
  expected_delivery_date: z.string().min(1, 'Expected delivery date is required'),
});

export const updatePregnantPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  age: z.number().min(13).max(60).optional(),
  expected_delivery_date: z.string().optional(),
  actual_delivery_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'converted']).optional(),
});

// Regular Patient Schema
export const createRegularPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
  sex: z.enum(['male', 'female'], {errorMap: () => ({ message: 'Gender is required' }) }),
  age: z.number().min(0, 'Age must be positive').max(120, 'Age must be less than 120'),
  diagnosis_date: z.string().optional(),
  viral_load: z.string().max(50).optional(),
  last_viral_load_date: z.string().optional(),
  treatment_start_date: z.string().optional(),
  treatment_regimen: z.string().max(200).optional(),
  medical_history: z.string().max(1000).optional(),
  allergies: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateRegularPatientSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  age: z.number().min(0).max(120).optional(),
  diagnosis_date: z.string().optional(),
  viral_load: z.string().max(50).optional(),
  last_viral_load_date: z.string().optional(),
  treatment_start_date: z.string().optional(),
  treatment_regimen: z.string().max(200).optional(),
  medical_history: z.string().max(1000).optional(),
  allergies: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive', 'converted']).optional(),
});

// Convert to Regular Schema
export const convertToRegularSchema = z.object({
  actual_delivery_date: z.string().min(1, 'Actual delivery date is required'),
  treatment_regimen: z.string().max(200).optional(),
});

// Type exports
export type CreatePregnantPatientFormData = z.infer<typeof createPregnantPatientSchema>;
export type UpdatePregnantPatientFormData = z.infer<typeof updatePregnantPatientSchema>;
export type CreateRegularPatientFormData = z.infer<typeof createRegularPatientSchema>;
export type UpdateRegularPatientFormData = z.infer<typeof updateRegularPatientSchema>;
export type ConvertToRegularFormData = z.infer<typeof convertToRegularSchema>;