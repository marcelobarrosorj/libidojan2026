import { Plan } from '../types';
import { log, cache } from './authUtils';
import { CONFIG } from '../config';

const PRICES_CENTS = {
  'Assinar Plano Mensal': 4990,
  'Assinar Plano Semestral': 26946,
  'Assinar Plano Anual': 47904
};

/**
 * Cria uma sessão de checkout para assinatura recorrente
 */
export async function createPaymentIntent(plan: Plan | string, method: 'card' | 'pix' = 'card') {
  log('info', `[GATEWAY] Tentando processar: ${plan} via ${method}`);

  // Se estiver em modo simulador (dev/preview), usa mock
  if (CONFIG.USE_INTERNAL_SIMULATOR) {
    log('info', '[GATEWAY] Usando simulador interno');
    await new Promise(r => setTimeout(r, 800));
    return {
      id: `pi_sim_${Date.now()}`,
      status: 'pending',
      clientSecret: 'simulated_secret',
      amount: (PRICES_CENTS[plan as keyof typeof PRICES_CENTS] || 4990) / 100,
    };
  }

  try {
    const response = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: cache.userData?.id,
        email: cache.userData?.nickname + "@libido.app" || "user@libido2026.com",
        plan: plan.toLowerCase().includes('mensal') ? 'mensal' : 
              plan.toLowerCase().includes('semestral') ? 'semestral' : 'anual'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ${response.status}`);
    }

    const data = await response.json();
    log('info', '[GATEWAY] Sessão criada com sucesso', data);
    return data;

  } catch (error: any) {
    log('warn', '[GATEWAY] Falha na conexão com o servidor. Ativando simulador.', error);
    await new Promise(r => setTimeout(r, 1000));
    
    // Fallback para simulador
    return {
      id: `pi_sim_${Date.now()}`,
      status: 'pending',
      clientSecret: 'simulated_secret',
      amount: (PRICES_CENTS[plan as keyof typeof PRICES_CENTS] || 4990) / 100,
    };
  }
}
