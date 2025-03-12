
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
}

export interface User extends SupabaseUser {
  user_metadata: UserMetadata;
}
