export type Consultation = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  categories: string[];
  experience: string;
  is_online: boolean;
  location: string | null;
  contact_methods: string[];
  availability: string[];
  images?: string[] | string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type ConsultationOrder = {
  id: string;
  consultation_id: string;
  client_id: string;
  expert_id: string;
  status: 'pending' | 'pending_payment' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  is_client_confirmed: boolean;
  is_expert_confirmed: boolean;
  is_completed: boolean;
  date: string;
  time: string;
  contact_method: string;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  price: number;
  amount: number;
  is_online: boolean;
  is_paid: boolean;
  location?: string | null;
  consultations?: Consultation;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type ConsultationWithProfile = Consultation & {
  profiles: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};
