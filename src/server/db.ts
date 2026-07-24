/**
 * Supabase client — server-side only.
 * Uses the SERVICE_KEY (bypasses RLS) for trusted server operations.
 * Never import this in client-side code.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseServiceKey = process.env["SUPABASE_SERVICE_KEY"];

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables. " +
    "Copy .env.example to .env and fill in your Supabase credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Create an RLS-scoped client for a specific authenticated user.
 * Use this when you want Supabase RLS to enforce row-level access.
 */
export function createUserClient(accessToken: string) {
  return createClient(supabaseUrl!, process.env["SUPABASE_ANON_KEY"]!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type { SupabaseClient } from "@supabase/supabase-js";
