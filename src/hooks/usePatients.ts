/**
 * Patient React Query hooks.
 *              includes the required `outcome: PregnancyOutcome` field.
 *              Without it every conversion call returns 422.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import type {
  PatientType,
  PatientFilters,
  CreatePregnantPatientPayload,
  CreateRegularPatientPayload,
  UpdatePregnantPatientPayload,
  UpdateRegularPatientPayload,
  ConvertToRegularPayload,
  ReRegisterAsPregnantPayload,
} from '../types/patient';
import { useToast } from '../context/ToastContext';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const patientKeys = {
  all: ['patients'] as const,

  lists: () => [...patientKeys.all, 'list'] as const,

  list: (filters: PatientFilters) =>
    [...patientKeys.lists(), filters] as const,

  details: () => [...patientKeys.all, 'detail'] as const,

  /** Type-scoped detail key — use when type is known. */
  detail: (id: string, type: PatientType) =>
    [...patientKeys.details(), id, type] as const,

  /** Unified detail key — used when type is not known at call time. */
  detailUnified: (id: string) =>
    [...patientKeys.details(), id] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/** Fetch a paginated, filtered list of patients. */
export const usePatients = (filters: PatientFilters = {}) => {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => patientService.getPatients(filters),
    staleTime: 3 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

/**
 * Fetch a single patient by ID.
 *
 *      typed endpoint immediately. The old fallback approach made an
 *      unnecessary failed request for every regular patient.
 *
 * @param patientId   — the patient UUID (null disables the query)
 * @param patientType — 'pregnant' | 'regular' — always known from list data
 */
export const usePatient = (
  patientId: string | null,
  patientType?: PatientType | null
) => {
  return useQuery({
    queryKey: patientType
      ? patientKeys.detail(patientId!, patientType)
      : patientKeys.detailUnified(patientId!),
    queryFn: () => patientType
      ? patientService.getPatientByType(patientId!, patientType)
      : patientService.getPatient(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/** Fetch a pregnant patient specifically. Prefer usePatient() for new code. */
export const usePregnantPatient = (patientId: string | null) => {
  return useQuery({
    queryKey: patientKeys.detail(patientId!, 'pregnant'),
    queryFn: () => patientService.getPregnantPatient(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

/** Fetch a regular patient specifically. Prefer usePatient() for new code. */
export const useRegularPatient = (patientId: string | null) => {
  return useQuery({
    queryKey: patientKeys.detail(patientId!, 'regular'),
    queryFn: () => patientService.getRegularPatient(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Create a new pregnant patient.
 *
 *      The old payload was missing it — every create call returned 422.
 */
export const useCreatePregnantPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreatePregnantPatientPayload) =>
      patientService.createPregnantPatient(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Pregnant patient registered successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to register pregnant patient';
      showError(msg);
    },
  });
};

/** Create a new regular patient. */
export const useCreateRegularPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateRegularPatientPayload) =>
      patientService.createRegularPatient(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Patient registered successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to register patient';
      showError(msg);
    },
  });
};

/** Update patient-level fields on a pregnant patient. */
export const useUpdatePregnantPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: UpdatePregnantPatientPayload;
    }) => patientService.updatePregnantPatient(patientId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detail(variables.patientId, 'pregnant'),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detailUnified(variables.patientId),
      });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Patient updated successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to update patient';
      showError(msg);
    },
  });
};

/** Update a regular patient. */
export const useUpdateRegularPatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: UpdateRegularPatientPayload;
    }) => patientService.updateRegularPatient(patientId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detail(variables.patientId, 'regular'),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detailUnified(variables.patientId),
      });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Patient updated successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to update patient';
      showError(msg);
    },
  });
};

/**
 * Convert a pregnant patient to a regular patient.
 *
 */
export const useConvertToRegular = (onConverted?: (patientId: string) => void) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: ConvertToRegularPayload;
    }) => patientService.convertToRegular(patientId, data),

    onSuccess: (convertedPatient, variables) => {
      const convertedId = convertedPatient?.id ?? variables.patientId;

      // Remove (not just invalidate) the typed detail cache entries so React Query
      // cannot fire a background refetch before navigation unmounts the subscriber.
      // invalidateQueries triggers an immediate refetch of any mounted query, which
      // would hit GET /pregnant/{id} after the discriminator flipped → 409 Conflict.
      queryClient.removeQueries({
        queryKey: patientKeys.detail(variables.patientId, 'pregnant'),
      });
      queryClient.removeQueries({
        queryKey: patientKeys.detailUnified(variables.patientId),
      });
      queryClient.setQueryData(
        patientKeys.detail(convertedId, 'regular'),
        convertedPatient
      );
      queryClient.setQueryData(
        patientKeys.detailUnified(convertedId),
        convertedPatient
      );

      // Navigate first so the component unmounts before the list refresh fires.
      showSuccess('Patient converted to regular care successfully');
      onConverted?.(convertedId);

      // Invalidate the list + search in the background after navigation.
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to convert patient';
      showError(msg);
    },
  });
};

/** Re-register a regular patient as pregnant (second or later pregnancy). */
export const useReRegisterAsPregnant = (onReRegistered?: (patientId: string) => void) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: ReRegisterAsPregnantPayload;
    }) => patientService.reRegisterAsPregnant(patientId, data),

    onSuccess: (_, variables) => {
      // Same pattern: remove regular detail before navigating to prevent a
      // background refetch hitting GET /regular/{id} after the discriminator
      // has flipped back to PREGNANT.
      queryClient.removeQueries({
        queryKey: patientKeys.detail(variables.patientId, 'regular'),
      });
      queryClient.removeQueries({
        queryKey: patientKeys.detailUnified(variables.patientId),
      });

      showSuccess('Patient re-registered as pregnant successfully');
      onReRegistered?.(variables.patientId);

      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to re-register patient';
      showError(msg);
    },
  });
};

/** Soft delete a patient. */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (patientId: string) => patientService.deletePatient(patientId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['search', 'patients'] });
      showSuccess('Patient deleted successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to delete patient';
      showError(msg);
    },
  });
};
