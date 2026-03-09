/**
 * Re-exports pregnancy and child hooks from useChildren.ts.
 *
 * Pregnancy hooks live in useChildren.ts (alongside child hooks) because
 * the backend routes are nested under the same patient context.
 * This file exists purely so components can import from a
 * semantically-named path: hooks/usePregnancy.
 */
export {
    pregnancyKeys,
    usePregnancies,
    usePregnancy,
    useOpenPregnancy,
    useUpdatePregnancy,
    useClosePregnancy,
} from './useChildren';