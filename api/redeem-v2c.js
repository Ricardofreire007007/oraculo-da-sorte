import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// bloco A: regex
const CODE_REGEX = /^ORACULO-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

// bloco C: tokenPreview (exatamente como redeem-code.js)
function tokenPreview(token) {
  if (!token) return '(vazio)';
  return token.slice(0, 20) + '...(len=' + token.length + ')';
}

// bloco B: readRawBody
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  console.log('[redeem-v2c] HANDLER ENTROU', new Date().toISOString());
  console.log('[redeem-v2c] helpers loaded:', {
    supabaseAdmin: !!supabaseAdmin,
    regexOk: CODE_REGEX.test('ORACULO-ABCD-1234'),
    tokenPreview: typeof tokenPreview,
    readRawBody: typeof readRawBody,
  });
  return res.status(200).json({
    version: 'v2c',
    ok: true,
    supabaseReady: !!supabaseAdmin,
    helpersOk: {
      regex: typeof CODE_REGEX,
      tokenPreview: typeof tokenPreview,
      readRawBody: typeof readRawBody,
    },
  });
}
