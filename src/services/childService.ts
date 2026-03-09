/**
 * Child and Pregnancy API service.
 */

import api from './api';
import type { Child, CreateChildPayload, UpdateChildPayload } from '../types/child';
import type {
  Pregnancy,
  CreatePregnancyPayload,
  UpdatePregnancyPayload,
  ClosePregnancyPayload,
} from '../types/pregnancy';

// ---------------------------------------------------------------------------
// Pregnancy service
// ---------------------------------------------------------------------------

export const pregnancyService = {
  /**
   * Open a new pregnancy episode for a returning patient.
   * POST /api/v1/patients/pregnant/{patient_id}/pregnancies
   */
  openPregnancy: async (
    patientId: string,
    data: CreatePregnancyPayload
  ): Promise<Pregnancy> => {
    const response = await api.post(
      `/api/v1/patients/pregnant/${patientId}/pregnancies`,
      data
    );
    return response.data;
  },

  /**
   * List all pregnancy episodes for a patient, ordered by pregnancy_number.
   * GET /api/v1/patients/pregnant/{patient_id}/pregnancies
   */
  listPatientPregnancies: async (patientId: string): Promise<Pregnancy[]> => {
    const response = await api.get(
      `/api/v1/patients/pregnant/${patientId}/pregnancies`
    );
    return response.data;
  },

  /**
   * Get a single pregnancy episode by ID.
   * GET /api/v1/patients/pregnancies/{pregnancy_id}
   */
  getPregnancy: async (pregnancyId: string): Promise<Pregnancy> => {
    const response = await api.get(`/api/v1/patients/pregnancies/${pregnancyId}`);
    return response.data;
  },

  /**
   * Update clinical data on an active pregnancy episode.
   * PATCH /api/v1/patients/pregnancies/{pregnancy_id}
   * Returns 400 if the pregnancy is already closed.
   */
  updatePregnancy: async (
    pregnancyId: string,
    data: UpdatePregnancyPayload
  ): Promise<Pregnancy> => {
    const response = await api.patch(
      `/api/v1/patients/pregnancies/${pregnancyId}`,
      data
    );
    return response.data;
  },

  /**
   * Close an active pregnancy with a clinical outcome.
   * POST /api/v1/patients/pregnancies/{pregnancy_id}/close
   * Returns 400 if the pregnancy is already closed.
   */
  closePregnancy: async (
    pregnancyId: string,
    data: ClosePregnancyPayload
  ): Promise<Pregnancy> => {
    const response = await api.post(
      `/api/v1/patients/pregnancies/${pregnancyId}/close`,
      data
    );
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Child service
// ---------------------------------------------------------------------------

export const childrenService = {
  /**
   * Create a child record linked to a specific pregnancy episode.
   * POST /api/v1/pregnancies/{pregnancy_id}/children
   *
   */
  createChild: async (
    pregnancyId: string,
    data: CreateChildPayload
  ): Promise<Child> => {
    const response = await api.post(
      `/api/v1/pregnancies/${pregnancyId}/children`,
      data
    );
    return response.data;
  },

  /**
   * List all children from a single pregnancy episode.
   * GET /api/v1/pregnancies/{pregnancy_id}/children
   *
   * Use this for: "show children from this delivery".
   */
  getPregnancyChildren: async (pregnancyId: string): Promise<Child[]> => {
    const response = await api.get(
      `/api/v1/pregnancies/${pregnancyId}/children`
    );
    return response.data;
  },

  /**
   * List all children for a mother across ALL her pregnancy episodes.
   * GET /api/v1/patients/pregnant/{patient_id}/children
   *
   * Use this for: "show all children this patient has ever had".
   */
  getMotherChildren: async (patientId: string): Promise<Child[]> => {
    const response = await api.get(
      `/api/v1/patients/pregnant/${patientId}/children`
    );
    return response.data;
  },

  /**
   * Update monitoring fields on a child record.
   * PATCH /api/v1/children/{child_id}
   *
   */
  updateChild: async (
    childId: string,
    data: UpdateChildPayload
  ): Promise<Child> => {
    const response = await api.patch(`/api/v1/children/${childId}`, data);
    return response.data;
  },
};