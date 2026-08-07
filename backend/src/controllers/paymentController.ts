import { Request, Response } from 'express';
import { createPixPayment, verifyPayment } from '../services/pagbank.js';
import crypto from 'crypto';
import { isValidCPF, normalizeCPF } from '../utils/cpf.js';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const userId = authUser.id;
    const { customerTaxId } = req.body;
    const normalizedTaxId = normalizeCPF(customerTaxId);
    if (!normalizedTaxId || !isValidCPF(normalizedTaxId)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    const pixData = await createPixPayment(userId, normalizedTaxId);
    
    // Registrar transação como WAITING
    const { getAdminSupabase } = await import('../config/supabase.js');
    const supabase = getAdminSupabase();
    
    const { error } = await supabase.from('payment_transactions').insert({
      user_id: userId,
      payment_id: pixData.paymentId,
      provider: 'pagbank',
      status: 'WAITING',
      amount: pixData.amount
    });

    if (error) {
      console.error('Erro ao registrar transação:', error);
      return res.status(500).json({ error: 'Erro interno ao registrar transação' });
    }

    return res.status(200).json(pixData);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      let sanitizedErrors: any = undefined;
      if (data && Array.isArray(data.error_messages)) {
        sanitizedErrors = data.error_messages.map((msg: any) => ({
          code: msg.code,
          error: msg.error,
          description: msg.description,
          parameter_name: msg.parameter_name
        }));
      } else if (data) {
        sanitizedErrors = {
          properties: Object.keys(data),
          message: data.message || error.message
        };
      }

      console.error("PAGBANK_REQUEST_ERROR", {
        status,
        errors: sanitizedErrors,
      });
    } else {
      console.error('Erro em createPayment:', error.message);
    }
    return res.status(500).json({ error: 'Erro interno ao criar pagamento' });
  }
};

export const pagbankWebhook = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['x-authenticity-token'];
    const { config } = await import('../config/env.js');
    
    const rawBody = (req as any).rawBody;
    if (!rawBody || !authHeader) {
      return res.status(401).send('Unauthorized');
    }

    const expectedSignature = crypto.createHash('sha256').update(`${config.PAGBANK_TOKEN}-${rawBody}`).digest('hex');
    
    // Safe compare
    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(authHeader as string);
    
    if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
      return res.status(401).send('Unauthorized');
    }

    const payload = req.body;
    
    const orderId = payload.id;
    if (!orderId) {
      return res.status(200).send('Ignorado');
    }

    // Verify status directly with PagBank
    const orderData = await verifyPayment(orderId);
    if (!orderData) {
      return res.status(400).send('Invalid Order');
    }
    
    const status = orderData.charges?.[0]?.status || orderData.status;

    if (status === 'PAID') {
      const { getAdminSupabase } = await import('../config/supabase.js');
      const supabase = getAdminSupabase();
      
      const referenceId = orderData.reference_id || "";
      const userId = referenceId.split('_')[1];
      
      if (!userId) {
        return res.status(400).send('Missing userId');
      }

      const amountPaid = orderData.charges?.[0]?.amount?.value ? orderData.charges[0].amount.value / 100 : 19.90;

      // Audit payment with RPC to ensure idempotent behavior
      const { data: processed, error } = await supabase.rpc('process_payment', {
        p_user_id: userId,
        p_payment_id: orderId,
        p_provider: 'pagbank',
        p_status: 'PAID',
        p_amount: amountPaid
      });
      
      if (error) {
        console.error('Erro ao processar pagamento no webhook:', error);
      } else if (processed === false) {
        console.log(`Pagamento ignorado ou duplicado: ${orderId}`);
      } else {
        console.log(`Webhook processado com sucesso: ${orderId}`);
      }
    }
    
    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('Erro processando webhook:', error.message);
    return res.status(500).send('Internal Server Error');
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const userId = authUser.id;
    const { paymentId } = req.params;

    const { getAdminSupabase } = await import('../config/supabase.js');
    const supabase = getAdminSupabase();

    const { data: tx, error } = await supabase
      .from('payment_transactions')
      .select('status, user_id')
      .eq('payment_id', paymentId)
      .eq('provider', 'pagbank')
      .single();

    if (error || !tx) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    if (tx.user_id !== userId) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    let finalStatus = tx.status;

    // Check with PagBank directly if still waiting in our DB
    if (finalStatus === 'WAITING') {
      const orderData = await verifyPayment(paymentId);
      if (orderData) {
        const pagbankStatus = orderData.charges?.[0]?.status || orderData.status;
        if (pagbankStatus === 'PAID') {
          finalStatus = 'PAID';
          const amountPaid = orderData.charges?.[0]?.amount?.value ? orderData.charges[0].amount.value / 100 : 19.90;
          
          await supabase.rpc('process_payment', {
            p_user_id: userId,
            p_payment_id: paymentId,
            p_provider: 'pagbank',
            p_status: 'PAID',
            p_amount: amountPaid
          });
        }
      }
    }

    return res.status(200).json({
      paymentId,
      status: finalStatus,
      isPremium: finalStatus === 'PAID',
      expirationDate: null
    });
  } catch (error: any) {
    console.error('Erro em getPaymentStatus:', error.message);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
