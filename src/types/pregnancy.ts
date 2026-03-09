/**
 * Pregnancy types — episode-level obstetric data.
 *
 * A PregnantPatient has one or more Pregnancy episodes (one per conception).
 * Each Pregnancy owns its clinical dates, outcome, and children.
 * These types mirror the Pydantic schemas on the backend exactly.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/** Clinical outcome of a completed pregnancy episode. */
export type PregnancyOutcome =
    | 'live_birth'
    | 'stillbirth'
    | 'miscarriage'
    | 'abortion'
    | 'ectopic';

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

/**
 * Compact pregnancy summary embedded inside PregnantPatient responses.
 * Use this for list views and patient cards.
 * For full clinical detail (risk factors, notes, children), fetch PregnancyDetail.
 */
export interface PregnancySummary {
    id: string;
    pregnancy_number: number;
    is_active: boolean;
    lmp_date: string | null;
    expected_delivery_date: string | null;
    actual_delivery_date: string | null;
    gestational_age_weeks: number | null;
    outcome: PregnancyOutcome | null;
}

/**
 * Full pregnancy episode response — returned by GET /pregnancies/{id}
 * and by the pregnancy list endpoint.
 */
export interface Pregnancy extends PregnancySummary {
    patient_id: string;
    risk_factors: string | null;
    notes: string | null;
    children: import('./child').Child[];
    created_at: string;
    updated_at: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

/**
 * Payload for opening a new pregnancy episode.
 * Sent to POST /patients/pregnant/{patient_id}/pregnancies.
 * `patient_id` is injected server-side from the URL path — omit from body.
 */
export interface CreatePregnancyPayload {
    lmp_date?: string;
    expected_delivery_date?: string;
    gestational_age_weeks?: number;
    risk_factors?: string;
    notes?: string;
}

/**
 * Payload for updating clinical data on an active pregnancy.
 * Sent to PATCH /pregnancies/{pregnancy_id}.
 * All fields optional — only send what changed.
 */
export interface UpdatePregnancyPayload {
    lmp_date?: string;
    expected_delivery_date?: string;
    gestational_age_weeks?: number;
    risk_factors?: string;
    notes?: string;
}

/**
 * Payload for closing an active pregnancy with a clinical outcome.
 * Sent to POST /pregnancies/{pregnancy_id}/close.
 *
 * `increment_para`:
 *   true  → LIVE_BIRTH, STILLBIRTH (counts toward para)
 *   false → MISCARRIAGE, ABORTION, ECTOPIC (does not count toward para)
 *
 * If omitted, defaults to true on the backend. Always send explicitly.
 */
export interface ClosePregnancyPayload {
    outcome: PregnancyOutcome;
    delivery_date?: string;      // defaults to today server-side if omitted
    increment_para?: boolean;    // default true
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a pregnancy episode is the active (ongoing) one.
 */
export function isActivePregnancy(pregnancy: PregnancySummary): boolean {
    return pregnancy.is_active;
}

/**
 * Returns true when a pregnancy has been closed with any outcome.
 */
export function isClosedPregnancy(pregnancy: PregnancySummary): boolean {
    return !pregnancy.is_active && pregnancy.outcome !== null;
}

/**
 * Human-readable label for a PregnancyOutcome value.
 */
export const PREGNANCY_OUTCOME_LABELS: Record<PregnancyOutcome, string> = {
    live_birth: 'Live Birth',
    stillbirth: 'Stillbirth',
    miscarriage: 'Miscarriage',
    abortion: 'Abortion',
    ectopic: 'Ectopic Pregnancy',
};

/**
 * Outcomes that increment `para` (count toward deliveries).
 */
export const PARA_INCREMENTING_OUTCOMES: ReadonlySet<PregnancyOutcome> = new Set([
    'live_birth',
    'stillbirth',
]);