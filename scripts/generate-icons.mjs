import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const SOURCE = 'public/oraculo-icon-master.svg';
const OUT_DIR = 'public/icons';
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
    console.log('✓ Criada pasta', OUT_DIR);
  }
  for (const size of SIZES) {
    const out = `${OUT_DIR}/icon-${size}.png`;
    await sharp(SOURCE).resize(size, size).png({ quality: 95, compressionLevel: 9 }).toFile(out);
    console.log(`✓ Gerado ${out}`);
  }
  console.log('✓ Todos os ícones gerados.');
}

generate().catch(err => { console.error('✗ Erro:', err); process.exit(1); });
