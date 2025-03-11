
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
  created_at: string;
  updated_at: string;
  images?: string[] | string;
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
  completed_at?: string;
  created_at: string;
  updated_at: string;
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
