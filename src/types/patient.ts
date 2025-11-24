export type PatientType = 'pregnant' | 'regular';
export type PatientStatus = 'active' | 'inactive' | 'converted';
export type Sex = 'male' | 'female';

export interface PatientLinks {
  purchase_vaccine?: string;
  update_patient?: string;
  convert_to_regular?: string;
  create_regular_patient?: string;
  get_patient?: string;
  delete_patient?: string;
}

export interface BasePatient {
  id: string;
  name: string;
  phone: string;
  age: number;
  patient_type: PatientType;
  status: PatientStatus;
  facility_id: string;
  created_by_id: string;
  updated_by_id: string | null;
  created_at: string;
  updated_at: string;
  links: PatientLinks;
}

export interface PregnantPatient extends BasePatient {
  patient_type: 'pregnant';
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  sex: 'female';
}

export interface RegularPatient extends BasePatient {
  patient_type: 'regular';
  sex: Sex;
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
  expected_delivery_date: string;
}

export interface CreateRegularPatientPayload {
  name: string;
  phone: string;
  sex: Sex;
  age: number;
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
  updated_by_id: string;
}

export interface UpdateRegularPatientPayload {
  name?: string;
  phone?: string;
  age?: number;
  diagnosis_date?: string;
  viral_load?: string;
  last_viral_load_date?: string;
  treatment_start_date?: string;
  treatment_regimen?: string;
  medical_history?: string;
  allergies?: string;
  notes?: string;
  status?: PatientStatus;
  updated_by_id: string;
}

export interface ConvertToRegularPayload {
  actual_delivery_date: string;
  treatment_regimen?: string;
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