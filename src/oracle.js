// src/oracle.js — Motor Místico do Oráculo da Sorte (v2)

// ══════════════════════════════════════
//  LOTERIAS SUPORTADAS
// ══════════════════════════════════════
export const LOTTERIES = {
  megasena:   { name: 'Mega-Sena',    emoji: '🎰', range: 60,  pick: 6,  premium: false, desc: '6 de 1-60' },
  lotofacil:  { name: 'Lotofácil',    emoji: '🍀', range: 25,  pick: 15, premium: true,  desc: '15 de 1-25' },
  quina:      { name: 'Quina',        emoji: '⭐', range: 80,  pick: 5,  premium: true,  desc: '5 de 1-80' },
  lotomania:  { name: 'Lotomania',    emoji: '🌀', range: 100, pick: 50, premium: true,  desc: '50 de 0-99' },
  duplasena:  { name: 'Dupla Sena',   emoji: '🎲', range: 50,  pick: 6,  premium: true,  desc: '6 de 1-50' },
  timemania:  { name: 'Timemania',    emoji: '⚽', range: 80,  pick: 7,  premium: true,  desc: '7 de 1-80' },
  diadesorte: { name: 'Dia de Sorte', emoji: '☀️', range: 31,  pick: 7,  premium: true,  desc: '7 de 1-31' },
};

// ══════════════════════════════════════
//  FEATURES MÍSTICAS
// ══════════════════════════════════════
export const FEATURES = {
  tarot:       { name: 'Tarot Místico',     emoji: '🃏', color: '#8B5CF6', desc: 'Três cartas revelam os números do seu destino' },
  numerologia: { name: 'Numerologia',       emoji: '🔢', color: '#c9a84c', desc: 'Seu número de vida e vibração pessoal guiam os palpites' },
  anjos:       { name: 'Anjos da Guarda',   emoji: '👼', color: '#60A5FA', desc: 'Seu anjo protetor sussurra os números sagrados' },
  planetaria:  { name: 'Mapa Planetário',   emoji: '🪐', color: '#A78BFA', desc: 'Posições dos astros influenciam sua sorte hoje' },
  orixas:      { name: 'Ritual dos Orixás', emoji: '🕯️', color: '#F59E0B', desc: 'A força dos Orixás canaliza números de poder' },
};

// ══════════════════════════════════════
//  UTILITÁRIOS
// ══════════════════════════════════════
function seededRandom(s) {
  let x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}

