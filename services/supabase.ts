import { createClient } from '@supabase/supabase-js';

// Fallback URL (Project: hkuwlazwtxwfffnpgfdd)
const DEFAULT_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const DEFAULT_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';

const isBrowser = typeof window !== 'undefined';

// Helper to get env safe in both environments, prioritizing Vite in browser
const getEnv = (key: string, fallback: string) => {
    // 1. Try Vite import.meta.env (Client-side standard)
    const viteKey = `VITE_${key}`;
    if (typeof import.meta.env !== 'undefined' && import.meta.env[viteKey]) {
        return import.meta.env[viteKey];
    }
    
    // 2. Try window config (Old tactical pattern)
    if (isBrowser && (window as any)._SUPABASE_CONFIG) {
        const val = (window as any)._SUPABASE_CONFIG[key] || (window as any)._SUPABASE_CONFIG[viteKey];
        if (val) return val;
    } 
    
    // 3. Try process.env (Server-side / Build-time)
    if (typeof process !== 'undefined' && process.env) {
        const val = process.env[key] || process.env[viteKey];
        if (val) return val;
    }

    return fallback;
};

const SUPABASE_URL = getEnv('SUPABASE_URL', DEFAULT_URL);
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', DEFAULT_KEY);

console.log(`[SUPABASE_INIT] Configurando Matriz em ${SUPABASE_URL.substring(0, 20)}...`);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
