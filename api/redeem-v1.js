import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  console.log('[redeem-v1] invocado');
  return res.status(200).json({ version: 'v1', ok: true });
}
