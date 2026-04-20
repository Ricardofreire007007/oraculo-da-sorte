import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// bloco A: regex exatamente como está no redeem-code.js
const CODE_REGEX = /^ORACULO-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  console.log('[redeem-v2a] HANDLER ENTROU', new Date().toISOString());
  console.log('[redeem-v2a] invocado, regex test:', CODE_REGEX.test('ORACULO-ABCD-1234'));
  return res.status(200).json({
    version: 'v2a',
    ok: true,
    supabaseReady: !!supabaseAdmin,
    regexOk: CODE_REGEX.test('ORACULO-ABCD-1234'),
  });
}
