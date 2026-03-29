// src/oracle.js — Motor Místico do Oráculo da Sorte

// ══════════════════════════════════════
//  LOTERIAS SUPORTADAS
// ══════════════════════════════════════
export const LOTTERIES = {
  megasena:  { name: 'Mega-Sena',   emoji: '🎰', range: 60, pick: 6,  premium: false, desc: '6 números de 1 a 60' },
  lotofacil: { name: 'Lotofácil',   emoji: '🍀', range: 25, pick: 15, premium: true,  desc: '15 números de 1 a 25' },
  quina:     { name: 'Quina',       emoji: '⭐', range: 80, pick: 5,  premium: true,  desc: '5 números de 1 a 80' },
  lotomania: { name: 'Lotomania',   emoji: '🌀', range: 100, pick: 50, premium: true, desc: '50 números de 0 a 99' },
  duplasena: { name: 'Dupla Sena',  emoji: '🎲', range: 50, pick: 6,  premium: true,  desc: '6 números de 1 a 50' },
  timemania: { name: 'Timemania',   emoji: '⚽', range: 80, pick: 7,  premium: true,  desc: '7 números de 1 a 80' },
  diadesorte:{ name: 'Dia de Sorte',emoji: '☀️', range: 31, pick: 7,  premium: true,  desc: '7 números de 1 a 31' },
};

// ══════════════════════════════════════
//  FASE DA LUA
// ══════════════════════════════════════
export function getMoonPhase(date = new Date()) {
  const knownNewMoon = new Date(2024, 0, 11);
  const lunarCycle = 29.53059;
  const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  const phasePercent = (phase / lunarCycle) * 100;

  if (phasePercent < 1.85) return { name: 'Lua Nova', emoji: '🌑', energy: 'Início', influence: 'renovação', powerNumbers: [1, 7, 11, 22] };
  if (phasePercent < 23.1) return { name: 'Lua Crescente', emoji: '🌒', energy: 'Expansão', influence: 'crescimento', powerNumbers: [3, 9, 18, 27] };
  if (phasePercent < 26.85) return { name: 'Quarto Crescente', emoji: '🌓', energy: 'Ação', influence: 'decisão', powerNumbers: [5, 14, 23, 41] };
  if (phasePercent < 48.1) return { name: 'Gibosa Crescente', emoji: '🌔', energy: 'Refinamento', influence: 'ajuste', powerNumbers: [8, 16, 33, 44] };
  if (phasePercent < 51.85) return { name: 'Lua Cheia', emoji: '🌕', energy: 'Plenitude', influence: 'abundância', powerNumbers: [6, 15, 28, 42] };
  if (phasePercent < 73.1) return { name: 'Gibosa Minguante', emoji: '🌖', energy: 'Gratidão', influence: 'colheita', powerNumbers: [2, 19, 37, 50] };
  if (phasePercent < 76.85) return { name: 'Quarto Minguante', emoji: '🌗', energy: 'Libertação', influence: 'desapego', powerNumbers: [4, 12, 30, 55] };
  return { name: 'Lua Minguante', emoji: '🌘', energy: 'Recolhimento', influence: 'introspecção', powerNumbers: [10, 20, 36, 48] };
}

// ══════════════════════════════════════
//  ORIXÁS DO DIA
// ══════════════════════════════════════
export function getOrixaOfDay(date = new Date()) {
  const orixas = [
    { name: 'Exú', emoji: '🔥', cor: 'Vermelho e Preto', element: 'Fogo', affirmation: 'Os caminhos se abrem para mim. Cada escolha é uma encruzilhada de possibilidades.' },
    { name: 'Ogum', emoji: '⚔️', cor: 'Azul e Verde', element: 'Ferro', affirmation: 'Tenho força e coragem para conquistar meus objetivos. A vitória me pertence.' },
    { name: 'Oxóssi', emoji: '🏹', cor: 'Verde', element: 'Mata', affirmation: 'Minha mira é certeira. A abundância da natureza me guia.' },
    { name: 'Xangô', emoji: '⚡', cor: 'Vermelho e Branco', element: 'Trovão', affirmation: 'A justiça divina age a meu favor. Minha palavra tem poder.' },
    { name: 'Oxum', emoji: '💛', cor: 'Amarelo e Dourado', element: 'Água Doce', affirmation: 'A prosperidade flui para mim como as águas do rio. Mereço abundância.' },
    { name: 'Iemanjá', emoji: '🌊', cor: 'Azul e Branco', element: 'Mar', affirmation: 'As ondas do destino me levam ao meu bem maior. Confio no fluxo da vida.' },
    { name: 'Oxalá', emoji: '✨', cor: 'Branco', element: 'Ar', affirmation: 'A paz e a sabedoria iluminam minhas escolhas. Estou em harmonia com o universo.' },
  ];
  return orixas[date.getDay()];
}

