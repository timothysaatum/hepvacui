export type PatientType = 'pregnant' | 'regular';
export type PatientStatus = 'active' | 'inactive' | 'postpartum' | 'completed' | 'converted';
export type Sex = 'male' | 'female';

export interface PatientLinks {
  purchase_vaccine?: string;
  update_patient?: string;
  convert_to_regular?: string;
  create_regular_patient?: string;
  get_patient?: string;
  delete_patient?: string;
}

// Helper interfaces for nested objects
export interface FacilityInfo {
  id: string;
  name: string;
}

export interface UserInfo {
  id: string;
  name: string;
}

export interface BasePatient {
  id: string;
  name: string;
  phone: string;
  age: number;
  patient_type: PatientType;
  status: PatientStatus;

  // Nested objects with id and name
  facility: FacilityInfo;
  created_by: UserInfo | null;
  updated_by: UserInfo | null;

  created_at: string;
  updated_at: string;
  links: PatientLinks;
}

export interface PregnantPatient extends BasePatient {
  patient_type: 'pregnant';
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  sex: 'female';
}

export interface RegularPatient extends BasePatient {
  patient_type: 'regular';
  sex: Sex;
  date_of_birth?: string | null;
  diagnosis_date?: string | null;
  viral_load?: string | null;
  last_viral_load_date?: string | null;
  treatment_start_date?: string | null;
  treatment_regimen?: string | null;
  medical_history?: string | null;
  allergies?: string | null;
  notes?: string | null;
}

export type Patient = PregnantPatient | RegularPatient;

export interface CreatePregnantPatientPayload {
  name: string;
  phone: string;
  sex: 'female';
  age: number;
  expected_delivery_date?: string;
}

export interface CreateRegularPatientPayload {
  name: string;
  phone: string;
  sex: Sex;
  age: number;
  date_of_birth?: string;
  diagnosis_date?: string;
  viral_load?: string;
  last_viral_load_date?: string;
  treatment_start_date?: string;
  treatment_regimen?: string;
  medical_history?: string;
  allergies?: string;
  notes?: string;
}

export interface UpdatePregnantPatientPayload {
  name?: string;
  phone?: string;
  age?: number;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status?: PatientStatus;
}

export interface UpdateRegularPatientPayload {
  name?: string;
  phone?: string;
  age?: number;
  date_of_birth?: string;
  diagnosis_date?: string;
  viral_load?: string;
  last_viral_load_date?: string;
  treatment_start_date?: string;
  treatment_regimen?: string;
  medical_history?: string;
  allergies?: string;
  notes?: string;
  status?: PatientStatus;
}

export interface ConvertToRegularPayload {
  actual_delivery_date: string;
  treatment_regimen?: string;
  notes?: string;
}

export interface PaginatedPatients {
  items: Patient[];
  page_info: {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export interface PatientFilters {
  facility_id?: string;
  patient_type?: PatientType;
  patient_status?: PatientStatus;
  page?: number;
  page_size?: number;
}

// Helper type guards
export function isPregnantPatient(patient: Patient): patient is PregnantPatient {
  return patient.patient_type === 'pregnant';
}

export function isRegularPatient(patient: Patient): patient is RegularPatient {
  return patient.patient_type === 'regular';
}

// Helper functions to access nested IDs
export function getFacilityId(patient: Patient): string {
  return patient.facility.id;
}

export function getFacilityName(patient: Patient): string {
  return patient.facility.name;
}

export function getCreatedById(patient: Patient): string | null {
  return patient.created_by?.id ?? null;
}

export function getCreatedByName(patient: Patient): string | null {
  return patient.created_by?.name ?? null;
}

export function getUpdatedById(patient: Patient): string | null {
  return patient.updated_by?.id ?? null;
}

export function getUpdatedByName(patient: Patient): string | null {
  return patient.updated_by?.name ?? null;
}