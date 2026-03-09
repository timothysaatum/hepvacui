/**
 * Re-exports single-patient hooks from usePatients.ts.
 *
 * usePatients.ts (plural) owns all patient-related hooks.
 * This file exists so components can do:
 *   import { usePatient, useConvertToRegular } from '../hooks/usePatient'
 * without confusion with the list hook.
 */
export {
    patientKeys,
    usePatient,
    usePregnantPatient,
    useRegularPatient,
    useCreatePregnantPatient,
    useCreateRegularPatient,
    useUpdatePregnantPatient,
    useUpdateRegularPatient,
    useConvertToRegular,
    useDeletePatient,
} from './usePatients';