export interface Vaccine {
  id: string;
  vaccine_name: string;
  price_per_dose: number;
  quantity: number;
  batch_number: string;
  is_published: boolean;
  added_by_id: string;
  created_at: string;
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
  added_by_id: string;
  is_published?: boolean;
}

export interface UpdateVaccinePayload {
  vaccine_name?: string;
  price_per_dose?: number;
  quantity?: number;
  batch_number?: string;
  is_published?: boolean;
}

export interface AddStockPayload {
  quantity_to_add: number;
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