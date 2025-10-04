"use client";
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// We lazy‑init the browser Supabase client so a missing env var fails at runtime
// in the browser (clearly) instead of crashing the Vercel build during prerender.
// Use `getBrowserSupabase()` inside client components only.

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Log only in the browser to avoid noisy server logs during build.
    if (typeof window !== 'undefined') {
      console.error('Supabase URL or Anon key is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.');
    }
    throw new Error('Missing Supabase public environment variables');
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

// Do not export a pre-initialized client; always call getBrowserSupabase() inside client components.
