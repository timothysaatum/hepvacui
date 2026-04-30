import { z } from 'zod';

const patientStatus = z.enum(['active', 'inactive', 'postpartum', 'completed', 'converted']);
const phoneSchema = z
  .string()
  .trim()
  .refine((value) => !/[a-z]/i.test(value), 'Phone number must not contain letters')
  .refine((value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }, 'Phone number must contain 10 to 15 digits');
const optionalText = (max = 255) => z.string().trim().max(max).optional();
const identityFields = {
  name: optionalText(255),
  first_name: z.string().trim().min(2, 'First name is required').max(100),
  last_name: z.string().trim().min(2, 'Last name is required').max(100),
  preferred_name: optionalText(100),
  medical_record_number: optionalText(64),
  address_line: optionalText(255),
  city: optionalText(100),
  district: optionalText(100),
  region: optionalText(100),
  country: optionalText(100),
  emergency_contact_name: optionalText(255),
  emergency_contact_phone: phoneSchema.optional().or(z.literal('')),
  emergency_contact_relationship: optionalText(100),
};

const identityUpdateFields = {
  name: optionalText(255),
  first_name: z.string().trim().min(2).max(100).optional(),
  last_name: z.string().trim().min(2).max(100).optional(),
  preferred_name: optionalText(100),
  medical_record_number: optionalText(64),
  address_line: optionalText(255),
  city: optionalText(100),
  district: optionalText(100),
  region: optionalText(100),
  country: optionalText(100),
  emergency_contact_name: optionalText(255),
  emergency_contact_phone: phoneSchema.optional().or(z.literal('')),
  emergency_contact_relationship: optionalText(100),
};

// Pregnant Patient Schema
export const createPregnantPatientSchema = z.object({
  ...identityFields,
  phone: phoneSchema,
  sex: z.literal('female'),
  date_of_birth: z.string().optional(),
  accepts_messaging: z.boolean().optional(),
  first_pregnancy: z.object({
    lmp_date: z.string().optional(),
    expected_delivery_date: z.string().optional(),
    gestational_age_weeks: z.number().min(1).max(45).optional(),
    risk_factors: z.string().max(1000).optional(),
    notes: z.string().optional(),
  }),
});

export const updatePregnantPatientSchema = z.object({
  ...identityUpdateFields,
  phone: phoneSchema.optional(),
  date_of_birth: z.string().optional(),
  status: patientStatus.optional(),
  accepts_messaging: z.boolean().optional(),
});

// Regular Patient Schema
export const createRegularPatientSchema = z.object({
  ...identityFields,
  phone: phoneSchema,
  sex: z.enum(['male', 'female']),
  date_of_birth: z.string().optional(),
  accepts_messaging: z.boolean().optional(),
});

export const updateRegularPatientSchema = z.object({
  ...identityUpdateFields,
  phone: phoneSchema.optional(),
  date_of_birth: z.string().optional(),
  status: patientStatus.optional(),
  accepts_messaging: z.boolean().optional(),
});

// Convert to Regular Schema
export const convertToRegularSchema = z.object({
  outcome: z.enum(['live_birth', 'stillbirth', 'miscarriage', 'abortion', 'ectopic']),
  actual_delivery_date: z.string().min(1, 'Actual delivery date is required'),
});

// Type exports
export type CreatePregnantPatientFormData = z.infer<typeof createPregnantPatientSchema>;
export type UpdatePregnantPatientFormData = z.infer<typeof updatePregnantPatientSchema>;
export type CreateRegularPatientFormData = z.infer<typeof createRegularPatientSchema>;
export type UpdateRegularPatientFormData = z.infer<typeof updateRegularPatientSchema>;
export type ConvertToRegularFormData = z.infer<typeof convertToRegularSchema>;
