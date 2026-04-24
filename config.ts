export const IS_PROD = typeof window !== 'undefined' && 
  (window.location.hostname.includes('libidoapp.com.br'));

export const CONFIG = {
  // Backend - Usa caminhos relativos para garantir que as buscas internas funcionem no mesmo host
  API_BASE_URL: '',
  
  // URL de Origem do App para validação de integridade (mantido para compatibilidade)
  APP_URL: typeof window !== 'undefined' ? window.location.origin : 'https://libidoapp.com.br',
  
  // Stripe Public Key (Produção)
  STRIPE_PK: 'pk_live_51RsspgEqSklIuetZT3UOXocxXkYCTYKTznCnN6ciw1r6sghZmfkZD8gEzZ0tIUXwjdUDVaGIRxr9ZkCN5d5LeX7H00ZRa4BkE6',
  
  // Supabase Real-time Database
  SUPABASE_URL: 'https://hkuwlazwtxwfffnpgfdd.supabase.co',
  
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