export function calcLifeNumber(birthDate) {
  const digits = birthDate.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function calcNameNumber(name) {
  const map = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8};
  let sum = name.toLowerCase().split('').reduce((a, c) => a + (map[c] || 0), 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function dayVibration(date = new Date()) {
  const d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
  let sum = (d + m + y).toString().split('').map(Number).reduce((a, b) => a + b, 0);
  while (sum > 9) sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  return sum;
}

function personalYear(birthDate) {
  const parts = birthDate.split('-');
  const d = parseInt(parts[2]), m = parseInt(parts[1]), y = new Date().getFullYear();
  let sum = (d + m + y).toString().split('').map(Number).reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export function getMoonPhase(date = new Date()) {
  const knownNewMoon = new Date(2024, 0, 11);
  const lunarCycle = 29.53059;
  const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  const p = (phase / lunarCycle) * 100;
  if (p < 1.85)  return { name:'Lua Nova',         emoji:'🌑', energy:'Início',      influence:'renovação',    powerNumbers:[1,7,11,22] };
  if (p < 23.1)  return { name:'Lua Crescente',    emoji:'🌒', energy:'Expansão',    influence:'crescimento',  powerNumbers:[3,9,18,27] };
  if (p < 26.85) return { name:'Quarto Crescente', emoji:'🌓', energy:'Ação',        influence:'decisão',      powerNumbers:[5,14,23,41] };
  if (p < 48.1)  return { name:'Gibosa Crescente', emoji:'🌔', energy:'Refinamento', influence:'ajuste',       powerNumbers:[8,16,33,44] };
  if (p < 51.85) return { name:'Lua Cheia',        emoji:'🌕', energy:'Plenitude',   influence:'abundância',   powerNumbers:[6,15,28,42] };
  if (p < 73.1)  return { name:'Gibosa Minguante', emoji:'🌖', energy:'Gratidão',    influence:'colheita',     powerNumbers:[2,19,37,50] };
  if (p < 76.85) return { name:'Quarto Minguante', emoji:'🌗', energy:'Libertação',  influence:'desapego',     powerNumbers:[4,12,30,55] };
  return                 { name:'Lua Minguante',    emoji:'🌘', energy:'Recolhimento',influence:'introspecção', powerNumbers:[10,20,36,48] };
}

// ══════════════════════════════════════
//  DADOS MÍSTICOS
// ══════════════════════════════════════
const MAJOR_ARCANA = [
  { n:0,  name:'O Louco',           emoji:'🃏', meaning:'Novos começos e confiança no universo', sacred:[1,22,7] },
  { n:1,  name:'O Mago',            emoji:'🎩', meaning:'Poder pessoal e manifestação', sacred:[1,10,19] },
  { n:2,  name:'A Sacerdotisa',     emoji:'🌙', meaning:'Intuição e sabedoria interior', sacred:[2,11,20] },
  { n:3,  name:'A Imperatriz',      emoji:'👑', meaning:'Abundância e fertilidade', sacred:[3,12,30] },
  { n:4,  name:'O Imperador',       emoji:'🏛️', meaning:'Estrutura e estabilidade', sacred:[4,13,40] },
  { n:5,  name:'O Hierofante',      emoji:'📿', meaning:'Tradição e orientação espiritual', sacred:[5,14,23] },
  { n:6,  name:'Os Amantes',        emoji:'💕', meaning:'Escolhas e harmonia', sacred:[6,15,24] },
  { n:7,  name:'O Carro',           emoji:'⚡', meaning:'Vitória e determinação', sacred:[7,16,34] },
  { n:8,  name:'A Força',           emoji:'🦁', meaning:'Coragem e domínio interior', sacred:[8,17,26] },
  { n:9,  name:'O Eremita',         emoji:'🏔️', meaning:'Busca interior e contemplação', sacred:[9,18,27] },
  { n:10, name:'A Roda da Fortuna', emoji:'🎡', meaning:'Destino e mudança de sorte', sacred:[10,28,46] },
  { n:11, name:'A Justiça',         emoji:'⚖️', meaning:'Equilíbrio e verdade', sacred:[11,20,38] },
  { n:12, name:'O Pendurado',       emoji:'🙃', meaning:'Nova perspectiva e pausa', sacred:[12,21,39] },
  { n:13, name:'A Morte',           emoji:'🦋', meaning:'Transformação e renascimento', sacred:[13,31,44] },
  { n:14, name:'A Temperança',      emoji:'🌈', meaning:'Equilíbrio e harmonia', sacred:[14,32,41] },
  { n:15, name:'O Diabo',           emoji:'🔥', meaning:'Libertação e poder material', sacred:[15,33,51] },
  { n:16, name:'A Torre',           emoji:'🌩️', meaning:'Ruptura e revelação', sacred:[16,25,43] },
  { n:17, name:'A Estrela',         emoji:'⭐', meaning:'Esperança e inspiração', sacred:[17,35,53] },
  { n:18, name:'A Lua',             emoji:'🌕', meaning:'Intuição profunda e subconsciente', sacred:[18,27,45] },
  { n:19, name:'O Sol',             emoji:'☀️', meaning:'Sucesso e vitalidade', sacred:[19,37,55] },
  { n:20, name:'O Julgamento',      emoji:'🔔', meaning:'Renascimento e chamado', sacred:[20,29,47] },
  { n:21, name:'O Mundo',           emoji:'🌍', meaning:'Realização e totalidade', sacred:[21,42,60] },
];

const GUARDIAN_ANGELS = [
  { month:1,  name:'Vehuiah',  emoji:'✨', virtue:'Vontade',   message:'Seu anjo ilumina novos caminhos. Confie na força do recomeço.', sacred:[1,11,21,31,41,51] },
  { month:2,  name:'Jeliel',   emoji:'💙', virtue:'Amor',      message:'O amor divino guia suas escolhas. Abra-se para receber.', sacred:[2,12,22,32,42,52] },
  { month:3,  name:'Sitael',   emoji:'🛡️', virtue:'Proteção', message:'Você está protegido. Cada passo é seguro.', sacred:[3,13,23,33,43,53] },
  { month:4,  name:'Elemiah',  emoji:'⚡', virtue:'Poder',     message:'O poder divino flui através de você.', sacred:[4,14,24,34,44,54] },
  { month:5,  name:'Mahasiah', emoji:'🌿', virtue:'Cura',      message:'A cura espiritual precede a sorte material.', sacred:[5,15,25,35,45,55] },
  { month:6,  name:'Lelahel',  emoji:'🌟', virtue:'Luz',       message:'A luz divina revela números ocultos.', sacred:[6,16,26,36,46,56] },
  { month:7,  name:'Achaiah',  emoji:'🙏', virtue:'Paciência', message:'A paciência é a chave da vitória.', sacred:[7,17,27,37,47,57] },
  { month:8,  name:'Cahetel',  emoji:'🌾', virtue:'Colheita',  message:'É tempo de colher bençãos.', sacred:[8,18,28,38,48,58] },
  { month:9,  name:'Haziel',   emoji:'💛', virtue:'Graça',     message:'A graça divina multiplica suas chances.', sacred:[9,19,29,39,49,59] },
  { month:10, name:'Aladiah',  emoji:'🔮', virtue:'Mistério',  message:'Os mistérios do universo se abrem para você.', sacred:[10,20,30,40,50,60] },
  { month:11, name:'Lauviah',  emoji:'🌙', virtue:'Revelação', message:'Sonhos proféticos guiam sua intuição.', sacred:[1,11,22,33,44,55] },
  { month:12, name:'Hahaiah',  emoji:'🕊️', virtue:'Refúgio',  message:'A calma interior atrai prosperidade.', sacred:[2,12,24,36,48,60] },
];

const PLANETS = [
  { day:0, name:'Sol',      emoji:'☀️', element:'Fogo',  sacred:[1,6,19,36,55], influence:'vitalidade e sucesso' },
  { day:1, name:'Lua',      emoji:'🌙', element:'Água',  sacred:[2,7,11,25,43], influence:'intuição e fluxo' },
  { day:2, name:'Marte',    emoji:'♂️', element:'Fogo',  sacred:[3,9,16,27,45], influence:'ação e coragem' },
  { day:3, name:'Mercúrio', emoji:'☿️', element:'Ar',    sacred:[5,14,23,32,50], influence:'comunicação e sorte rápida' },
  { day:4, name:'Júpiter',  emoji:'♃',  element:'Ar',    sacred:[4,12,21,34,48], influence:'expansão e abundância' },
  { day:5, name:'Vênus',    emoji:'♀️', element:'Terra', sacred:[6,15,24,33,42], influence:'harmonia e atração' },
  { day:6, name:'Saturno',  emoji:'♄',  element:'Terra', sacred:[8,17,26,35,53], influence:'disciplina e recompensa' },
];

const ORIXAS_DIA = [
  { day:0, name:'Oxalá',   emoji:'✨', cor:'Branco',           element:'Ar',        sacred:[1,8,16,24,32,40], affirmation:'A paz e a sabedoria iluminam minhas escolhas.' },
  { day:1, name:'Exú',     emoji:'🔥', cor:'Vermelho e Preto', element:'Fogo',      sacred:[3,7,14,21,35,42], affirmation:'Os caminhos se abrem para mim.' },
  { day:2, name:'Ogum',    emoji:'⚔️', cor:'Azul e Verde',    element:'Ferro',     sacred:[2,7,14,21,28,42], affirmation:'Tenho força e coragem para conquistar.' },
  { day:3, name:'Xangô',   emoji:'⚡', cor:'Vermelho e Branco',element:'Trovão',   sacred:[6,12,18,24,36,48], affirmation:'A justiça divina age a meu favor.' },
  { day:4, name:'Oxóssi',  emoji:'🏹', cor:'Verde',            element:'Mata',      sacred:[3,9,15,21,33,45], affirmation:'Minha mira é certeira.' },
  { day:5, name:'Oxum',    emoji:'💛', cor:'Amarelo e Dourado', element:'Água Doce', sacred:[5,10,15,25,30,50], affirmation:'A prosperidade flui como as águas do rio.' },
  { day:6, name:'Iemanjá', emoji:'🌊', cor:'Azul e Branco',    element:'Mar',       sacred:[2,8,16,22,34,46], affirmation:'As ondas do destino me levam ao meu bem maior.' },
];

const ORIXAS_NASCIMENTO = [
  { months:[1],  name:'Oxalá',    emoji:'✨' },
  { months:[2],  name:'Iemanjá',  emoji:'🌊' },
  { months:[3],  name:'Ogum',     emoji:'⚔️' },
  { months:[4],  name:'Xangô',   emoji:'⚡' },
  { months:[5],  name:'Oxóssi',   emoji:'🏹' },
  { months:[6],  name:'Oxum',     emoji:'💛' },
  { months:[7],  name:'Exú',      emoji:'🔥' },
  { months:[8],  name:'Obaluaiê', emoji:'🌿' },
  { months:[9],  name:'Oxum',     emoji:'💛' },
  { months:[10], name:'Iansã',    emoji:'🌪️' },
  { months:[11], name:'Nanã',     emoji:'🪻' },
  { months:[12], name:'Oxalá',    emoji:'✨' },
];

// ══════════════════════════════════════
//  GERADOR BASE
// ══════════════════════════════════════
function fillNumbers(initialNums, pick, range, seed, minNum) {
  if (minNum === undefined) minNum = 1;
  const maxNum = minNum === 0 ? range - 1 : range;
  const totalRange = maxNum - minNum + 1;
  const used = new Set(initialNums.filter(function(n) { return n >= minNum && n <= maxNum; }));
  const result = Array.from(used);
  var i = 0;
  while (result.length < pick && i < 2000) {
    var n = Math.floor(seededRandom(seed + result.length * 13 + i * 7) * totalRange) + minNum;
    if (!used.has(n)) { result.push(n); used.add(n); }
    i++;
  }
  return result.sort(function(a, b) { return a - b; }).slice(0, pick);
}

function buildPressupostos(numbers, minNum, maxNum) {
  var mid = Math.floor((minNum + maxNum) / 2);
  return {
    pares: numbers.filter(function(n) { return n % 2 === 0; }).length,
    impares: numbers.filter(function(n) { return n % 2 !== 0; }).length,
    baixos: numbers.filter(function(n) { return n <= mid; }).length,
    altos: numbers.filter(function(n) { return n > mid; }).length,
    soma: numbers.reduce(function(a, b) { return a + b; }, 0),
  };
}

// ══════════════════════════════════════
//  ALGORITMO 1: TAROT
// ══════════════════════════════════════
function generateTarot(birthDate, lotteryKey) {
  var lottery = LOTTERIES[lotteryKey];
  var minNum = lotteryKey === 'lotomania' ? 0 : 1;
  var maxNum = lotteryKey === 'lotomania' ? 99 : lottery.range;
  var today = new Date();
  var lifeNum = calcLifeNumber(birthDate);
  var moon = getMoonPhase();
  var baseSeed = lifeNum * 777 + today.getDate() * 31 + (today.getMonth() + 1) * 13 + today.getFullYear();

  var deck = MAJOR_ARCANA.slice();
  var cards = [];
  for (var c = 0; c < 3; c++) {
    var idx = Math.floor(seededRandom(baseSeed + c * 97) * deck.length);
    cards.push(deck.splice(idx, 1)[0]);
  }

  var sacredNums = [];
  cards.forEach(function(card) {
    card.sacred.forEach(function(n) {
      var mapped = ((n - 1) % (maxNum - minNum + 1)) + minNum;
      if (sacredNums.indexOf(mapped) === -1) sacredNums.push(mapped);
    });
  });
  var arcanaSum = cards.reduce(function(a, c) { return a + c.n; }, 0);
  var bonusNum = (arcanaSum % (maxNum - minNum + 1)) + minNum;
  if (sacredNums.indexOf(bonusNum) === -1) sacredNums.push(bonusNum);

  var numbers = fillNumbers(sacredNums, lottery.pick, lottery.range, baseSeed + 333, minNum);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'tarot',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      cards: cards.map(function(c) { return { name: c.name, number: c.n, emoji: c.emoji, meaning: c.meaning }; }),
      spread: 'Passado · Presente · Futuro',
    },
  };
}

// ══════════════════════════════════════
//  ALGORITMO 2: NUMEROLOGIA
// ══════════════════════════════════════
function generateNumerologia(birthDate, lotteryKey, fullName) {
  var lottery = LOTTERIES[lotteryKey];
  var minNum = lotteryKey === 'lotomania' ? 0 : 1;
  var maxNum = lotteryKey === 'lotomania' ? 99 : lottery.range;
  var today = new Date();
  var lifeNum = calcLifeNumber(birthDate);
  var nameNum = calcNameNumber(fullName || 'oraculo');
  var dayVib = dayVibration();
  var persYear = personalYear(birthDate);
  var moon = getMoonPhase();

  var baseSeed = lifeNum * 1111 + nameNum * 222 + dayVib * 33 + persYear * 4 + today.getDate() * 50;

  var coreNums = [];
  for (var m = 1; m <= 8; m++) {
    var n = ((lifeNum * m) % (maxNum - minNum + 1)) + minNum;
    if (coreNums.indexOf(n) === -1) coreNums.push(n);
  }
  var nameInfluence = ((nameNum * dayVib) % (maxNum - minNum + 1)) + minNum;
  if (coreNums.indexOf(nameInfluence) === -1) coreNums.push(nameInfluence);
  var yearInfluence = ((persYear * lifeNum) % (maxNum - minNum + 1)) + minNum;
  if (coreNums.indexOf(yearInfluence) === -1) coreNums.push(yearInfluence);

  var numbers = fillNumbers(coreNums, lottery.pick, lottery.range, baseSeed + 555, minNum);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'numerologia',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      lifeNumber: lifeNum, nameNumber: nameNum, dayVibration: dayVib, personalYear: persYear,
      interpretation: 'Número de Vida ' + lifeNum + ', Vibração do Nome ' + nameNum + ', Ano Pessoal ' + persYear + ' e Vibração do Dia ' + dayVib + ' criaram uma frequência única.',
    },
  };
}

