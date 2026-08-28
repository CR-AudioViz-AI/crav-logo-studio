/**
 * CR AudioViz AI - Supabase Client
 * =================================
 * 
 * Universal database client for CR AudioViz AI apps.
 * For authentication, credits, and central services, use:
 * 
 *   import { CentralServices, CentralAuth, CentralCredits } from './central-services';
 * 
 * This client is for app-specific database operations only.
 * Auth, payments, and credits should ALWAYS go through central services.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { secretKey, publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

// Re-export admin utilities from central services
// 2026-08-12: isAdmin / shouldChargeCredits / ADMIN_EMAILS are gone. Admin
// identity is decided server-side by the core against the authenticated
// session, never by a list kept in an app that also decides who pays.
export { CentralServices } from './central-services';

// Centralized Supabase configuration
// No fallbacks. A hardcoded project URL means a misconfigured deploy writes to
// production without anyone noticing.
const SUPABASE_URL = supabaseUrl();
const _missingUrl = !SUPABASE_URL;
const SUPABASE_ANON_KEY = publishableKey();
if (_missingUrl || !SUPABASE_ANON_KEY) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
  );
}

// Standard client for general use
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Browser client for auth (SSR-safe singleton pattern)
let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // Server-side: return new client each time
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  // Client-side: return singleton
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return browserClient;
}

// Server client for API routes
export function createSupabaseServerClient(): SupabaseClient {
  const serviceKey = secretKey();
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using anon key');
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return createClient(SUPABASE_URL, serviceKey);
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
export default supabase;
