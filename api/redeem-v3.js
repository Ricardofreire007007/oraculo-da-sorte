import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Evita crash no module-load se as env vars estiverem em falta — devolvemos 500
// controlado em vez de Vercel responder com 400/500 sem body.
const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

export const config = {
  api: {
    bodyParser: false,
  },
};

function tokenPreview(token) {
  if (!token) return '(vazio)';
  return token.slice(0, 20) + '...(len=' + token.length + ')';
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  console.log('[redeem-v3] HANDLER ENTROU', new Date().toISOString());
  console.log('[redeem-v3] Request recebido:', {
    method: req.method,
    contentType: req.headers['content-type'] || '(ausente)',
    hasAuth: !!req.headers.authorization,
    bodyType: typeof req.body,
    url: req.url,
  });

  try {
    if (!supabaseAdmin) {
      console.error('[redeem-v3] Supabase client não inicializado. URL=', !!SUPABASE_URL, 'KEY=', !!SUPABASE_SERVICE_KEY);
      return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
    }

    if (req.method !== 'POST') {
      console.log('[redeem-v3] Método rejeitado:', req.method);
      return res.status(405).json({ error: 'Método não permitido.' });
    }

    // bodyParser default do Vercel está desativado (ver config acima) — parse manual.
    let body;
    try {
      const raw = await readRawBody(req);
      console.log('[redeem-v3] raw body length:', raw.length);
      body = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error('[redeem-v3] body parse failed:', err.message);
      return res.status(400).json({ error: 'Body JSON inválido.' });
    }

    const { code } = body || {};
    if (!code || typeof code !== 'string') {
      console.log('[redeem-v3] Campo "code" ausente ou tipo errado:', typeof code);
      return res.status(400).json({ error: 'Código obrigatório.' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    console.log('[redeem-v3] Token preview:', tokenPreview(token));
    if (!token) {
      return res.status(401).json({ error: 'É preciso fazer login para resgatar o código.' });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('[redeem-v3] Sessão inválida:', userError?.message || 'sem user no payload');
      return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
    }
    const userId = userData.user.id;
    console.log('[redeem-v3] User autenticado:', userId);

    const codeNormalized = code.trim().toUpperCase();
    if (!/^ORACULO-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codeNormalized)) {
      console.log('[redeem-v3] Formato inválido:', codeNormalized);
      return res.status(400).json({ error: 'Os astros não reconhecem esse código. Verifique e tente novamente.' });
    }

    const { data: codeRow, error: codeError } = await supabaseAdmin
      .from('premium_codes')
      .select('code, redeemed_at')
      .eq('code', codeNormalized)
      .maybeSingle();

    if (codeError) {
      console.error('[redeem-v3] Erro ao consultar premium_codes:', codeError);
      return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
    if (!codeRow) {
      console.log('[redeem-v3] Código inexistente:', codeNormalized);
      return res.status(404).json({ error: 'Os astros não reconhecem esse código. Verifique e tente novamente.' });
    }
    if (codeRow.redeemed_at) {
      console.log('[redeem-v3] Código já resgatado em:', codeRow.redeemed_at);
      return res.status(409).json({ error: 'Este código já foi resgatado.' });
    }

    const now = new Date().toISOString();

    const { data: claimed, error: claimError } = await supabaseAdmin
      .from('premium_codes')
      .update({ redeemed_at: now, redeemed_by_user_id: userId })
      .eq('code', codeNormalized)
      .is('redeemed_at', null)
      .select()
      .maybeSingle();

    if (claimError || !claimed) {
      console.error('[redeem-v3] Erro/race ao marcar código:', claimError?.message || 'sem linha afetada');
      return res.status(409).json({ error: 'Este código já foi resgatado.' });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ plano: 'paid', updated_at: now })
      .eq('id', userId);

    if (profileError) {
      console.error('[redeem-v3] Erro ao atualizar profile, a libertar código:', profileError);
      await supabaseAdmin
        .from('premium_codes')
        .update({ redeemed_at: null, redeemed_by_user_id: null })
        .eq('code', codeNormalized);
      return res.status(500).json({ error: 'Erro ao ativar Premium. Tente novamente.' });
    }

    console.log('[redeem-v3] SUCESSO. User:', userId, 'Code:', codeNormalized);
    return res.status(200).json({ success: true, plan: 'paid' });

  } catch (err) {
    console.error('[redeem-v3] Exceção não tratada:', err?.message || err);
    if (err?.stack) console.error(err.stack);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Erro inesperado no servidor.' });
    }
  }
}
