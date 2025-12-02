import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccinePurchaseService } from '../services/vaccinePurchaseService';
import type {
  CreateVaccinePurchasePayload,
  UpdateVaccinePurchasePayload,
  CreatePaymentPayload,
  CreateVaccinationPayload,
} from '../types/vaccinePurchase';
import { useToast } from '../context/ToastContext';

// Query Keys
export const vaccinePurchaseKeys = {
  all: ['vaccinePurchases'] as const,
  lists: () => [...vaccinePurchaseKeys.all, 'list'] as const,
  list: (patientId: string, activeOnly?: boolean) =>
    [...vaccinePurchaseKeys.lists(), patientId, activeOnly] as const,
  details: () => [...vaccinePurchaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...vaccinePurchaseKeys.details(), id] as const,
  progress: (id: string) => [...vaccinePurchaseKeys.all, 'progress', id] as const,
  eligibility: (id: string) => [...vaccinePurchaseKeys.all, 'eligibility', id] as const,
  payments: (purchaseId: string) => [...vaccinePurchaseKeys.all, 'payments', purchaseId] as const,
  vaccinations: (purchaseId: string) => [...vaccinePurchaseKeys.all, 'vaccinations', purchaseId] as const,
};

// Fetch Single Vaccine Purchase
export const useVaccinePurchase = (purchaseId: string | null) => {
  return useQuery({
    queryKey: vaccinePurchaseKeys.detail(purchaseId!),
    queryFn: () => vaccinePurchaseService.getVaccinePurchase(purchaseId!),
    enabled: !!purchaseId,
    staleTime: 2 * 60 * 1000,
  });
};

// Fetch Patient's Vaccine Purchases
export const usePatientPurchases = (patientId: string | null, activeOnly?: boolean) => {
  return useQuery({
    queryKey: vaccinePurchaseKeys.list(patientId!, activeOnly),
    queryFn: () => vaccinePurchaseService.listPatientPurchases(patientId!, activeOnly),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
};

// Fetch Purchase Progress
export const usePurchaseProgress = (purchaseId: string | null) => {
  return useQuery({
    queryKey: vaccinePurchaseKeys.progress(purchaseId!),
    queryFn: () => vaccinePurchaseService.getPurchaseProgress(purchaseId!),
    enabled: !!purchaseId,
    staleTime: 1 * 60 * 1000,
  });
};

// Fetch Purchase Payments
export const usePurchasePayments = (purchaseId: string | null) => {
  return useQuery({
    queryKey: vaccinePurchaseKeys.payments(purchaseId!),
    queryFn: () => vaccinePurchaseService.listPurchasePayments(purchaseId!),
    enabled: !!purchaseId,
    staleTime: 2 * 60 * 1000,
  });
};

// Fetch Purchase Vaccinations
export const usePurchaseVaccinations = (purchaseId: string | null) => {
  return useQuery({
    queryKey: vaccinePurchaseKeys.vaccinations(purchaseId!),
    queryFn: () => vaccinePurchaseService.listPurchaseVaccinations(purchaseId!),
    enabled: !!purchaseId,
    staleTime: 2 * 60 * 1000,
  });
};

// Check Eligibility
export const useCheckEligibility = (purchaseId: string | null) => {
  return useQuery({
    queryKey: vaccinePurchaseKeys.eligibility(purchaseId!),
    queryFn: () => vaccinePurchaseService.checkEligibility(purchaseId!),
    enabled: !!purchaseId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Create Vaccine Purchase Mutation
export const useCreateVaccinePurchase = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateVaccinePurchasePayload }) =>
      vaccinePurchaseService.createVaccinePurchase(patientId, data),
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries(vaccinePurchaseKeys.list(variables.patientId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.list(variables.patientId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.lists() });
      showSuccess('Vaccine purchase created successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to create vaccine purchase';
      showError(errorMsg);
    },
  });
};

// Update Vaccine Purchase Mutation
export const useUpdateVaccinePurchase = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ purchaseId, data }: { purchaseId: string; data: UpdateVaccinePurchasePayload }) =>
      vaccinePurchaseService.updateVaccinePurchase(purchaseId, data),
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries(vaccinePurchaseKeys.detail(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.detail(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.lists() });

      showSuccess('Vaccine purchase updated successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to update vaccine purchase';
      showError(errorMsg);
    },
  });
};

// Create Payment Mutation
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ purchaseId, data }: { purchaseId: string; data: CreatePaymentPayload }) =>
      vaccinePurchaseService.createPayment(purchaseId, data),
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries(vaccinePurchaseKeys.detail(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.detail(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.payments(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.payments(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.progress(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.progress(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.eligibility(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.eligibility(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.lists() });
      showSuccess('Payment recorded successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to record payment';
      showError(errorMsg);
    },
  });
};

// Administer Vaccination Mutation
export const useAdministerVaccination = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ purchaseId, data }: { purchaseId: string; data: CreateVaccinationPayload }) =>
      vaccinePurchaseService.administerVaccination(purchaseId, data),
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries(vaccinePurchaseKeys.detail(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.detail(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.vaccinations(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.vaccinations(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.progress(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.progress(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.eligibility(variables.purchaseId));
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.eligibility(variables.purchaseId) });
      // queryClient.invalidateQueries(vaccinePurchaseKeys.lists());
      queryClient.invalidateQueries({ queryKey: vaccinePurchaseKeys.lists() });
      showSuccess('Vaccination administered successfully');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Failed to administer vaccination';
      showError(errorMsg);
    },
  });
};