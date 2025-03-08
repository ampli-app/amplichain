
export interface Consultation {
  id: string;
  title: string;
  description: string;
  price: number;
  experience: string;
  location: string;
  is_online: boolean;
  availability: string[];
  categories: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
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
  client_id: string;
  expert_id: string;
  status: 'pending' | 'completed' | 'cancelled';
  amount: number;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
}
