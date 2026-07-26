/**
 * useAuth hook — manages Supabase session state client-side.
 * Wraps Supabase Auth browser client. Session token is used
 * as the `token` argument to all server functions.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient, type Session, type User } from "@supabase/supabase-js";

// Browser-side Supabase client (uses ANON key — safe to expose)
const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string;

export const supabaseBrowser = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: { persistSession: true, autoRefreshToken: true },
});

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  token: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (including email confirmation callback)
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setLoading(false);

      // Auto-redirect to dashboard after email confirmation
      if (event === "SIGNED_IN" && session) {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace("#", "?"));
        const type = params.get("type");
        const onAuthPage = ["/verify-email", "/login", "/signup"].some(p =>
          window.location.pathname.startsWith(p)
        );
        if (type === "signup" || onAuthPage) {
          // Check if onboarding is done
          const { data: profile } = await supabaseBrowser
            .from("profiles")
            .select("onboarding_done")
            .eq("id", session.user.id)
            .maybeSingle();
          if (!profile?.onboarding_done) {
            window.location.href = "/onboarding";
          } else {
            window.location.href = "/dashboard";
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        token: session?.access_token ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
