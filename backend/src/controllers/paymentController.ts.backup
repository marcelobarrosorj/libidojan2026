import { Request, Response } from 'express';
import { createPixPayment, verifyPayment } from '../services/pagbank.js';
import crypto from 'crypto';
import { isValidCPF, normalizeCPF } from '../utils/cpf.js';


export const createPayment = async (req: Request, res: Response) => {

  try {

    const authUser = (req as any).user;

    if (!authUser || !authUser.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.'
      });
    }


    const userId = authUser.id;

    const { customerTaxId } = req.body;

    const normalizedTaxId =
      normalizeCPF(customerTaxId);


    if (
      !normalizedTaxId ||
      !isValidCPF(normalizedTaxId)
    ) {

      return res.status(400).json({
        error: 'CPF inválido'
      });

    }


    const pixData =
      await createPixPayment(
        userId,
        normalizedTaxId
      );


    const { getAdminSupabase } =
      await import('../config/supabase.js');


    const supabase =
      getAdminSupabase();


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
        error: 'Erro interno ao registrar transação'
      });

    }



    return res.status(200).json(pixData);



  } catch (error: any) {


    console.error(
      'Erro em createPayment:',
      error.message
    );


    return res.status(500).json({
      error: 'Erro interno ao criar pagamento'
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


    const rawBody =
      (req as any).rawBody;


    // Sandbox PagBank pode não enviar x-authenticity-token
    if (!rawBody) {

      return res
        .status(401)
        .send('Unauthorized');

    }


    if (authHeader) {

      const expectedSignature =
        crypto
          .createHash('sha256')
          .update(
            `${config.PAGBANK_TOKEN}-${rawBody}`
          )
          .digest('hex');


      const expectedBuffer =
        Buffer.from(expectedSignature);


      const actualBuffer =
        Buffer.from(authHeader as string);



      if (
        expectedBuffer.length !== actualBuffer.length ||
        !crypto.timingSafeEqual(
          expectedBuffer,
          actualBuffer
        )
      ) {

        console.error(
          "PAGBANK SIGNATURE INVALID"
        );


        return res
          .status(401)
          .send('Unauthorized');

      }

    }


    const payload = req.body;


    const orderId =
      payload.id;



    if (!orderId) {

      return res
        .status(200)
        .send('Ignorado');

    }



    const orderData =
      await verifyPayment(orderId);



    if (!orderData) {

      return res
        .status(400)
        .send('Invalid Order');

    }



    const status =
      orderData.charges?.[0]?.status ||
      orderData.status;
    if (status === 'PAID') {


      const { getAdminSupabase } =
        await import('../config/supabase.js');


      const supabase =
        getAdminSupabase();


      const referenceId =
        orderData.reference_id || "";


      const userId =
        referenceId.split('_')[1];



      if (!userId) {

        return res
          .status(400)
          .send('Missing userId');

      }



      const amountPaid =
        orderData.charges?.[0]?.amount?.value
          ? orderData.charges[0].amount.value / 100
          : 19.90;



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

      }


      console.log(
        `Pagamento confirmado: ${orderId}`
      );


    }



    return res
      .status(200)
      .send('OK');



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


    if (!authUser || !authUser.id) {

      return res.status(401).json({
        error: 'Usuário não autenticado.'
      });

    }


    const userId = authUser.id;

    const { paymentId } = req.params;


    const { getAdminSupabase } =
      await import('../config/supabase.js');


    const supabase =
      getAdminSupabase();



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



    let finalStatus =
      tx.status;



    if (finalStatus === 'WAITING') {


      const orderData =
        await verifyPayment(paymentId);



      if (orderData) {


        const pagbankStatus =
          orderData.charges?.[0]?.status ||
          orderData.status;



        if (pagbankStatus === 'PAID') {


          finalStatus = 'PAID';


          const amountPaid =
            orderData.charges?.[0]?.amount?.value
              ? orderData.charges[0].amount.value / 100
              : 19.90;



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


        }

      }

    }


    // Premium somente se existir assinatura ativa válida
    const { data: subscription } =
      await supabase
        .from('user_subscriptions')
        .select(
          'status, expires_at'
        )
        .eq(
          'user_id',
          userId
        )
        .eq(
          'status',
          'active'
        )
        .gt(
          'expires_at',
          new Date().toISOString()
        )
        .maybeSingle();



    const isPremium =
      !!subscription;



    return res.status(200).json({

      paymentId,

      status: finalStatus,

      isPremium,

      expirationDate:
        subscription?.expires_at || null

    });



  } catch (error: any) {


    console.error(
      'Erro em getPaymentStatus:',
      error.message
    );


    return res.status(500).json({
      error: 'Erro interno'
    });


  }

};