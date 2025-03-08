
export interface Consultation {
  id: string;
  title: string;
  price: number;
  description?: string;
  categories?: string[];
  experience?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_online?: boolean;
  location?: string;
  availability?: any[];
}
