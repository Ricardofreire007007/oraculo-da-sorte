// Gera um código ORACULO-XXXX-XXXX e faz INSERT na tabela premium_codes do Supabase.
//
// Correr com (Node 20+):
//   node --env-file=.env.local scripts/generate-code.mjs [notas opcionais]
//
// Precisa das variáveis VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY no .env.local
// (são as mesmas já usadas pelo stripe-webhook).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_KEY em falta.');
  console.error('Correr com: node --env-file=.env.local scripts/generate-code.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `ORACULO-${seg(4)}-${seg(4)}`;
}

async function main() {
  const { count, error: countError } = await supabase
    .from('premium_codes')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Erro ao contar códigos existentes:', countError.message);
    process.exit(1);
  }

  const code = generateCode();
  const buyer_id = `cliente_${String(count || 0).padStart(4, '0')}`;
  const notes = process.argv[2] || null;

  const { error } = await supabase
    .from('premium_codes')
    .insert({ code, buyer_id, notes });

  if (error) {
    console.error('Erro ao inserir código:', error.message);
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  console.log('\n✨ CÓDIGO MÍSTICO GERADO ✨\n');
  console.log('  Código:   ', code);
  console.log('  Buyer ID: ', buyer_id);
  console.log('  Data:     ', today);
  if (notes) console.log('  Notas:    ', notes);
  console.log('\nEntrega este código ao cliente após confirmares o pagamento no Mercado Pago.\n');
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