// ══════════════════════════════════════
//  ALGORITMO 3: ANJOS DA GUARDA
// ══════════════════════════════════════
function generateAnjos(birthDate, lotteryKey) {
  var lottery = LOTTERIES[lotteryKey];
  var minNum = lotteryKey === 'lotomania' ? 0 : 1;
  var maxNum = lotteryKey === 'lotomania' ? 99 : lottery.range;
  var today = new Date();
  var lifeNum = calcLifeNumber(birthDate);
  var moon = getMoonPhase();
  var birthMonth = parseInt(birthDate.split('-')[1]);
  var angel = GUARDIAN_ANGELS[birthMonth - 1] || GUARDIAN_ANGELS[0];

  var baseSeed = lifeNum * 999 + birthMonth * 72 + today.getDate() * 44 + today.getMonth() * 12;

  var angelNums = angel.sacred.map(function(n) { return ((n - 1) % (maxNum - minNum + 1)) + minNum; });
  var angelicSeqs = [11,22,33,44,55].filter(function(n) { return n >= minNum && n <= maxNum; });
  var seqPick = angelicSeqs[Math.floor(seededRandom(baseSeed + 72) * angelicSeqs.length)];
  if (seqPick && angelNums.indexOf(seqPick) === -1) angelNums.push(seqPick);

  moon.powerNumbers.forEach(function(n) {
    var mapped = ((n - 1) % (maxNum - minNum + 1)) + minNum;
    if (angelNums.indexOf(mapped) === -1) angelNums.push(mapped);
  });

  var numbers = fillNumbers(angelNums, lottery.pick, lottery.range, baseSeed + 144, minNum);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'anjos',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      angel: { name: angel.name, emoji: angel.emoji, virtue: angel.virtue, message: angel.message },
      angelicNumber: seqPick,
    },
  };
}

// ══════════════════════════════════════
//  ALGORITMO 4: PLANETÁRIA
// ══════════════════════════════════════
function generatePlanetaria(birthDate, lotteryKey, location) {
  var lottery = LOTTERIES[lotteryKey];
  var minNum = lotteryKey === 'lotomania' ? 0 : 1;
  var maxNum = lotteryKey === 'lotomania' ? 99 : lottery.range;
  var today = new Date();
  var lifeNum = calcLifeNumber(birthDate);
  var moon = getMoonPhase();
  var planet = PLANETS[today.getDay()];
  var hour = today.getHours();
  var planetaryHourIdx = Math.floor((hour / 24) * 7);
  var planetaryHour = PLANETS[planetaryHourIdx];

  var locSeed = location ? Math.round((location.latitude || 0) * 100 + (location.longitude || 0) * 10) : 42;
  var baseSeed = lifeNum * 365 + today.getDay() * 777 + hour * 60 + today.getDate() * 31 + locSeed;

  var planetNums = planet.sacred.slice();
  planetaryHour.sacred.forEach(function(n) { if (planetNums.indexOf(n) === -1) planetNums.push(n); });
  var mappedNums = planetNums.map(function(n) { return ((n - 1) % (maxNum - minNum + 1)) + minNum; });

  var numbers = fillNumbers(mappedNums, lottery.pick, lottery.range, baseSeed + 777, minNum);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'planetaria',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      rulingPlanet: { name: planet.name, emoji: planet.emoji, element: planet.element, influence: planet.influence },
      planetaryHour: { name: planetaryHour.name, emoji: planetaryHour.emoji },
      alignment: planet.name === planetaryHour.name
        ? 'Alinhamento Perfeito! Planeta regente e hora planetária coincidem.'
        : 'Combinação de ' + planet.name + ' (dia) com ' + planetaryHour.name + ' (hora).',
    },
  };
}

// ══════════════════════════════════════
//  ALGORITMO 5: ORIXÁS
// ══════════════════════════════════════
function generateOrixas(birthDate, lotteryKey) {
  var lottery = LOTTERIES[lotteryKey];
  var minNum = lotteryKey === 'lotomania' ? 0 : 1;
  var maxNum = lotteryKey === 'lotomania' ? 99 : lottery.range;
  var today = new Date();
  var lifeNum = calcLifeNumber(birthDate);
  var moon = getMoonPhase();
  var dayOrixa = ORIXAS_DIA[today.getDay()];
  var birthMonth = parseInt(birthDate.split('-')[1]);
  var birthOrixaData = ORIXAS_NASCIMENTO[birthMonth - 1] || ORIXAS_NASCIMENTO[0];
  var birthOrixa = ORIXAS_DIA.find(function(o) { return o.name === birthOrixaData.name; }) || dayOrixa;

  var baseSeed = lifeNum * 444 + today.getDay() * 100 + birthMonth * 33 + today.getDate() * 16;

  var orixaNums = dayOrixa.sacred.slice();
  birthOrixa.sacred.forEach(function(n) { if (orixaNums.indexOf(n) === -1) orixaNums.push(n); });
  var mappedNums = orixaNums.map(function(n) { return ((n - 1) % (maxNum - minNum + 1)) + minNum; });

  moon.powerNumbers.forEach(function(n) {
    var mapped = ((n - 1) % (maxNum - minNum + 1)) + minNum;
    if (mappedNums.indexOf(mapped) === -1) mappedNums.push(mapped);
  });

  var numbers = fillNumbers(mappedNums, lottery.pick, lottery.range, baseSeed + 888, minNum);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'orixas',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      dayOrixa: { name: dayOrixa.name, emoji: dayOrixa.emoji, cor: dayOrixa.cor, element: dayOrixa.element, affirmation: dayOrixa.affirmation },
      birthOrixa: { name: birthOrixa.name, emoji: birthOrixaData.emoji, cor: birthOrixa.cor, element: birthOrixa.element },
      combinedMessage: 'A energia de ' + dayOrixa.name + ' (regente do dia) combinada com ' + birthOrixa.name + ' (seu orixá de nascimento) canaliza uma força espiritual única.',
    },
  };
}

// ══════════════════════════════════════
//  DISPATCHER PRINCIPAL
// ══════════════════════════════════════
export function generateMysticNumbers(birthDate, lotteryKey, feature, options) {
  if (!options) options = {};
  switch (feature) {
    case 'tarot':       return generateTarot(birthDate, lotteryKey);
    case 'numerologia': return generateNumerologia(birthDate, lotteryKey, options.fullName);
    case 'anjos':       return generateAnjos(birthDate, lotteryKey);
    case 'planetaria':  return generatePlanetaria(birthDate, lotteryKey, options.location);
    case 'orixas':      return generateOrixas(birthDate, lotteryKey);
    default:            return generateTarot(birthDate, lotteryKey);
  }
}
