// api/mp-webhook.js
// Recebe notificações do Mercado Pago e ativa planos após validação autenticada.
//
// Segurança: não valida HMAC (secret não obtenível na UI do MP). Em vez disso,
// faz GET autenticado a /v1/payments/{id} com o Access Token da conta — a resposta
// é garantidamente do MP. O body original do webhook é gravado para auditoria mas
// NUNCA usado como fonte de verdade (status, valor, plano vêm sempre da API).
//
// Idempotência: mp_payments_log.mp_payment_id UNIQUE + upsert com ignoreDuplicates.
//
// Retorna 200 em casos não-recuperáveis para evitar retries infinitos do MP;
// 500 apenas em falhas transitórias onde o retry faz sentido.

import { createClient } from '@supabase/supabase-js';

const PLANOS_DIAS = {
  mistico: 7,
  sagrado: 30,
  premium_anual: 365,
};

const PLANOS_VALIDOS = new Set(['consulta', 'mistico', 'sagrado', 'premium_anual']);

const RANK_PLANO = { consulta: 0, mistico: 1, sagrado: 2, premium_anual: 3 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getAccessToken() {
  const isProd = process.env.VERCEL_ENV === 'production';
  return isProd ? process.env.MP_ACCESS_TOKEN : process.env.MP_ACCESS_TOKEN_TEST;
}

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
  );
}

function parseNotification(req) {
  const body = req.body || {};
  const query = req.query || {};
  const type = body.type || query.type || query.topic || null;
  const dataId =
    body?.data?.id ||
    query.id ||
    query['data.id'] ||
    null;
  return { type, dataId: dataId ? String(dataId) : null };
}

function parseExternalReference(ref) {
  if (!ref || typeof ref !== 'string') return null;
  const parts = ref.split('::');
  if (parts.length !== 3) return null;
  const [user_id, plano, timestamp] = parts;
  if (!user_id || !plano) return null;
  if (!UUID_RE.test(user_id)) return null;
  return { user_id, plano, timestamp };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { type, dataId } = parseNotification(req);

  if (type !== 'payment') {
    return res.status(200).json({ ignored: true, reason: 'not a payment event' });
  }
  if (!dataId) {
    return res.status(200).json({ ignored: true, reason: 'no data.id' });
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    console.error('MP access token em falta (VERCEL_ENV=%s)', process.env.VERCEL_ENV);
    return res.status(500).json({ error: 'Configuração incompleta' });
  }

  let payment;
  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!mpRes.ok) {
      console.error('MP API devolveu não-OK:', mpRes.status, 'payment_id=', dataId);
      return res.status(200).json({ error: 'payment not found at MP', status: mpRes.status });
    }
    payment = await mpRes.json();
  } catch (err) {
    console.error('Erro ao contactar MP API:', err);
    return res.status(500).json({ error: 'Falha a contactar Mercado Pago' });
  }

  if (payment?.status !== 'approved') {
    return res.status(200).json({ ignored: true, status: payment?.status || 'unknown' });
  }

  const parsed = parseExternalReference(payment.external_reference);
  if (!parsed) {
    console.error('external_reference inválido:', payment.external_reference, 'payment_id=', payment.id);
    return res.status(200).json({ error: 'external_reference inválido' });
  }
  const { user_id, plano } = parsed;

  if (!PLANOS_VALIDOS.has(plano)) {
    console.error('Plano inválido em external_reference:', plano, 'payment_id=', payment.id);
    return res.status(200).json({ error: 'plano inválido' });
  }

  const supabase = getSupabase();

  const { data: inserted, error: logErr } = await supabase
    .from('mp_payments_log')
    .upsert(
      {
        mp_payment_id: String(payment.id),
        user_id,
        plano,
        valor: payment.transaction_amount ?? null,
        status: payment.status,
        external_reference: payment.external_reference,
        raw_webhook_payload: req.body || null,
        raw_api_response: payment,
      },
      { onConflict: 'mp_payment_id', ignoreDuplicates: true },
    )
    .select();

  if (logErr) {
    console.error('Erro ao gravar mp_payments_log:', logErr, 'payment_id=', payment.id);
    return res.status(500).json({ error: 'Falha a gravar log' });
  }
  if (!inserted || inserted.length === 0) {
    return res.status(200).json({ already_processed: true, payment_id: String(payment.id) });
  }

  const { data: current, error: readErr } = await supabase
    .from('profiles')
    .select('plano, plano_expira_em, creditos_restantes')
    .eq('id', user_id)
    .single();

  if (readErr || !current) {
    console.error('Erro ao ler profile:', readErr, 'user_id=', user_id);
    return res.status(500).json({ error: 'Falha a ler profile' });
  }

  const now = new Date();
  const updatePayload = {
    ultimo_pagamento_mp_id: String(payment.id),
    updated_at: now.toISOString(),
  };

  if (plano === 'consulta') {
    const creditosAtuais = current.creditos_restantes || 0;
    updatePayload.creditos_restantes = creditosAtuais + 3;
  } else {
    const dias = PLANOS_DIAS[plano];
    const planoAtual = current.plano;
    const rankAtual = RANK_PLANO[planoAtual];
    const expiraAtual = current.plano_expira_em ? new Date(current.plano_expira_em) : null;
    const temPremiumAtivo =
      expiraAtual && expiraAtual > now &&
      rankAtual !== undefined && rankAtual >= 1;

    const base = temPremiumAtivo ? expiraAtual : now;
    const novaExpiracao = new Date(base.getTime() + dias * 24 * 60 * 60 * 1000);

    const manterLabelAtual = temPremiumAtivo && RANK_PLANO[plano] <= rankAtual;
    updatePayload.plano = manterLabelAtual ? planoAtual : plano;
    updatePayload.plano_expira_em = novaExpiracao.toISOString();
  }

  const { error: updateErr } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user_id);

  if (updateErr) {
    console.error('Erro ao atualizar profile:', updateErr, 'user_id=', user_id);
    return res.status(500).json({ error: 'Falha a atualizar profile' });
  }

  console.log(
    'MP webhook OK: payment_id=%s user_id=%s plano_comprado=%s plano_final=%s %s',
    payment.id,
    user_id,
    plano,
    updatePayload.plano || current.plano,
    plano === 'consulta'
      ? `creditos=${updatePayload.creditos_restantes}`
      : `expira_em=${updatePayload.plano_expira_em}`,
  );

  return res.status(200).json({
    ok: true,
    plano_comprado: plano,
    plano_ativo: updatePayload.plano || current.plano,
    payment_id: String(payment.id),
    ...(plano === 'consulta'
      ? { creditos_restantes: updatePayload.creditos_restantes }
      : { plano_expira_em: updatePayload.plano_expira_em }),
  });
}
