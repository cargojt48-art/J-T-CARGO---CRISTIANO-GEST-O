import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qqgjjztilgpenbhiygwo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_iPkjcIn4QShuBbcaTivDIg_NM1E36zP';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseKey !== 'SUA_ANON_KEY_DO_SUPABASE_AQUI' &&
  !supabaseKey.startsWith('COLE_')
);

// Create single Supabase client instance
export const supabase = createClient(
  supabaseUrl,
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
