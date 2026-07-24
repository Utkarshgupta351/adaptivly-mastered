/**
 * Session helpers — validate JWT tokens from request headers/cookies.
 * Used inside server functions to identify the calling user.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["SUPABASE_URL"]!;
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"]!;

/**
 * Extract the bearer token from a raw Authorization header value.
 */
function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
}

/**
 * Validate an access token and return the user's UUID.
 * Returns null if the token is missing or invalid.
 */
export async function getUserId(accessToken: string | null): Promise<string | null> {
  if (!accessToken) return null;
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

/**
 * Same as getUserId but throws a 401 if not authenticated.
 * Use inside server functions that require authentication.
 */
export async function requireUserId(accessToken: string | null): Promise<string> {
  const userId = await getUserId(accessToken);
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

export { extractToken };
