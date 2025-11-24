import { z } from 'zod';

// User Creation Schema
export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

// User Update Schema
export const updateUserSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional(),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional(),
  
  is_active: z.boolean().optional(),
  is_suspended: z.boolean().optional(),
});


// Facility Creation Schema
export const createFacilitySchema = z.object({
  facility_name: z.string()
    .min(3, 'Facility name must be at least 3 characters')
    .max(100, 'Facility name must be less than 100 characters'),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be less than 500 characters'),
});

// Facility Update Schema
export const updateFacilitySchema = z.object({
  facility_name: z.string()
    .min(3, 'Facility name must be at least 3 characters')
    .max(100, 'Facility name must be less than 100 characters')
    .optional(),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional(),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional(),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be less than 500 characters')
    .optional(),
});


export const createVaccineSchema = z.object({
  vaccine_name: z.string()
    .min(2, 'Vaccine name must be at least 2 characters')
    .max(100, 'Vaccine name must be less than 100 characters'),
  
  price_per_dose: z.number()
    .min(0, 'Price must be a positive number')
    .max(999999, 'Price is too high'),
  
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity must be at least 0'),
  
  batch_number: z.string()
    .min(3, 'Batch number must be at least 3 characters')
    .max(50, 'Batch number must be less than 50 characters')
    .regex(/^[A-Z0-9-]+$/i, 'Batch number can only contain letters, numbers, and hyphens'),
  
  is_published: z.boolean().optional(),
});

// Vaccine Update Schema
export const updateVaccineSchema = z.object({
  vaccine_name: z.string()
    .min(2, 'Vaccine name must be at least 2 characters')
    .max(100, 'Vaccine name must be less than 100 characters')
    .optional(),
  
  price_per_dose: z.number()
    .min(0, 'Price must be a positive number')
    .max(999999, 'Price is too high')
    .optional(),
  
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity must be at least 0')
    .optional(),
  
  batch_number: z.string()
    .min(3, 'Batch number must be at least 3 characters')
    .max(50, 'Batch number must be less than 50 characters')
    .regex(/^[A-Z0-9-]+$/i, 'Batch number can only contain letters, numbers, and hyphens')
    .optional(),
  
  is_published: z.boolean().optional(),
});

// Add Stock Schema
export const addStockSchema = z.object({
  quantity_to_add: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Cannot add more than 100,000 units at once'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateFacilityFormData = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityFormData = z.infer<typeof updateFacilitySchema>;
export type CreateVaccineFormData = z.infer<typeof createVaccineSchema>;
export type UpdateVaccineFormData = z.infer<typeof updateVaccineSchema>;
export type AddStockFormData = z.infer<typeof addStockSchema>;