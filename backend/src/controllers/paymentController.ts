import { Request, Response } from 'express';
import crypto from 'crypto';
import { createPixPayment, verifyPayment } from '../services/pagbank.js';
import { isValidCPF, normalizeCPF } from '../utils/cpf.js';

const getPaidAmount = (orderData: any): number | null => {
  const amountValue = orderData?.charges?.[0]?.amount?.value;

  if (
    typeof amountValue !== 'number' ||
    !Number.isInteger(amountValue) ||
    amountValue <= 0
  ) {
    return null;
  }

  return amountValue / 100;
};

const getOrderStatus = (orderData: any): string | undefined => {
  return orderData?.charges?.[0]?.status || orderData?.status;
};

export const createPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const authUser = (req as any).user;

    if (!authUser?.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.'
      });
    }

    const userId = authUser.id;
    const { customerTaxId } = req.body;
    const normalizedTaxId = normalizeCPF(customerTaxId);

    if (!normalizedTaxId || !isValidCPF(normalizedTaxId)) {
      return res.status(400).json({
        error: 'CPF inválido.'
      });
    }

    const pixData = await createPixPayment(userId, normalizedTaxId);

    const { getAdminSupabase } =
      await import('../config/supabase.js');

    const supabase = getAdminSupabase();

    const { error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        payment_id: pixData.paymentId,
        provider: 'pagbank',
        status: 'WAITING',
        amount: pixData.amount
      });

    if (error) {
      console.error('Erro ao registrar transação:', error);

      return res.status(500).json({
        error: 'Erro interno ao registrar transação.'
      });
    }

    return res.status(200).json(pixData);
  } catch (error: any) {
    if (error && error.response && error.response.status) { const dados = error.response.data || {}; const lista = Array.isArray(dados.error_messages) ? dados.error_messages : []; const safeErrors = lista.map((e: any) => ({ code: e && e.code, error: e && e.error, description: e && e.description, parameter_name: e && e.parameter_name })); console.error('PAGBANK_REQUEST_ERROR', { status: error.response.status, errors: safeErrors }); } console.error('Erro em createPayment:', error.message);

    return res.status(500).json({
      error: 'Erro interno ao criar pagamento.'
    });
  }
};

