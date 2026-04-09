import { Plan } from '../types';
import { log, cache } from './authUtils';
import { CONFIG } from '../config';

/**
 * Cria sessão de checkout usando o endpoint correto
 */
export async function createPaymentIntent(plan: Plan | string) {
  log('info', `[GATEWAY] Iniciando checkout para plano: ${plan}`);

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
    log('error', '[GATEWAY] Falha ao criar checkout', error);
    throw error; // Não faz fallback para simulador aqui - queremos ver o erro real
  }
}
