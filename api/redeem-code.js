import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { code } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Código obrigatório.' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'É preciso fazer login para resgatar o código.' });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
  }
  const userId = userData.user.id;

  const codeNormalized = code.trim().toUpperCase();
  if (!/^ORACULO-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codeNormalized)) {
    return res.status(400).json({ error: 'Os astros não reconhecem esse código. Verifique e tente novamente.' });
  }

  const { data: codeRow, error: codeError } = await supabaseAdmin
    .from('premium_codes')
    .select('code, redeemed_at')
    .eq('code', codeNormalized)
    .maybeSingle();

  if (codeError) {
    console.error('Erro ao consultar premium_codes:', codeError);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
  if (!codeRow) {
    return res.status(404).json({ error: 'Os astros não reconhecem esse código. Verifique e tente novamente.' });
  }
  if (codeRow.redeemed_at) {
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
    return res.status(409).json({ error: 'Este código já foi resgatado.' });
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ plano: 'paid', updated_at: now })
    .eq('id', userId);

  if (profileError) {
    console.error('Erro ao atualizar profile, a libertar código:', profileError);
    await supabaseAdmin
      .from('premium_codes')
      .update({ redeemed_at: null, redeemed_by_user_id: null })
      .eq('code', codeNormalized);
    return res.status(500).json({ error: 'Erro ao ativar Premium. Tente novamente.' });
  }

  return res.status(200).json({ success: true, plan: 'paid' });
}
