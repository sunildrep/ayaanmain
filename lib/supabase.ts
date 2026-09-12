import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser / anon operations (signIn, signUp)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Admin client for server-side operations (createUser, verify, etc.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Helper to get email from username for admins (username -> email)
export function usernameToEmail(username: string): string {
  const map: Record<string, string> = {
    admin: "admin@ayaaninstitute.in",
    finance: "finance@ayaaninstitute.in",
    admissions: "admissions@ayaaninstitute.in",
  };
  if (map[username]) return map[username];
  // if already email, return as is
  if (username.includes("@")) return username.toLowerCase();
  return `${username}@ayaaninstitute.in`;
}

// Verify Supabase JWT and get user
export async function verifySupabaseToken(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}
