import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  consulta: process.env.STRIPE_PRICE_CONSULTA,
  mistico: process.env.STRIPE_PRICE_MISTICO,
  sagrado: process.env.STRIPE_PRICE_SAGRADO,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { plan } = req.body;
  const priceId = PRICES[plan];
  if (!priceId) return res.status(400).json({ error: 'Plano invalido' });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === 'consulta' ? 'payment' : 'subscription',
      metadata: { plan: plan },
      success_url: 'https://oraculo-da-sorte.vercel.app/app?pagamento=sucesso',
      cancel_url: 'https://oraculo-da-sorte.vercel.app/',
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
