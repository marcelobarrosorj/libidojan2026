export const IS_PROD = typeof window !== 'undefined' && 
  !window.location.hostname.includes('localhost') && 
  !window.location.hostname.includes('stackblitz');

export const CONFIG = {
  // Backend Vercel Principal - Sincronizado com a Matriz Libido 2026
  API_BASE_URL: 'https://marcelobarrosorj-libido2026-a6w0g3p0s.vercel.app',
  
  // URL de Origem do App para validação de integridade
  APP_URL: 'https://libidoapp.com.br',
  
  // Stripe Public Key (Produção)
  STRIPE_PK: 'pk_live_51RsspgEqSklIuetZT3UOXocxXkYCTYKTznCnN6ciw1r6sghZmfkZD8gEzZ0tIUXwjdUDVaGIRxr9ZkCN5d5LeX7H00ZRa4BkE6',
  
  // Supabase Real-time Database
  SUPABASE_URL: 'https://flljtgfsoikwueszhhhv.supabase.co',
  
  // Suporte Técnico Oficial
  SUPPORT_EMAIL: 'libidoapp@gmail.com',
  
  // Repositório de Sincronização de Código (GitHub Oficial)
  REPO_URL: 'https://github.com/marcelobarrosorj/libido2026',

  // Flags de Controle de Ambiente
  DEBUG_MODE: !IS_PROD,
  USE_INTERNAL_SIMULATOR: !IS_PROD,
  USE_SIMULATOR: !IS_PROD
};

export const IS_PRODUCTION = IS_PROD;

export default CONFIG;