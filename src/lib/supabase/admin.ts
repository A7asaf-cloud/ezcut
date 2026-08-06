import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — SERVER ONLY. Bypasses RLS, so it must never be
// imported from a Client Component or shipped to the browser. Used only to
// fetch the two uploaded images so they can be handed to Gemini.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
