import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAGBANK_TOKEN',
  'PAGBANK_API_URL',
  'PAGBANK_WEBHOOK_URL',
  'PREMIUM_PRICE_CENTS'
];

export const getBackendAvailability = () => {
  return requiredEnvs.every(env => !!process.env[env]);
};

export const validateProductionEnvironment = () => {
  // Empty, no longer throws on startup. Validation is checked by getBackendAvailability in the app router.
};

export const config = {
  get SUPABASE_URL() { return process.env.SUPABASE_URL as string; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY as string; },
  get PAGBANK_TOKEN() { return process.env.PAGBANK_TOKEN as string; },
  get PAGBANK_API_URL() { return process.env.PAGBANK_API_URL || 'https://sandbox.api.pagseguro.com'; },
  get PAGBANK_WEBHOOK_URL() { return process.env.PAGBANK_WEBHOOK_URL as string; },
  get PREMIUM_PRICE_CENTS() { return parseInt(process.env.PREMIUM_PRICE_CENTS || '1990', 10); },
  get BASE_URL() { return process.env.BASE_URL || 'http://localhost:3000'; },
  get PORT() { return process.env.PORT || 3000; },
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; }
};
