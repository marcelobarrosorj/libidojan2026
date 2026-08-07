import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLIC_CONFIG } from "../config/supabasePublic";

export const supabase = createClient(
  SUPABASE_PUBLIC_CONFIG.url,
  SUPABASE_PUBLIC_CONFIG.publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
