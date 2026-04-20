// api/mp-checkout.js
// Cria uma Preference no Mercado Pago Checkout Pro e devolve o init_point.
// Stateless: não escreve em BD. A gravação acontece no webhook após pagamento aprovado.
// Exige JWT válido do Supabase no header Authorization — o user_id e email são
// extraídos da sessão autenticada, nunca do body (evita forjar pedidos de outras contas).

import { createClient } from '@supabase/supabase-js';

const PLANOS = {
  consulta: {
    id: 'consulta',
    nome: '3 Consultas',
    preco: 6.00,
    dias_acesso: 0,
    creditos: 3,
  },
  mistico: {
    id: 'mistico',
    nome: 'Místico',
    preco: 9.90,
    dias_acesso: 7,
    creditos: 0,
  },
  sagrado: {
    id: 'sagrado',
    nome: 'Sagrado',
    preco: 24.90,
    dias_acesso: 30,
    creditos: 0,
  },
  premium_anual: {
    id: 'premium_anual',
    nome: 'Premium Anual',
    preco: 99.00,
    dias_acesso: 365,
    creditos: 0,
  },
};

const BASE_URL = process.env.VITE_PUBLIC_BASE_URL || 'https://oraculo-da-sorte.com';

function getAccessToken() {
  const isProd = process.env.VERCEL_ENV === 'production';
  return isProd ? process.env.MP_ACCESS_TOKEN : process.env.MP_ACCESS_TOKEN_TEST;
}

async function autenticar(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const jwt = auth.slice(7).trim();
  if (!jwt) return null;

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
  );
  const { data, error } = await supabase.auth.getUser(jwt);
  if (error || !data?.user) return null;
  return data.user;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const user = await autenticar(req);
  if (!user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const { plano } = req.body || {};
  const planoData = PLANOS[plano];
  if (!planoData) {
    return res.status(400).json({ error: 'Plano inválido' });
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    console.error('MP access token em falta (VERCEL_ENV=%s)', process.env.VERCEL_ENV);
    return res.status(500).json({ error: 'Configuração de pagamento incompleta' });
  }

  const external_reference = `${user.id}::${plano}::${Date.now()}`;

  const preference = {
    items: [{
      id: plano,
      title: `Oráculo da Sorte — ${planoData.nome}`,
      quantity: 1,
      unit_price: planoData.preco,
      currency_id: 'BRL',
    }],
    payer: { email: user.email },
    external_reference,
    back_urls: {
      success: `${BASE_URL}/pagamento-sucesso?status=approved`,
      failure: `${BASE_URL}/pagamento-sucesso?status=failed`,
      pending: `${BASE_URL}/pagamento-sucesso?status=pending`,
    },
    auto_return: 'approved',
    notification_url: `${BASE_URL}/api/mp-webhook`,
    statement_descriptor: 'ORACULO DA SORTE',
    metadata: { user_id: user.id, plano },
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error('MP recusou preferência:', mpRes.status, data);
      return res.status(502).json({
        error: 'Mercado Pago recusou a preferência',
        status: mpRes.status,
        detalhes: data?.message || data?.error || 'sem detalhes',
      });
    }

    return res.status(200).json({
      init_point: data.init_point,
      preference_id: data.id,
    });
  } catch (err) {
    console.error('Erro ao contactar MP:', err);
    return res.status(500).json({ error: 'Falha ao contactar Mercado Pago' });
  }
}
