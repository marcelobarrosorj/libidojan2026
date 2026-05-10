import { createClient } from '@supabase/supabase-js';

// Fallback keys (Should be in .env in production)
const DEFAULT_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const DEFAULT_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';

const isBrowser = typeof window !== 'undefined';

// Helper to get env safe in both environments
const getEnv = (key: string, fallback: string) => {
    let val: string | undefined;
    if (isBrowser) {
        val = (window as any)._SUPABASE_CONFIG?.[key];
    } else {
        val = process.env[key];
    }
    // Garante que retorne o fallback se o valor for vazio ou não-string
    if (typeof val !== 'string' || val.trim() === '') {
        return fallback;
    }
    return val.trim();
};

const SUPABASE_URL = getEnv('SUPABASE_URL', DEFAULT_URL);
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', DEFAULT_KEY);

// Configuração de Proxy ou Direta dependendo do ambiente
const SUPABASE_ENDPOINT = SUPABASE_URL.startsWith('http') ? SUPABASE_URL : DEFAULT_URL;

console.log(`[SUPABASE_INIT] URL: ${SUPABASE_ENDPOINT} | Browser: ${isBrowser}`);

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
