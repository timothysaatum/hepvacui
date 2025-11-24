export interface Role {
  id: number;
  name: string;
}

export interface Facility {
  id: string;
  facility_name: string;
  address: string;
  phone: string;
  email: string;
}

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
}

export interface UserWithToken extends User {
  access_token: string;
}

export interface CreateUserPayload {
  username: string;
  full_name: string;
  phone: string;
  email: string;
  password: string;
  password_confirm: string;
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