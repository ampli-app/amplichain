
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://csaxvhtbaksjaecogeii.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXh2aHRiYWtzamFlY29nZWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1OTEzMzYsImV4cCI6MjA1NjE2NzMzNn0.zY3mwJ_eVSFrU_9Cq6gsZ-_xL9xYariwIUhGAhDj7H8";

// Tworzymy klienta Supabase z opcją persistSession ustawioną na true oraz localStorage jako storage
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  {
    auth: {
      persistSession: true,
      storage: localStorage, // Użyj localStorage do przechowywania sesji
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);

// Dodatkowe debugowanie, aby zobaczyć czy sesja jest przechowywana
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  console.log('Session present:', !!session);
});
