/**
 * Children and Pregnancy React Query hooks.
 *                usePregnancies(patientId)
 *                usePregnancy(pregnancyId)
 *                useOpenPregnancy()
 *                useUpdatePregnancy()
 *                useClosePregnancy()
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenService, pregnancyService } from '../services/childService';
import { patientKeys } from './usePatients';
import type { CreateChildPayload, UpdateChildPayload } from '../types/child';
import type {
  CreatePregnancyPayload,
  UpdatePregnancyPayload,
  ClosePregnancyPayload,
} from '../types/pregnancy';
import { useToast } from '../context/ToastContext';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const pregnancyKeys = {
  all: ['pregnancies'] as const,

  /** All pregnancies for a specific patient. */
  byPatient: (patientId: string) =>
    [...pregnancyKeys.all, 'patient', patientId] as const,

  /** A single pregnancy episode. */
  detail: (pregnancyId: string) =>
    [...pregnancyKeys.all, 'detail', pregnancyId] as const,
};

export const childrenKeys = {
  all: ['children'] as const,

  /** Children scoped to a specific pregnancy episode. */
  byPregnancy: (pregnancyId: string) =>
    [...childrenKeys.all, 'byPregnancy', pregnancyId] as const,

  /** All children for a mother across ALL pregnancies. */
  byMother: (patientId: string) =>
    [...childrenKeys.all, 'byMother', patientId] as const,
};

// ---------------------------------------------------------------------------
// Pregnancy hooks
// ---------------------------------------------------------------------------

/**
 * Fetch all pregnancy episodes for a patient.
 * Ordered chronologically by pregnancy_number.
 */
export const usePregnancies = (patientId: string | null, enabled = true) => {
  return useQuery({
    queryKey: pregnancyKeys.byPatient(patientId!),
    queryFn: () => pregnancyService.listPatientPregnancies(patientId!),
    enabled: !!patientId && enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Fetch a single pregnancy episode by ID.
 */
export const usePregnancy = (pregnancyId: string | null, enabled = true) => {
  return useQuery({
    queryKey: pregnancyKeys.detail(pregnancyId!),
    queryFn: () => pregnancyService.getPregnancy(pregnancyId!),
    enabled: !!pregnancyId && enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Open a new pregnancy episode for a returning patient.
 *
 * Invalidates:
 *   - the patient's pregnancy list
 *   - the patient detail (active_pregnancy changes)
 *   - the patient list (gravida count changes)
 */
export const useOpenPregnancy = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: CreatePregnancyPayload;
    }) => pregnancyService.openPregnancy(patientId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pregnancyKeys.byPatient(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detailUnified(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detail(variables.patientId, 'pregnant'),
      });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      showSuccess('Pregnancy opened successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to open pregnancy';
      showError(msg);
    },
  });
};

/**
 * Update clinical data on an active pregnancy.
 *
 * Invalidates:
 *   - the specific pregnancy detail
 *   - the patient's pregnancy list
 *   - the patient detail (active_pregnancy embedded data changes)
 */
export const useUpdatePregnancy = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      pregnancyId,
      data,
    }: {
      pregnancyId: string;
      patientId: string;     // needed for cache invalidation
      data: UpdatePregnancyPayload;
    }) => pregnancyService.updatePregnancy(pregnancyId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pregnancyKeys.detail(variables.pregnancyId),
      });
      queryClient.invalidateQueries({
        queryKey: pregnancyKeys.byPatient(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detailUnified(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detail(variables.patientId, 'pregnant'),
      });
      showSuccess('Pregnancy updated successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to update pregnancy';
      showError(msg);
    },
  });
};

/**
 * Close an active pregnancy with a clinical outcome.
 *
 * Invalidates:
 *   - the specific pregnancy detail
 *   - the patient's pregnancy list
 *   - the patient detail (active_pregnancy → null, para may increment)
 *   - the patient list
 */
export const useClosePregnancy = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      pregnancyId,
      data,
    }: {
      pregnancyId: string;
      patientId: string;     // needed for cache invalidation
      data: ClosePregnancyPayload;
    }) => pregnancyService.closePregnancy(pregnancyId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pregnancyKeys.detail(variables.pregnancyId),
      });
      queryClient.invalidateQueries({
        queryKey: pregnancyKeys.byPatient(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detailUnified(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detail(variables.patientId, 'pregnant'),
      });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      // Children list for this pregnancy is now final — no invalidation needed.
      showSuccess('Pregnancy closed successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to close pregnancy';
      showError(msg);
    },
  });
};

// ---------------------------------------------------------------------------
// Child hooks
// ---------------------------------------------------------------------------

/**
 * Fetch all children from a specific pregnancy episode.
 * Use for: "show children from this delivery".
 *
 * FIX: replaces the old useMotherChildren(motherId) which used the wrong
 *      URL and would 404 on every call.
 */
export const usePregnancyChildren = (pregnancyId: string | null, enabled = true) => {
  return useQuery({
    queryKey: childrenKeys.byPregnancy(pregnancyId!),
    queryFn: () => childrenService.getPregnancyChildren(pregnancyId!),
    enabled: !!pregnancyId && enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Fetch all children for a mother across ALL her pregnancy episodes.
 * Use for: a patient's lifetime child history view.
 */
export const useMotherChildren = (patientId: string | null, enabled = true) => {
  return useQuery({
    queryKey: childrenKeys.byMother(patientId!),
    queryFn: () => childrenService.getMotherChildren(patientId!),
    enabled: !!patientId && enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Create a child record linked to a specific pregnancy episode.
 *
 * Invalidates:
 *   - children for the specific pregnancy
 *   - all children for the mother (cross-pregnancy view)
 *   - the pregnancy detail (children are embedded in PregnancyResponseSchema)
 */
export const useCreateChild = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      pregnancyId,
      data,
    }: {
      pregnancyId: string;
      patientId: string;     // needed for cross-pregnancy cache invalidation
      data: CreateChildPayload;
    }) => childrenService.createChild(pregnancyId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: childrenKeys.byPregnancy(variables.pregnancyId),
      });
      queryClient.invalidateQueries({
        queryKey: childrenKeys.byMother(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: pregnancyKeys.detail(variables.pregnancyId),
      });
      showSuccess('Child record added successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to add child record';
      showError(msg);
    },
  });
};

/**
 * Update monitoring fields on a child record.
 *
 * Invalidates:
 *   - children for the specific pregnancy
 *   - all children for the mother
 */
export const useUpdateChild = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      childId,
      data,
    }: {
      childId: string;
      pregnancyId: string;   // needed for cache invalidation
      patientId: string;     // needed for cross-pregnancy cache invalidation
      data: UpdateChildPayload;
    }) => childrenService.updateChild(childId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: childrenKeys.byPregnancy(variables.pregnancyId),
      });
      queryClient.invalidateQueries({
        queryKey: childrenKeys.byMother(variables.patientId),
      });
      showSuccess('Child record updated successfully');
    },

    onError: (error: any) => {
      const msg = error.response?.data?.detail ?? 'Failed to update child record';
      showError(msg);
    },
  });
};