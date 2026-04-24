
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';

// Configuração de Proxy ou Direta dependendo do ambiente
const isBrowser = typeof window !== 'undefined';
const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : (isBrowser && window.location.hostname === 'localhost' || window.location.hostname.includes('ais-dev'));

// Em produção (Vercel/Cloud Run), usamos a URL direta para evitar dependência do servidor Express para banco de dados
// Em desenvolvimento, usamos o proxy para evitar erros de CORS chatos
const SUPABASE_ENDPOINT = isDev ? (isBrowser ? `${window.location.origin}/api/sb-api` : SUPABASE_URL) : SUPABASE_URL;

console.log(`[SUPABASE_INIT] Mode: ${isDev ? 'DEV (Proxy)' : 'PROD (Direct)'}, URL: ${SUPABASE_ENDPOINT}`);

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