// ══════════════════════════════════════
//  NUMEROLOGIA PITAGÓRICA
// ══════════════════════════════════════
export function calcLifeNumber(birthDate) {
  const digits = birthDate.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function dayVibration(date = new Date()) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  let sum = (d + m + y).toString().split('').map(Number).reduce((a, b) => a + b, 0);
  while (sum > 9) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

// ══════════════════════════════════════
//  GERADOR DE NÚMEROS MÍSTICOS (MULTI-LOTERIA)
// ══════════════════════════════════════
export function generateMysticNumbers(birthDate, lotteryKey = 'megasena') {
  const lottery = LOTTERIES[lotteryKey];
  if (!lottery) return null;

  const { range, pick } = lottery;
  const minNum = lotteryKey === 'lotomania' ? 0 : 1;
  const maxNum = lotteryKey === 'lotomania' ? 99 : range;
  const totalRange = maxNum - minNum + 1;

  const lifeNumber = calcLifeNumber(birthDate);
  const moon = getMoonPhase();
  const dayVib = dayVibration();
  const orixa = getOrixaOfDay();

  const today = new Date();
  // Seed inclui a loteria para gerar números diferentes por jogo
  const lotterySeed = lotteryKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed = lifeNumber * 1000 + today.getDate() * 100 + (today.getMonth() + 1) * 10 + dayVib + lotterySeed;

  function seededRandom(s) {
    let x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }

  const allNumbers = [];
  let attempts = 0;
  const maxAttempts = 5000;

  // Para loterias com muitos números (lotomania = 50), relaxar validações
  const needsValidation = pick <= 15;

  while (allNumbers.length === 0 && attempts < maxAttempts) {
    attempts++;
    const candidate = [];
    const used = new Set();

    // 1. Inclui 1-2 números de poder da lua (filtrados pelo range)
    const moonNums = moon.powerNumbers.filter(n => n >= minNum && n <= maxNum);
    if (moonNums.length > 0) {
      const moonPick = moonNums[Math.floor(seededRandom(seed + attempts) * moonNums.length)];
      candidate.push(moonPick);
      used.add(moonPick);
    }

    // 2. Número baseado no número de vida
    const lifeNum = ((lifeNumber * (today.getDate() + attempts)) % totalRange) + minNum;
    if (!used.has(lifeNum) && lifeNum >= minNum && lifeNum <= maxNum) {
      candidate.push(lifeNum);
      used.add(lifeNum);
    }

    // 3. Número baseado na vibração do dia
    const vibNum = ((dayVib * 7 + attempts * 3) % totalRange) + minNum;
    if (!used.has(vibNum) && vibNum >= minNum && vibNum <= maxNum) {
      candidate.push(vibNum);
      used.add(vibNum);
    }

    // 4. Preencher restante
    let fillAttempts = 0;
    while (candidate.length < pick && fillAttempts < 1000) {
      const n = Math.floor(seededRandom(seed + candidate.length * 13 + attempts * 7 + fillAttempts) * totalRange) + minNum;
      if (!used.has(n)) {
        candidate.push(n);
        used.add(n);
      }
      fillAttempts++;
    }

    if (candidate.length !== pick) continue;

    const sorted = candidate.sort((a, b) => a - b);

    // Validação proporcional (só pra loterias com poucos números)
    if (needsValidation && pick >= 5 && pick <= 7) {
      const midpoint = Math.floor((minNum + maxNum) / 2);
      const pares = sorted.filter(n => n % 2 === 0).length;
      const impares = pick - pares;
      const baixos = sorted.filter(n => n <= midpoint).length;
      const altos = pick - baixos;

      // Pelo menos 40% de cada lado
      const minBalance = Math.floor(pick * 0.35);
      if (pares < minBalance || impares < minBalance) continue;
      if (baixos < minBalance || altos < minBalance) continue;
    }

    allNumbers.push(...sorted);
    break;
  }

  // Fallback
  if (allNumbers.length === 0) {
    const fallback = [];
    const used = new Set();
    while (fallback.length < pick) {
      const n = Math.floor(seededRandom(seed + fallback.length * 17) * totalRange) + minNum;
      if (!used.has(n)) {
        fallback.push(n);
        used.add(n);
      }
    }
    allNumbers.push(...fallback.sort((a, b) => a - b));
  }

  const finalNumbers = allNumbers.slice(0, pick);
  const midpoint = Math.floor((minNum + maxNum) / 2);

  return {
    numbers: finalNumbers,
    lottery: lottery,
    lotteryKey,
    lifeNumber,
    moon,
    orixa,
    dayVibration: dayVib,
    pressupostos: {
      pares: finalNumbers.filter(n => n % 2 === 0).length,
      impares: finalNumbers.filter(n => n % 2 !== 0).length,
      baixos: finalNumbers.filter(n => n <= midpoint).length,
      altos: finalNumbers.filter(n => n > midpoint).length,
      soma: finalNumbers.reduce((a, b) => a + b, 0),
    },
  };
}