export const pagbankWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    const authHeader = req.headers['x-authenticity-token'];

    const { config } =
      await import('../config/env.js');

    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      console.error('PAGBANK WEBHOOK WITHOUT RAW BODY');

      return res.status(401).send('Unauthorized');
    }

    /*
      A assinatura é obrigatória SEMPRE, em qualquer ambiente.
      Não dependemos de NODE_ENV: se a variável não estiver
      configurada, o webhook continua rejeitando requisições
      sem assinatura.
    */
    if (!authHeader) {
      console.error('PAGBANK SIGNATURE MISSING');

      return res.status(401).send('Unauthorized');
    }

    const signature = Array.isArray(authHeader)
      ? authHeader[0]
      : authHeader;

    const rawPayload = Buffer.isBuffer(rawBody)
      ? rawBody.toString('utf8')
      : String(rawBody);

    const expectedSignature = crypto
      .createHash('sha256')
      .update(config.PAGBANK_TOKEN + '-' + rawPayload)
      .digest('hex');

    const expectedBuffer =
      Buffer.from(expectedSignature, 'utf8');

    const actualBuffer =
      Buffer.from(signature, 'utf8');

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      console.error('PAGBANK SIGNATURE INVALID');

      return res.status(401).send('Unauthorized');
    }

    const payload = req.body;
    const orderId = payload?.id;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(200).send('Ignorado');
    }

    /*
      O corpo do webhook nunca é suficiente para ativar Premium.
      A ordem é consultada diretamente na API autenticada do PagBank.
    */
    const orderData = await verifyPayment(orderId);

    if (!orderData) {
      console.error('PAGBANK FRAUD_ALERT: ordem nao encontrada ' + orderId);

      return res.status(200).send('OK');
    }

    const status = getOrderStatus(orderData);

    if (status !== 'PAID') {
      return res.status(200).send('OK');
    }

    const referenceId = String(orderData.reference_id || '');
    const referenceParts = referenceId.split('_');
    const userId = referenceParts[1];

    if (
      referenceParts.length < 3 ||
      referenceParts[0] !== 'libido-premium' ||
      !userId
    ) {
      console.error('PAGBANK FRAUD_ALERT: referencia invalida ' + referenceId);

      return res.status(200).send('OK');
    }

    const amountPaid = getPaidAmount(orderData);

    if (amountPaid === null) {
      console.error('PAGBANK FRAUD_ALERT: valor invalido ' + orderId);

      return res.status(200).send('OK');
    }

    /*
      Valor divergente do preco registrado e sinal de fraude:
      retorna 200 (sem retry infinito do PagBank), nao ativa
      Premium e registra alerta de fraude no log.
    */
    if (Math.round(amountPaid * 100) !== config.PREMIUM_PRICE_CENTS) {
      console.error(
        'PAGBANK FRAUD_ALERT: valor divergente ' + orderId + ' pago=' + amountPaid
      );

      return res.status(200).send('OK');
    }

    const { getAdminSupabase } =
      await import('../config/supabase.js');

    const supabase = getAdminSupabase();

    /*
      O RPC confirma no banco:
      - transação existente;
      - mesmo usuário;
      - mesmo provedor;
      - mesmo valor;
      - processamento idempotente.
    */
    const { data, error } = await supabase.rpc(
      'process_payment',
      {
        p_user_id: userId,
        p_payment_id: orderId,
        p_provider: 'pagbank',
        p_status: 'PAID',
        p_amount: amountPaid
      }
    );

    if (error) {
      const message = String(
        (error as any)?.message || error
      );

      /*
        Rejeicao de regra de negocio (ex.: valor invalido)
        nao e erro transitorio: nao deve gerar retry infinito.
      */
      if (message.toLowerCase().includes('valor')) {
        console.error(
          'PAGBANK FRAUD_ALERT: rejeitado pelo banco ' + orderId + ' - ' + message
        );

        return res.status(200).send('OK');
      }

      console.error('Erro processando pagamento:', error);

      return res.status(500).send('Internal Server Error');
    }

    if (!data) {
      console.log('Pagamento ignorado ou duplicado: ' + orderId);

      return res.status(200).send('OK');
    }

    console.log('Pagamento confirmado pelo webhook: ' + orderId);

    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('Erro processando webhook:', error.message);

    return res.status(500).send('Internal Server Error');
  }
};

export const getPaymentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const authUser = (req as any).user;

    if (!authUser?.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.'
      });
    }

    const userId = authUser.id;
    const { paymentId } = req.params;

    const { getAdminSupabase } =
      await import('../config/supabase.js');

    const supabase = getAdminSupabase();

    /*
      Esta rota NÃO consulta mais o PagBank e NÃO ativa Premium.
      Ela apenas informa o status já confirmado pelo webhook e salvo no banco.
    */
    const { data: tx, error } = await supabase
      .from('payment_transactions')
      .select('status, user_id')
      .eq('payment_id', paymentId)
      .eq('provider', 'pagbank')
      .single();

    if (error || !tx) {
      return res.status(404).json({
        error: 'Transação não encontrada.'
      });
    }

    if (tx.user_id !== userId) {
      return res.status(403).json({
        error: 'Não autorizado.'
      });
    }

    return res.status(200).json({
      paymentId,
      status: tx.status,
      isPremium: tx.status === 'PAID',
      expirationDate: null
    });
  } catch (error: any) {
    console.error('Erro em getPaymentStatus:', error.message);

    return res.status(500).json({
      error: 'Erro interno.'
    });
  }
};
