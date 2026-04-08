export const IS_PROD = typeof window !== 'undefined' &&
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('stackblitz');

export const CONFIG = {
  API_BASE_URL: 'https://marcelobarrosorj-libido2026-a6w0g3p0s.vercel.app',
  APP_URL: 'https://libidoapp.com.br',
  STRIPE_PK: 'pk_live_51RsspgEqSklIuetZT3UOXocxXkYCTYKTznCnN6ciw1r6sghZmfkZD8gEzZ0tIUXwjdUDVaGIRxr9ZkCN5d5LeX7H00ZRa4BkE6',

  // ✅ SUPABASE CORRIGIDO
  SUPABASE_URL: 'https://hkuwlazwtxwfffnpgfdd.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  SUPPORT_EMAIL: 'libidoapp@gmail.com',
  REPO_URL: 'https://github.com/marcelobarrosorj/libido2026',

  DEBUG_MODE: !IS_PROD,
  USE_INTERNAL_SIMULATOR: !IS_PROD,
  USE_SIMULATOR: !IS_PROD
};

export const IS_PRODUCTION = IS_PROD;
export default CONFIG;
