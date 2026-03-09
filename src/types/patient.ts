/**
 * Patient types.

 */

import type { PregnancySummary, CreatePregnancyPayload, PregnancyOutcome } from './pregnancy';

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export type PatientType = 'pregnant' | 'regular';

/**
 * Backend enum: active | postpartum | completed | inactive
 */
export type PatientStatus = 'active' | 'inactive' | 'postpartum' | 'completed';

export type Sex = 'male' | 'female';

// ---------------------------------------------------------------------------
// Shared sub-interfaces
// ---------------------------------------------------------------------------

/** Compact facility reference embedded in patient responses. */
export interface FacilityInfo {
  id: string;
  name: string;    // maps from facility.facility_name server-side
}

/** Compact user reference for audit fields. */
export interface UserInfo {
  id: string;
  name: string;    // full_name or username
}

/**
 * HATEOAS links included in patient responses.
 */
export interface PatientLinks {
  self?: string;
  purchase_vaccine?: string;
  update_patient?: string;
  delete_patient?: string;
  // Pregnant patient only
  convert_to_regular?: string;
  pregnancies?: string;
  open_pregnancy?: string;
  // Legacy — kept for backward compatibility with older response shapes
  get_patient?: string;
  create_regular_patient?: string;
}

// ---------------------------------------------------------------------------
// Base patient
// ---------------------------------------------------------------------------

export interface BasePatient {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  sex: Sex;
  date_of_birth: string | null;
  patient_type: PatientType;
  status: PatientStatus;
  facility: FacilityInfo;
  created_by: UserInfo | null;
  updated_by: UserInfo | null;
  created_at: string;
  updated_at: string;
  links: PatientLinks;
}

// ---------------------------------------------------------------------------
// Pregnant patient
// ---------------------------------------------------------------------------

export interface PregnantPatient extends BasePatient {
  patient_type: 'pregnant';
  sex: 'female';

  /** Lifetime pregnancy count (incremented each time open_new_pregnancy is called). */
  gravida: number;

  /** Lifetime delivery count (incremented on LIVE_BIRTH or STILLBIRTH outcomes). */
  para: number;

  /**
   * The current active pregnancy episode, or null if no pregnancy is open.
   * Contains the expected delivery date, gestational age, etc.
   */
  active_pregnancy: PregnancySummary | null;

  /**
   * All completed pregnancy episodes for this patient, newest first.
   * Does NOT include the active pregnancy.
   */
  pregnancy_history: PregnancySummary[];
}

// ---------------------------------------------------------------------------
// Regular patient
// ---------------------------------------------------------------------------

export interface RegularPatient extends BasePatient {
  patient_type: 'regular';
  diagnosis_date: string | null;
  viral_load: string | null;
  last_viral_load_date: string | null;
  treatment_start_date: string | null;
  treatment_regimen: string | null;
  medical_history: string | null;
  allergies: string | null;
  notes: string | null;
}

/** Discriminated union — use isPregnantPatient() / isRegularPatient() to narrow. */
export type Patient = PregnantPatient | RegularPatient;

// ---------------------------------------------------------------------------
// Create payloads
// ---------------------------------------------------------------------------

/**
 * (now lives in first_pregnancy). Added required `first_pregnancy`.
 *
 * Sent to POST /api/v1/patients/pregnant.
 * `facility_id` and `created_by_id` are set server-side from auth context.
 */
export interface CreatePregnantPatientPayload {
  name: string;
  phone: string;
  sex: 'female';
  date_of_birth?: string;       // ISO date — used to compute age server-side

  /**
   * REQUIRED: The first pregnancy episode for this patient.
   * API returns 422 if omitted.
   */
  first_pregnancy: CreatePregnancyPayload;
}

/**
 *
 * Sent to POST /api/v1/patients/regular.
 * `facility_id` and `created_by_id` are set server-side from auth context.
 */
export interface CreateRegularPatientPayload {
  name: string;
  phone: string;
  sex: Sex;
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

// ---------------------------------------------------------------------------
// Update payloads
// ---------------------------------------------------------------------------

/**
 *
 *   PATCH /api/v1/pregnancies/{pregnancy_id}
 *
 * Sent to PATCH /api/v1/patients/pregnant/{patient_id}.
 */
export interface UpdatePregnantPatientPayload {
  name?: string;
  phone?: string;
  date_of_birth?: string;
  status?: PatientStatus;
}

/**
 * FIX: removed `age`.
 *
 * Sent to PATCH /api/v1/patients/regular/{patient_id}.
 */
export interface UpdateRegularPatientPayload {
  name?: string;
  phone?: string;
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

/**
 * FIX: added required `outcome: PregnancyOutcome`.
 * The backend ConvertToRegularPatientSchema requires it — omitting returns 422.
 *
 * Sent to POST /api/v1/patients/pregnant/{patient_id}/convert.
 */
export interface ConvertToRegularPayload {
  /** REQUIRED: the clinical outcome of the active pregnancy being closed. */
  outcome: PregnancyOutcome;
  actual_delivery_date?: string;
  treatment_regimen?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Type guards and helpers
// ---------------------------------------------------------------------------

export function isPregnantPatient(patient: Patient): patient is PregnantPatient {
  return patient.patient_type === 'pregnant';
}

export function isRegularPatient(patient: Patient): patient is RegularPatient {
  return patient.patient_type === 'regular';
}

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

/**
 * Returns the expected delivery date from the active pregnancy, or null.
 * Convenience accessor — avoids drilling into active_pregnancy everywhere.
 */
export function getExpectedDeliveryDate(patient: PregnantPatient): string | null {
  return patient.active_pregnancy?.expected_delivery_date ?? null;
}

/**
 * Returns a human-readable gravida/para string e.g. "G3 P2".
 */
export function getGravidaPara(patient: PregnantPatient): string {
  return `G${patient.gravida} P${patient.para}`;
}

/**
 * Returns true when the patient has an open (active) pregnancy.
 */
export function hasActivePregnancy(patient: PregnantPatient): boolean {
  return patient.active_pregnancy !== null;
}