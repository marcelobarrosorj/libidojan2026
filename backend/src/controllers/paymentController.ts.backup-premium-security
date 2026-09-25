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

    const pixData = await createPixPayment(
      userId,
      normalizedTaxId
    );

    const { getAdminSupabase } =
      await import('../config/supabase.js');

    const supabase = getAdminSupabase();

    const { error } =
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          payment_id: pixData.paymentId,
          provider: 'pagbank',
          status: 'WAITING',
          amount: pixData.amount
        });

    if (error) {
      console.error(
        'Erro ao registrar transação:',
        error
      );

      return res.status(500).json({
        error: 'Erro interno ao registrar transação.'
      });
    }

    return res.status(200).json(pixData);

  } catch (error: any) {
    console.error(
      'Erro em createPayment:',
      error.message
    );

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
    const authHeader =
      req.headers['x-authenticity-token'];

    const { config } =
      await import('../config/env.js');

    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      console.error('PAGBANK WEBHOOK WITHOUT RAW BODY');

      return res.status(401).send('Unauthorized');
    }

    /*
      Em produção, a assinatura é obrigatória.
      Sandbox/local pode não enviar esse header, mas a ordem ainda
      é confirmada diretamente na API do PagBank antes de liberar Premium.
    */
    const isProduction =
      config.NODE_ENV === 'production';

    if (isProduction && !authHeader) {
      console.error('PAGBANK SIGNATURE MISSING');

      return res.status(401).send('Unauthorized');
    }

    if (authHeader) {
      const signature =
        Array.isArray(authHeader)
          ? authHeader[0]
          : authHeader;

      const rawPayload =
        Buffer.isBuffer(rawBody)
          ? rawBody.toString('utf8')
          : String(rawBody);

      const expectedSignature =
        crypto
          .createHash('sha256')
          .update(
            `${config.PAGBANK_TOKEN}-${rawPayload}`
          )
          .digest('hex');

      const expectedBuffer =
        Buffer.from(expectedSignature, 'utf8');

      const actualBuffer =
        Buffer.from(signature, 'utf8');

      if (
        expectedBuffer.length !== actualBuffer.length ||
        !crypto.timingSafeEqual(
          expectedBuffer,
          actualBuffer
        )
      ) {
        console.error('PAGBANK SIGNATURE INVALID');

        return res.status(401).send('Unauthorized');
      }
    }

    const payload = req.body;
    const orderId = payload?.id;

    /*
      Eventos que não são relacionados a um pedido podem ser
      reconhecidos sem gerar erro/retry do PagBank.
    */
    if (!orderId || typeof orderId !== 'string') {
      return res.status(200).send('Ignorado');
    }

    /*
      Nunca confie somente no corpo recebido pelo webhook.
      A fonte de confirmação do pagamento é a consulta autenticada
      à API oficial do PagBank.
    */
    const orderData = await verifyPayment(orderId);

    if (!orderData) {
      console.error(
        `PAGBANK ORDER NOT FOUND: ${orderId}`
      );

      return res.status(400).send('Invalid Order');
    }

    const status = getOrderStatus(orderData);

    if (status !== 'PAID') {
      return res.status(200).send('OK');
    }

    const referenceId =
      String(orderData.reference_id || '');

    /*
      O reference_id é criado como:
      libido-premium_<userId>_<identificador-local>
    */
    const referenceParts =
      referenceId.split('_');

    const userId = referenceParts[1];

    if (
      referenceParts.length < 3 ||
      referenceParts[0] !== 'libido-premium' ||
      !userId
    ) {
      console.error(
        `PAGBANK INVALID REFERENCE: ${referenceId}`
      );

      return res.status(400).send('Invalid Reference');
    }

    const amountPaid = getPaidAmount(orderData);

    /*
      Não usar valor padrão aqui. Sem valor válido fornecido pela
      ordem confirmada pelo PagBank, o pagamento não é liberado.
    */
    if (amountPaid === null) {
      console.error(
        `PAGBANK INVALID AMOUNT: ${orderId}`
      );

      return res.status(400).send('Invalid Amount');
    }

    const { getAdminSupabase } =
      await import('../config/supabase.js');

    const supabase = getAdminSupabase();

    /*
      process_payment deve validar no banco:
      - usuário da transação;
      - payment_id;
      - provider;
      - valor;
      - idempotência.
    */
    const { error } =
      await supabase.rpc(
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
      console.error(
        'Erro processando pagamento:',
        error
      );

      /*
        Retornar 500 permite que o PagBank tente novamente o webhook.
        O RPC deve ser idempotente para receber repetições com segurança.
      */
      return res
        .status(500)
        .send('Internal Server Error');
    }

    console.log(
      `Pagamento confirmado: ${orderId}`
    );

    return res.status(200).send('OK');

  } catch (error: any) {
    console.error(
      'Erro processando webhook:',
      error.message
    );

    return res
      .status(500)
      .send('Internal Server Error');
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

    const { data: tx, error } =
      await supabase
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

    let finalStatus = tx.status;

    /*
      Fallback caso o webhook atrase ou não seja recebido:
      consulta a API do PagBank e só então processa o pagamento.
    */
    if (finalStatus === 'WAITING') {
      const orderData = await verifyPayment(paymentId);

      if (
        orderData &&
        getOrderStatus(orderData) === 'PAID'
      ) {
        const amountPaid = getPaidAmount(orderData);

        if (amountPaid === null) {
          console.error(
            `PAGBANK INVALID AMOUNT: ${paymentId}`
          );

          return res.status(400).json({
            error: 'Valor inválido na confirmação do pagamento.'
          });
        }

        const { error: processError } =
          await supabase.rpc(
            'process_payment',
            {
              p_user_id: userId,
              p_payment_id: paymentId,
              p_provider: 'pagbank',
              p_status: 'PAID',
              p_amount: amountPaid
            }
          );

        if (processError) {
          console.error(
            'Erro processando pagamento por consulta:',
            processError
          );

          return res.status(500).json({
            error: 'Erro ao confirmar pagamento.'
          });
        }

        finalStatus = 'PAID';
      }
    }

    /*
      Fonte única de verdade do Premium:
      public.users.premium / public.users.plan.
    */
    const {
      data: premiumUser,
      error: premiumUserError
    } =
      await supabase
        .from('users')
        .select('premium, plan')
        .eq('user_id', userId)
        .single();

    if (premiumUserError || !premiumUser) {
      console.error(
        'Erro consultando status Premium:',
        premiumUserError
      );

      return res.status(500).json({
        error: 'Não foi possível consultar o status Premium.'
      });
    }

    const plan =
      String(premiumUser.plan || '')
        .trim()
        .toLowerCase();

    const isPremium =
      premiumUser.premium === true ||
      [
        'premium',
        'owner',
        'admin',
        'moderator'
      ].includes(plan);

    return res.status(200).json({
      paymentId,
      status: finalStatus,
      isPremium,
      expirationDate: null
    });

  } catch (error: any) {
    console.error(
      'Erro em getPaymentStatus:',
      error.message
    );

    return res.status(500).json({
      error: 'Erro interno.'
    });
  }
};
