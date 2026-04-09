import { createClient } from '@supabase/supabase-js'
import { CONFIG } from '../config'

export const supabase = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)
