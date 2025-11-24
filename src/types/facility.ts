export interface Facility {
  id: string;
  facility_name: string;
  phone: string;
  email: string;
  address: string;
  facility_manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFacilityPayload {
  facility_name: string;
  phone: string;
  email: string;
  address: string;
}

export interface UpdateFacilityPayload {
  facility_name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PaginatedFacilities {
  items: Facility[];
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