import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (only use service key on the server!)
// Define SUPABASE_SERVICE_ROLE (never expose to client) and NEXT_PUBLIC_SUPABASE_URL in .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

export function createServerClient() {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
