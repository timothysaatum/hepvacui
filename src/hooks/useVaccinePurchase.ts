/**
 * Re-exports vaccine purchase hooks from useVaccinePurchases.ts.
 *
 * Simple aliases:
 *   usePurchase    → useVaccinePurchase   (shorter name for detail components)
 *   useEligibility → useCheckEligibility  (shorter name for eligibility checks)
 *
 * All other hooks are re-exported under their original names.
 * Components that previously used useCreatePurchase / useRecordPayment /
 * useAdministerDose have been updated to use the canonical names directly.
 */
export {
    vaccinePurchaseKeys,
    useVaccinePurchase,
    usePatientPurchases,
    usePurchaseProgress,
    usePurchasePayments,
    usePurchaseVaccinations,
    useCheckEligibility,
    useCreateVaccinePurchase,
    useUpdateVaccinePurchase,
    useCreatePayment,
    useAdministerVaccination,
} from './useVaccinePurchases';

export {
    useVaccinePurchase as usePurchase,
    useCheckEligibility as useEligibility,
} from './useVaccinePurchases';