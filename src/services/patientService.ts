import api from './api';
import type {
  PregnantPatient,
  RegularPatient,
  CreatePregnantPatientPayload,
  CreateRegularPatientPayload,
  UpdatePregnantPatientPayload,
  UpdateRegularPatientPayload,
  ConvertToRegularPayload,
  PaginatedPatients,
  PatientFilters,
} from '../types/patient';

export const patientService = {
  // Create pregnant patient
  createPregnantPatient: async (data: CreatePregnantPatientPayload): Promise<PregnantPatient> => {
    const response = await api.post('/api/v1/patients/pregnant', data);
    return response.data;
  },

  // Create regular patient
  createRegularPatient: async (data: CreateRegularPatientPayload): Promise<RegularPatient> => {
    const response = await api.post('/api/v1/patients/regular', data);
    return response.data;
  },

  // Get paginated patients
  getPatients: async (filters: PatientFilters = {}): Promise<PaginatedPatients> => {
    const response = await api.get('/api/v1/patients', {
      params: {
        facility_id: filters.facility_id,
        patient_type: filters.patient_type,
        patient_status: filters.patient_status,
        page: filters.page || 1,
        page_size: filters.page_size || 10,
      },
    });
    return response.data;
  },

  // Get single pregnant patient
  getPregnantPatient: async (patientId: string): Promise<PregnantPatient> => {
    const response = await api.get(`/api/v1/patients/pregnant/${patientId}`);
    return response.data;
  },

  // Get single regular patient
  getRegularPatient: async (patientId: string): Promise<RegularPatient> => {
    const response = await api.get(`/api/v1/patients/regular/${patientId}`);
    return response.data;
  },

  // Update pregnant patient
  updatePregnantPatient: async (
    patientId: string,
    data: UpdatePregnantPatientPayload
  ): Promise<PregnantPatient> => {
    const response = await api.patch(`/api/v1/patients/pregnant/${patientId}`, data);
    return response.data;
  },

  // Update regular patient
  updateRegularPatient: async (
    patientId: string,
    data: UpdateRegularPatientPayload
  ): Promise<RegularPatient> => {
    const response = await api.patch(`/api/v1/patients/regular/${patientId}`, data);
    return response.data;
  },

  // Convert pregnant patient to regular
  convertToRegular: async (
    patientId: string,
    data: ConvertToRegularPayload
  ): Promise<RegularPatient> => {
    const response = await api.post(`/api/v1/patients/pregnant/${patientId}/convert`, data);
    return response.data;
  },

  // Delete patient
  deletePatient: async (patientId: string): Promise<void> => {
    await api.delete(`/api/v1/patients/${patientId}`);
  },
};