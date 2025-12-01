import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase credentials will be loaded from environment variables
// The app gracefully falls back to default data if credentials are unavailable

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Test connection function - silently checks if Supabase is available
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('player_stats').select('count').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
}