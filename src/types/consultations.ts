
export interface Consultation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  categories: string[];
  experience: string;
  availability: string[];
  is_online: boolean;
  location: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface ConsultationOrder {
  id: string;
  consultation_id: string;
  user_id: string;
  expert_id: string;
  status: string;
  price: number;
  date: string;
  time: string;
  is_paid: boolean;
  is_online: boolean;
  location: string;
  created_at: string;
}
