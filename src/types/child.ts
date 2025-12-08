export interface Child {
  id: string;
  mother_id: string;
  name: string | null;
  date_of_birth: string;
  sex: 'male' | 'female' | null;
  six_month_checkup_date: string | null;
  six_month_checkup_completed: boolean;
  hep_b_antibody_test_result: string | null;
  test_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateChildPayload {
  name?: string;
  date_of_birth: string;
  sex?: 'male' | 'female';
  notes?: string;
}

export interface UpdateChildPayload {
  name?: string;
  sex?: 'male' | 'female';
  six_month_checkup_date?: string;
  six_month_checkup_completed?: boolean;
  hep_b_antibody_test_result?: string;
  test_date?: string;
  notes?: string;
}