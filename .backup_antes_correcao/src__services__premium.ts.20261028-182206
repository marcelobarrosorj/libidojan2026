import { supabase } from './supabase';

export interface PremiumState {
  isPremium: boolean;
  plan: "free" | "premium";
  expiresAt?: number;
}

export const checkUserPremium = async (userId?: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    const { data, error } = await supabase.rpc('check_user_premium', {
      uid: userId
    });

    if (error) {
      console.error('Erro ao verificar Premium:', error);
      return false;
    }

    return data === true;

  } catch (e) {
    console.error('Erro ao consultar Premium:', e);
    return false;
  }
};

export const getPremiumState = async (userId?: string): Promise<PremiumState> => {
  const isPremium = await checkUserPremium(userId);

  return {
    isPremium,
    plan: isPremium ? "premium" : "free"
  };
};