/**
 * Child types.
 *
 * Changes from original:
 * - [BUG FIX]  Child.mother_id removed as the primary identifier.
 *              Primary FK is now pregnancy_id (Child → Pregnancy).
 *              mother_id is retained as an OPTIONAL convenience field,
 *              resolved server-side via pregnancy.patient_id.
 *              Never use mother_id to look up children — use pregnancy_id.
 */

// ---------------------------------------------------------------------------
// Response shape
// ---------------------------------------------------------------------------

export interface Child {
  id: string;

  /** Primary FK: the Pregnancy episode this child belongs to. */
  pregnancy_id: string;

  /**
   * Convenience field: the mother's patient_id, resolved server-side.
   * Present in responses but NOT a stored column — do not send in requests.
   * Use pregnancy_id for all queries and mutations.
   */
  mother_id: string | null;

  name: string | null;
  date_of_birth: string;           // ISO date string "YYYY-MM-DD"
  sex: 'male' | 'female' | null;
  notes: string | null;

  // Six-month follow-up
  six_month_checkup_date: string | null;
  six_month_checkup_completed: boolean;

  // Hep B antibody test
  hep_b_antibody_test_result: 'positive' | 'negative' | 'indeterminate' | 'pending' | null;
  test_date: string | null;

  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

/**
 * Payload for creating a child record.
 * Sent to POST /pregnancies/{pregnancy_id}/children.
 * `pregnancy_id` is injected from the URL path — omit from body.
 */
export interface CreateChildPayload {
  name?: string;
  date_of_birth: string;           // required — ISO date "YYYY-MM-DD"
  sex?: 'male' | 'female';
  notes?: string;
}

/**
 * Payload for updating monitoring fields on a child record.
 * Sent to PATCH /children/{child_id}.
 * All fields optional — only send what changed.
 */
export interface UpdateChildPayload {
  name?: string;
  sex?: 'male' | 'female';
  six_month_checkup_date?: string;
  six_month_checkup_completed?: boolean;
  hep_b_antibody_test_result?: 'positive' | 'negative' | 'indeterminate' | 'pending';
  test_date?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a child's six-month checkup is overdue.
 * "Overdue" = checkup date is in the past and not yet completed.
 */
export function isCheckupOverdue(child: Child): boolean {
  if (child.six_month_checkup_completed) return false;
  if (!child.six_month_checkup_date) return false;
  return new Date(child.six_month_checkup_date) < new Date();
}

/**
 * Returns the display name for a child, falling back gracefully.
 */
export function getChildDisplayName(child: Child): string {
  return child.name?.trim() || 'Unnamed child';
}
