import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.paid':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabase
            .from('users')
            .update({
              is_premium: true,
              plan: 'GOLD',
              subscription_active: true,
              subscription_id: subscription.id,
            })
            .eq('id', userId);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        const deletedUserId = deletedSub.metadata?.user_id;
        if (deletedUserId) {
          await supabase
            .from('users')
            .update({ is_premium: false, subscription_active: false })
            .eq('id', deletedUserId);
        }
        break;
    }

    res.status(200).send('Webhook received and processed successfully');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(200).send('Webhook received'); // sempre retorna 200 para o Stripe não desativar novamente
  }
}

export const config = {
  api: { bodyParser: false },
};
