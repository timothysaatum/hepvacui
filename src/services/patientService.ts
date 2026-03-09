/**
 * Patient API service.
 */

import api from './api';
import type {
  PregnantPatient,
  RegularPatient,
  Patient,
  PatientType,
  CreatePregnantPatientPayload,
  CreateRegularPatientPayload,
  UpdatePregnantPatientPayload,
  UpdateRegularPatientPayload,
  ConvertToRegularPayload,
  PaginatedPatients,
  PatientFilters,
} from '../types/patient';

export const patientService = {
  // -------------------------------------------------------------------------
  // Pregnant patient
  // -------------------------------------------------------------------------

  /**
   * Register a new pregnant patient with her first pregnancy episode.
   * POST /api/v1/patients/pregnant
   *
   * `facility_id` and `created_by_id` are set server-side from auth context.
   * `first_pregnancy` is REQUIRED — API returns 422 without it.
   */
  createPregnantPatient: async (
    data: CreatePregnantPatientPayload
  ): Promise<PregnantPatient> => {
    const response = await api.post('/api/v1/patients/pregnant', data);
    return response.data;
  },

  /**
   * Get a pregnant patient by ID.
   * GET /api/v1/patients/pregnant/{patient_id}
   */
  getPregnantPatient: async (patientId: string): Promise<PregnantPatient> => {
    const response = await api.get(`/api/v1/patients/pregnant/${patientId}`);
    return response.data;
  },

  /**
   * Update patient-level fields on a pregnant patient.
   * PATCH /api/v1/patients/pregnant/{patient_id}
   *
   * Pregnancy clinical data (EDD, gestational age, risk factors) is updated
   * via updatePregnancy() in childService — NOT here.
   */
  updatePregnantPatient: async (
    patientId: string,
    data: UpdatePregnantPatientPayload
  ): Promise<PregnantPatient> => {
    const response = await api.patch(`/api/v1/patients/pregnant/${patientId}`, data);
    return response.data;
  },

  /**
   * Convert a pregnant patient to a regular patient after delivery.
   * POST /api/v1/patients/pregnant/{patient_id}/convert
   *
   * Closes the active pregnancy with `outcome` (REQUIRED) and transitions
   * the patient into the long-term treatment pathway.
   */
  convertToRegular: async (
    patientId: string,
    data: ConvertToRegularPayload
  ): Promise<RegularPatient> => {
    const response = await api.post(
      `/api/v1/patients/pregnant/${patientId}/convert`,
      data
    );
    return response.data;
  },

  // -------------------------------------------------------------------------
  // Regular patient
  // -------------------------------------------------------------------------

  /**
   * Register a new regular (non-pregnant) patient.
   * POST /api/v1/patients/regular
   *
   * `facility_id` and `created_by_id` are set server-side from auth context.
   */
  createRegularPatient: async (
    data: CreateRegularPatientPayload
  ): Promise<RegularPatient> => {
    const response = await api.post('/api/v1/patients/regular', data);
    return response.data;
  },

  /**
   * Get a regular patient by ID.
   * GET /api/v1/patients/regular/{patient_id}
   */
  getRegularPatient: async (patientId: string): Promise<RegularPatient> => {
    const response = await api.get(`/api/v1/patients/regular/${patientId}`);
    return response.data;
  },

  /**
   * Update a regular patient.
   * PATCH /api/v1/patients/regular/{patient_id}
   */
  updateRegularPatient: async (
    patientId: string,
    data: UpdateRegularPatientPayload
  ): Promise<RegularPatient> => {
    const response = await api.patch(`/api/v1/patients/regular/${patientId}`, data);
    return response.data;
  },

  // -------------------------------------------------------------------------
  // Type-aware fetcher
  // -------------------------------------------------------------------------

  /**
   * Fetch a patient by ID, routing to the correct typed endpoint.
   * Use this when you already know the patient_type (from a list response etc.).
   *
   *      endpoint and triggered silent 404s for every regular patient lookup.
   *
   * @param patientId - the patient's UUID
   * @param type      - 'pregnant' | 'regular' (obtained from list responses)
   */
  getPatientByType: async (
    patientId: string,
    type: PatientType
  ): Promise<Patient> => {
    return type === 'pregnant'
      ? patientService.getPregnantPatient(patientId)
      : patientService.getRegularPatient(patientId);
  },

  // -------------------------------------------------------------------------
  // Common
  // -------------------------------------------------------------------------

  /**
   * Get a paginated, filtered list of patients.
   * GET /api/v1/patients
   */
  getPatients: async (filters: PatientFilters = {}): Promise<PaginatedPatients> => {
    const response = await api.get('/api/v1/patients', {
      params: {
        facility_id: filters.facility_id,
        patient_type: filters.patient_type,
        patient_status: filters.patient_status,
        page: filters.page ?? 1,
        page_size: filters.page_size ?? 10,
      },
    });
    return response.data;
  },

  /**
   * Soft delete a patient.
   * DELETE /api/v1/patients/{patient_id}
   */
  deletePatient: async (patientId: string): Promise<void> => {
    await api.delete(`/api/v1/patients/${patientId}`);
  },
};