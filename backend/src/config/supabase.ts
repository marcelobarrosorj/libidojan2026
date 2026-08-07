import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./env.js";

let supabaseInstance: SupabaseClient | null = null;

export const getAdminSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase credentials");
    }
    supabaseInstance = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }
  return supabaseInstance;
};
