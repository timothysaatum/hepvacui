import api from './api';
import type {
    Prescription,
    CreatePrescriptionPayload,
    UpdatePrescriptionPayload,
    MedicationSchedule,
    CreateSchedulePayload,
    UpdateSchedulePayload,
} from '../types/medication';

export const medicationService = {
    // ── Prescriptions ─────────────────────────────────────────────────────────

    createPrescription: async (
        patientId: string,
        data: CreatePrescriptionPayload
    ): Promise<Prescription> => {
        const response = await api.post(
            `/api/v1/patient-medication/${patientId}/prescriptions`,
            data
        );
        return response.data;
    },

    listPrescriptions: async (
        patientId: string,
        activeOnly = false
    ): Promise<Prescription[]> => {
        const response = await api.get(
            `/api/v1/patient-medication/${patientId}/prescriptions`,
            { params: { active_only: activeOnly } }
        );
        return response.data;
    },

    updatePrescription: async (
        prescriptionId: string,
        data: UpdatePrescriptionPayload
    ): Promise<Prescription> => {
        const response = await api.patch(
            `/api/v1/patient-medication/prescriptions/${prescriptionId}`,
            data
        );
        return response.data;
    },

    // ── Medication Schedules ──────────────────────────────────────────────────

    createSchedule: async (
        patientId: string,
        data: CreateSchedulePayload
    ): Promise<MedicationSchedule> => {
        const response = await api.post(
            `/api/v1/patient-medication-schedules/${patientId}`,
            data
        );
        return response.data;
    },

    listSchedules: async (
        patientId: string,
        activeOnly = false
    ): Promise<MedicationSchedule[]> => {
        const response = await api.get(
            `/api/v1/patient-medication-schedules/${patientId}`,
            { params: { active_only: activeOnly } }
        );
        return response.data;
    },

    updateSchedule: async (
        scheduleId: string,
        data: UpdateSchedulePayload
    ): Promise<MedicationSchedule> => {
        const response = await api.patch(
            `/api/v1/patient-medication-schedules/${scheduleId}`,
            data
        );
        return response.data;
    },
};
