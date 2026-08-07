import { supabase } from './supabase';

export interface PremiumState {
  isPremium: boolean;
  plan: "free" | "premium";
  expiresAt?: number;
}

export const getPremiumState = async (userId?: string): Promise<PremiumState> => {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('premium, plan')
        .eq('user_id', userId)
        .single();
        
      if (!error && data) {
        const isPremium = data.plan === 'premium' || data.premium === true;
        return { isPremium, plan: isPremium ? "premium" : "free" };
      }
    } catch (e) {
      console.error('Error fetching premium state from supabase', e);
    }
  }
  return { isPremium: false, plan: "free" };
};
