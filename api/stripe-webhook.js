import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { api: { bodyParser: false } };

async function buffer(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const session = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const customerEmail = session.customer_details?.email;
    // Ler o plano do metadata (mistico, sagrado, consulta)
    const plan = session.metadata?.plan || (session.mode === 'subscription' ? 'paid' : 'consulta');

    if (customerEmail) {
      // Para plano consulta, acumular 3 créditos ao saldo existente
      let updateData = {
        plano: plan,
        stripe_customer_id: session.customer,
        subscription_id: session.subscription || null,
        updated_at: new Date().toISOString(),
      };

      if (plan === 'consulta') {
        let creditosActuais = 0;
        try {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('creditos_restantes')
            .eq('email', customerEmail)
            .single();
          creditosActuais = currentProfile?.creditos_restantes || 0;
        } catch (err) {
          console.error('Erro ao ler créditos actuais, usando 0:', err);
        }
        updateData.creditos_restantes = creditosActuais + 3;
        console.log('Plano consulta: creditos_restantes', creditosActuais, '->', creditosActuais + 3, 'para', customerEmail);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('email', customerEmail);

      if (error) console.error('Supabase update error:', error);
      else console.log('Plano atualizado para', customerEmail, '->', plan);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = session;
    const customer = await stripe.customers.retrieve(subscription.customer);

    if (customer.email) {
      await supabase
        .from('profiles')
        .update({ plano: 'free', subscription_id: null, updated_at: new Date().toISOString() })
        .eq('email', customer.email);

      console.log('Assinatura cancelada para', customer.email);
    }
  }

  res.status(200).json({ received: true });
}
