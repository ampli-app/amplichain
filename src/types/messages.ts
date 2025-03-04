
export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  type: 'private' | 'marketplace';
  product_id: string | null;
  last_message_text: string | null;
  last_message_time: string | null;
  participants?: ConversationParticipant[];
  otherUser?: Profile;
  product?: Product;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
  unread_count: number;
  user?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  is_read: boolean;
  sender?: Profile;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  status?: 'online' | 'offline';
  last_active?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  location: string | null;
}

export interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  }
}

export interface Consultation {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  experience: string | null;
  categories: string[] | null;
  is_online: boolean | null;
  location: string | null;
  availability: string[] | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  }
}
