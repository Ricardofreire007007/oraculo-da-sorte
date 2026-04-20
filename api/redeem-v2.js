import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  console.log('[redeem-v2] invocado, supabaseAdmin:', supabaseAdmin ? 'ok' : 'null');
  return res.status(200).json({
    version: 'v2',
    supabaseReady: !!supabaseAdmin,
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_SERVICE_KEY
  });
}
