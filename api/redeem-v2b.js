import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// bloco A: regex
const CODE_REGEX = /^ORACULO-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

// bloco B: readRawBody (async function com for-await, exatamente como redeem-code.js)
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  console.log('[redeem-v2b] HANDLER ENTROU', new Date().toISOString());
  console.log('[redeem-v2b] helpers:', {
    regexOk: CODE_REGEX.test('ORACULO-ABCD-1234'),
    readRawBodyType: typeof readRawBody,
  });
  return res.status(200).json({
    version: 'v2b',
    ok: true,
    supabaseReady: !!supabaseAdmin,
    readRawBodyType: typeof readRawBody,
  });
}
