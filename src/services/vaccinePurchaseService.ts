import api from './api';
import type {
  VaccinePurchase,
  Payment,
  Vaccination,
  EligibilityCheck,
  PaymentProgress,
  CreateVaccinePurchasePayload,
  UpdateVaccinePurchasePayload,
  CreatePaymentPayload,
  CreateVaccinationPayload,
} from '../types/vaccinePurchase';

export const vaccinePurchaseService = {
  // Create vaccine purchase
  createVaccinePurchase: async (
    patientId: string,
    data: CreateVaccinePurchasePayload
  ): Promise<VaccinePurchase> => {
    const response = await api.post(`/api/v1/purchase-vaccine/${patientId}`, data);
    return response.data;
  },

  // Get single vaccine purchase
  getVaccinePurchase: async (purchaseId: string): Promise<VaccinePurchase> => {
    const response = await api.get(`/api/v1/purchase-vaccine/${purchaseId}`);
    return response.data;
  },

  // List patient's vaccine purchases
  listPatientPurchases: async (
    patientId: string,
    activeOnly?: boolean
  ): Promise<VaccinePurchase[]> => {
    const response = await api.get(`/api/v1/purchase-vaccine/${patientId}/vaccines`, {
      params: { active_only: activeOnly },
    });
    return response.data;
  },

  // Update vaccine purchase
  updateVaccinePurchase: async (
    purchaseId: string,
    data: UpdateVaccinePurchasePayload
  ): Promise<VaccinePurchase> => {
    const response = await api.patch(`/api/v1/purchase-vaccine/${purchaseId}`, data);
    return response.data;
  },

  // Get purchase progress
  getPurchaseProgress: async (purchaseId: string): Promise<PaymentProgress> => {
    const response = await api.get(`/api/v1/purchase-vaccine/${purchaseId}/progress`);
    return response.data;
  },

  // Create payment
  createPayment: async (
    purchaseId: string,
    data: CreatePaymentPayload
  ): Promise<Payment> => {
    const response = await api.post(`/api/v1/vaccine-payment/${purchaseId}`, data);
    return response.data;
  },

  // Get single payment
  getPayment: async (paymentId: string): Promise<Payment> => {
    const response = await api.get(`/api/v1/vaccine-payment/${paymentId}`);
    return response.data;
  },

  // List purchase payments
  listPurchasePayments: async (purchaseId: string): Promise<Payment[]> => {
    const response = await api.get(`/api/v1/vaccine-payment/${purchaseId}`);
    return response.data;
  },

  // Administer vaccination
  administerVaccination: async (
    purchaseId: string,
    data: CreateVaccinationPayload
  ): Promise<Vaccination> => {
    const response = await api.post(`/api/v1/administer/${purchaseId}`, data);
    return response.data;
  },

  // List purchase vaccinations
  listPurchaseVaccinations: async (purchaseId: string): Promise<Vaccination[]> => {
    const response = await api.get(`/api/v1/administer/${purchaseId}`);
    return response.data;
  },

  // Check vaccination eligibility
  checkEligibility: async (purchaseId: string): Promise<EligibilityCheck> => {
    const response = await api.get(`/api/v1/administer/${purchaseId}/eligibility`);
    return response.data;
  },
};