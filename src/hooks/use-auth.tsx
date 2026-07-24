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

    // Listen for auth state changes
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setLoading(false);
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
