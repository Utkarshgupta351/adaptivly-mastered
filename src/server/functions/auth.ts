/**
 * Auth server functions — sign up, sign in, sign out, forgot password.
 * Uses Supabase Auth under the hood.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getAuthClient() {
  return createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_ANON_KEY"]!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
});

export const signUp = createServerFn({ method: "POST" })
  .validator((data: unknown) => signUpSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getAuthClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    });
    if (error) throw new Error(error.message);
    return {
      user: authData.user,
      session: authData.session,
      requiresEmailConfirmation: !authData.session,
    };
  });

// ─── Sign In ──────────────────────────────────────────────────────────────────
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signIn = createServerFn({ method: "POST" })
  .validator((data: unknown) => signInSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getAuthClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return {
      user: authData.user,
      session: authData.session,
    };
  });

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export const signOut = createServerFn({ method: "POST" })
  .handler(async () => {
    // Client-side Supabase handles actual token removal; this is a no-op server ack
    return { success: true };
  });

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({ email: z.string().email() });

export const forgotPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => forgotPasswordSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getAuthClient();
    const redirectTo = `${process.env["APP_URL"] ?? "http://localhost:3000"}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo });
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getProfileSchema = z.object({ token: z.string() });

export const getProfile = createServerFn({ method: "GET" })
  .validator((data: unknown) => getProfileSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });
