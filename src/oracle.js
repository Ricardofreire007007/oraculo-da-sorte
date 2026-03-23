// src/oracle.js — Motor Místico do Oráculo da Sorte

// ══════════════════════════════════════
//  FASE DA LUA
// ══════════════════════════════════════
export function getMoonPhase(date = new Date()) {
  // Lua nova conhecida: 11 Jan 2024
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
//  NUMEROLOGIA PITAGÓRICA
// ══════════════════════════════════════
export function calcLifeNumber(birthDate) {
  // birthDate no formato "YYYY-MM-DD"
  const digits = birthDate.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

// Vibração numerológica do dia
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
//  GERADOR DE NÚMEROS MÍSTICOS
// ══════════════════════════════════════
export function generateMysticNumbers(birthDate) {
  const lifeNumber = calcLifeNumber(birthDate);
  const moon = getMoonPhase();
  const dayVib = dayVibration();

  // Seed baseada na data de nascimento + dia atual + fase lunar
  const today = new Date();
  const seed = lifeNumber * 1000 + today.getDate() * 100 + (today.getMonth() + 1) * 10 + dayVib;

  // Pseudo-random baseado na seed (determinístico por dia)
  function seededRandom(s) {
    let x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }

  const allNumbers = [];
  let attempts = 0;
  const maxAttempts = 5000;

  while (allNumbers.length === 0 && attempts < maxAttempts) {
    attempts++;
    const candidate = [];
    const used = new Set();

    // 1. Inclui 1-2 números de poder da lua
    const moonNums = moon.powerNumbers.filter(n => n >= 1 && n <= 60);
    const moonPick = moonNums[Math.floor(seededRandom(seed + attempts) * moonNums.length)];
    if (moonPick) {
      candidate.push(moonPick);
      used.add(moonPick);
    }

    // 2. Número baseado no número de vida
    const lifeNum = ((lifeNumber * (today.getDate() + attempts)) % 60) + 1;
    if (!used.has(lifeNum) && lifeNum >= 1 && lifeNum <= 60) {
      candidate.push(lifeNum);
      used.add(lifeNum);
    }

    // 3. Número baseado na vibração do dia
    const vibNum = ((dayVib * 7 + attempts * 3) % 60) + 1;
    if (!used.has(vibNum) && vibNum >= 1 && vibNum <= 60) {
      candidate.push(vibNum);
      used.add(vibNum);
    }

    // 4. Preencher restante até 6 números
    while (candidate.length < 6) {
      const n = Math.floor(seededRandom(seed + candidate.length * 13 + attempts * 7) * 60) + 1;
      if (!used.has(n)) {
        candidate.push(n);
        used.add(n);
      }
      attempts++;
      if (attempts > maxAttempts) break;
    }

    if (candidate.length !== 6) continue;

    // ══════════════════════════════════════
    //  VALIDAR PRESSUPOSTOS
    // ══════════════════════════════════════
    const sorted = candidate.sort((a, b) => a - b);
    const pares = sorted.filter(n => n % 2 === 0).length;
    const impares = sorted.filter(n => n % 2 !== 0).length;
    const baixos = sorted.filter(n => n <= 30).length;
    const altos = sorted.filter(n => n > 30).length;
    const soma = sorted.reduce((a, b) => a + b, 0);

    // Pressuposto 1: 3 pares + 3 ímpares
    if (pares !== 3 || impares !== 3) continue;

    // Pressuposto 2: 3 baixos + 3 altos
    if (baixos !== 3 || altos !== 3) continue;

    // Pressuposto 3: Soma entre 175 e 210
    if (soma < 175 || soma > 210) continue;

    // Todos os pressupostos satisfeitos!
    allNumbers.push(...sorted);
  }

  // Fallback se não encontrou combinação perfeita
  if (allNumbers.length === 0) {
    const fallback = [];
    const used = new Set();
    while (fallback.length < 6) {
      const n = Math.floor(seededRandom(seed + fallback.length * 17) * 60) + 1;
      if (!used.has(n)) {
        fallback.push(n);
        used.add(n);
      }
    }
    allNumbers.push(...fallback.sort((a, b) => a - b));
  }

  return {
    numbers: allNumbers.slice(0, 6),
    lifeNumber,
    moon,
    dayVibration: dayVib,
    pressupostos: {
      pares: allNumbers.slice(0, 6).filter(n => n % 2 === 0).length,
      impares: allNumbers.slice(0, 6).filter(n => n % 2 !== 0).length,
      baixos: allNumbers.slice(0, 6).filter(n => n <= 30).length,
      altos: allNumbers.slice(0, 6).filter(n => n > 30).length,
      soma: allNumbers.slice(0, 6).reduce((a, b) => a + b, 0),
    },
  };
}