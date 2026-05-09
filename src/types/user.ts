
export interface Role {
  id: number;
  name: string;
}

/** Type alias so new code can use either name without breaking old imports. */
export type UserRole = Role;

export interface Facility {
  id: string;
  facility_name: string;
  address: string;
  phone: string;
  email: string;
}

/**
 * Compact facility reference used in patient responses.
 * Same shape as Facility but only the fields the patient API returns.
 */
export type FacilityRef = Pick<Facility, 'id' | 'facility_name'>;

export interface User {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_suspended: boolean;
  roles: Role[];
  facility: Facility;
  created_at: string;
  updated_at: string;

  // ── Optional fields present in some API responses ─────────────────────────
  /** Set on soft-deleted accounts. */
  is_deleted?: boolean;
  /**
   * Populated when the user manages a facility different from their own
   * (e.g. a facility manager role). Used by getUserFacilityId().
   */
  managed_facility?: Facility | null;
  /** Last successful login timestamp. */
  last_login_at?: string | null;
}

export interface UserWithToken extends User {
  access_token: string;
  /** e.g. "bearer" — included in some token responses. */
  token_type?: string;
}

export interface CreateUserPayload {
  username: string;
  full_name: string;
  phone: string;
  email: string;
  password: string;
  password_confirm: string;
  facility_id?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UpdateUserPayload {
  username?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  is_suspended?: boolean;
}

export interface PageInfo {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number;
  previous_page: number;
}

export interface PaginatedUsers {
  items: User[];
  page_info: PageInfo;
}

// ── Helper functions (new — safe to add, don't affect existing imports) ───────

export function hasRole(user: User, roleName: string): boolean {
  return user.roles.some((r) => r.name === roleName);
}

export function isAdmin(user: User): boolean {
  return hasRole(user, 'admin') || hasRole(user, 'super_admin');
}

export function isStaff(user: User): boolean {
  return hasRole(user, 'staff') || isAdmin(user);
}

/**
 * Returns the facility ID for a user, checking both facility and
 * managed_facility so callers don't need to handle both cases.
 */
export function getUserFacilityId(user: User): string | null {
  return user.facility?.id ?? user.managed_facility?.id ?? null;
}
