
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';

// Configuração de Proxy ou Direta dependendo do ambiente
const isBrowser = typeof window !== 'undefined';
const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : (isBrowser && (window.location.hostname === 'localhost' || window.location.hostname.includes('.run.app')));

const SUPABASE_ENDPOINT = (isBrowser && (window.location.hostname.includes('.run.app') || window.location.hostname === 'localhost')) 
  ? `${window.location.origin}/api/sb-api` 
  : SUPABASE_URL;

console.log(`[SUPABASE_INIT] Usando endpoint: ${SUPABASE_ENDPOINT}`);

export const supabase = createClient(SUPABASE_ENDPOINT, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
    storage: isBrowser ? window.localStorage : undefined
  },
  global: {
    headers: { 'x-client-info': 'libido-applet-2026' }
  }
});

export default supabase;
