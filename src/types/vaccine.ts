export interface Vaccine {
  id: string;
  vaccine_name: string;
  price_per_dose: number;
  quantity: number;
  batch_number: string;
  is_published: boolean;
  added_by_id: string;
  created_at: string;

  // ── Fields added from API response (present in published vaccine list) ─────
  /**
   * quantity minus reserved_quantity.
   * Used by PurchaseVaccineModal to gate purchasing and show availability.
   * The backend computes this — never calculate it client-side.
   */
  available_quantity?: number;
  reserved_quantity?: number;
  /** Optional — not all vaccine endpoints return this. */
  description?: string | null;
  expiry_date?: string | null;
  low_stock_threshold?: number;
  updated_at?: string;
}

export interface VaccineStockInfo {
  id: string;
  vaccine_name: string;
  quantity: number;
  is_low_stock: boolean;
  reserved_quantity: number;
  available_quantity: number;
  batch_number: string;
}

export interface CreateVaccinePayload {
  vaccine_name: string;
  price_per_dose: number;
  quantity: number;
  batch_number: string;
  added_by_id?: string;
  is_published?: boolean;
}

export interface UpdateVaccinePayload {
  vaccine_name?: string;
  price_per_dose?: number;
  quantity?: number;
  batch_number?: string;
  is_published?: boolean;
  /** Optional fields used by newer vaccine management screens. */
  description?: string;
  expiry_date?: string;
  low_stock_threshold?: number;
}

/**
 * Your existing vaccineService.ts uses `quantity_to_add` — kept as-is.
 * The optional `quantity` alias is for forward compatibility only.
 */
export interface AddStockPayload {
  quantity_to_add: number;
  /** Alias used in newer service calls — do not use both in the same request. */
  quantity?: number;
}

export interface PublishVaccinePayload {
  is_published: boolean;
}

export interface PaginatedVaccines {
  items: Vaccine[];
  page_info: {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number;
    previous_page: number;
  };
}
