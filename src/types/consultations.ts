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
  contact_methods?: string[];
  created_at: string;
  updated_at: string;
  images?: string[]; // Dodajemy obsługę obrazów
  profiles?: {
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
  status: string;
  price: number;
  amount: number;
  date: string;
  time: string;
  contact_method?: string;
  is_paid: boolean;
  is_completed: boolean;
  is_client_confirmed?: boolean;
  is_expert_confirmed?: boolean;
  is_online: boolean;
  location: string;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
  consultations?: Consultation;
  profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface ConsultationRating {
  id: string;
  consultation_id: string;
  order_id: string;
  client_id: string;
  expert_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ConsultationCardProps {
  consultation: Consultation;
  isFavorite: boolean;
  isOwner?: boolean;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
}
