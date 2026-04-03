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
//  BALIZAMENTOS ESTATÍSTICOS POR LOTERIA
// ══════════════════════════════════════
const LOTTERY_CONSTRAINTS = {
  megasena:   { paresMin:2, paresMax:4, baixosMin:2, baixosMax:4, somaMin:135, somaMax:230, maxConsecutivos:3, midPoint:30 },
  lotofacil:  { paresMin:6, paresMax:8, baixosMin:5, baixosMax:9, somaMin:175, somaMax:215, maxConsecutivos:4, midPoint:13 },
  quina:      { paresMin:1, paresMax:3, baixosMin:1, baixosMax:3, somaMin:145, somaMax:260, maxConsecutivos:3, midPoint:40 },
  lotomania:  { paresMin:22, paresMax:28, baixosMin:22, baixosMax:28, somaMin:2315, somaMax:2635, maxConsecutivos:6, midPoint:49 },
  duplasena:  { paresMin:2, paresMax:4, baixosMin:2, baixosMax:4, somaMin:115, somaMax:190, maxConsecutivos:3, midPoint:25 },
  timemania:  { paresMin:2, paresMax:4, baixosMin:2, baixosMax:4, somaMin:215, somaMax:350, maxConsecutivos:3, midPoint:40 },
  diadesorte: { paresMin:2, paresMax:4, baixosMin:2, baixosMax:4, somaMin:85, somaMax:140, maxConsecutivos:3, midPoint:16 },
};

function hasConsecutiveRun(nums, maxRun) {
  var sorted = nums.slice().sort(function(a, b) { return a - b; });
  var run = 1;
  for (var i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) { run++; if (run > maxRun) return true; }
    else { run = 1; }
  }
  return false;
}

function validateConstraints(numbers, lotteryKey) {
  var c = LOTTERY_CONSTRAINTS[lotteryKey];
  if (!c) return true;
  var pares = 0, baixos = 0, soma = 0;
  for (var i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0) pares++;
    if (numbers[i] <= c.midPoint) baixos++;
    soma += numbers[i];
  }
  if (pares < c.paresMin || pares > c.paresMax) return false;
  if (baixos < c.baixosMin || baixos > c.baixosMax) return false;
  if (soma < c.somaMin || soma > c.somaMax) return false;
  if (hasConsecutiveRun(numbers, c.maxConsecutivos)) return false;
  return true;
}

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
function fillNumbers(initialNums, pick, range, seed, minNum, lotteryKey) {
  if (minNum === undefined) minNum = 1;
  var maxNum = minNum === 0 ? range - 1 : range;
  var totalRange = maxNum - minNum + 1;
  var maxAttempts = 50;
  var lastResult;
  for (var attempt = 0; attempt < maxAttempts; attempt++) {
    var used = new Set(initialNums.filter(function(n) { return n >= minNum && n <= maxNum; }));
    var result = Array.from(used);
    var attemptSeed = seed + attempt * 997;
    var i = 0;
    while (result.length < pick && i < 2000) {
      var n = Math.floor(seededRandom(attemptSeed + result.length * 13 + i * 7) * totalRange) + minNum;
      if (!used.has(n)) { result.push(n); used.add(n); }
      i++;
    }
    lastResult = result.sort(function(a, b) { return a - b; }).slice(0, pick);
    if (validateConstraints(lastResult, lotteryKey)) return lastResult;
  }
  return lastResult;
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
var TAROT_DETAILS = {
  0:  { insight: "O Louco representa o salto de fe no desconhecido. Sua energia abre portas que a logica nao alcanca. Os numeros que emergem desta carta carregam a vibração do novo, do inesperado e do potencial infinito.", advice: "Confie na sua intuicao hoje — o universo conspira a seu favor." },
  1:  { insight: "O Mago canaliza todas as forcas do universo em uma unica direção. Ele domina os quatro elementos e transforma vontade em realidade. Os numeros revelados aqui possuem o poder da manifestação consciente.", advice: "Concentre sua intencao antes de jogar — a clareza mental amplifica sua sorte." },
  2:  { insight: "A Sacerdotisa guarda os misterios entre o visivel e o invisivel. Ela sussurra verdades que so a alma compreende. Os numeros desta carta vem do reino da intuicao pura, alem da razao.", advice: "Preste atencao aos seus sonhos e pressentimentos nas proximas horas." },
  3:  { insight: "A Imperatriz e a mae cosmica, fonte de toda abundancia. Sua energia fertiliza cada numero com a forca da criacao. Esta carta indica um momento propicio para a prosperidade material.", advice: "A generosidade atrai mais abundancia — compartilhe sua sorte." },
  4:  { insight: "O Imperador traz a estrutura e a ordem divina ao caos. Seus numeros sao pilares solidos, construidos sobre a sabedoria da experiencia. Esta carta indica estabilidade nos resultados.", advice: "Seja disciplinado e estrategico na sua aposta." },
  5:  { insight: "O Hierofante conecta voce a sabedoria ancestral e as tradicoes sagradas. Os numeros que ele revela carregam a bencao dos mestres espirituais e a forca da fe.", advice: "Busque orientacao interior antes de tomar decisoes." },
  6:  { insight: "Os Amantes representam a uniao perfeita entre opostos. Esta carta harmoniza energias complementares, criando combinacoes poderosas. Os numeros refletem o equilibrio cosmico.", advice: "Siga seu coracao — a escolha certa ja esta dentro de voce." },
  7:  { insight: "O Carro avanca com determinacao inabalavel rumo a vitoria. Seus numeros carregam a energia do triunfo sobre obstaculos. Esta carta indica que o momento e de acao decisiva.", advice: "Mantenha o foco e a determinacao — a vitoria esta proxima." },
  8:  { insight: "A Forca nao e brutal, mas gentil. E o dominio sereno sobre os instintos. Os numeros desta carta possuem uma resiliencia interior que supera qualquer adversidade.", advice: "A paciencia e a coragem silenciosa sao suas maiores aliadas." },
  9:  { insight: "O Eremita ilumina o caminho com sua lanterna interior. Ele busca a verdade nas profundezas da alma. Os numeros revelados aqui vem de uma sabedoria contemplativa e profunda.", advice: "Reserve um momento de silencio antes de jogar — a resposta vem do interior." },
  10: { insight: "A Roda da Fortuna gira sem cessar, trazendo mudancas inevitaveis. Esta e a carta mais diretamente ligada ao destino e a sorte. Os numeros emergem do proprio giro cosmico.", advice: "O ciclo esta a seu favor — aproveite este momento de transformacao positiva." },
  11: { insight: "A Justica pesa cada acao e cada intencao na sua balanca cosmica. Os numeros que ela revela carregam o karma positivo acumulado. Esta carta indica que voce merece o que esta por vir.", advice: "Jogue com integridade e o universo retribuira." },
  12: { insight: "O Pendurado ve o mundo de uma perspectiva invertida, revelando verdades ocultas. Seus numeros vem de angulos inesperados, combinacoes que a mente comum nao consideraria.", advice: "Abra-se para possibilidades incomuns — a sorte pode vir de onde menos espera." },
  13: { insight: "A Morte nao e o fim, mas a grande transformacao. Ela limpa o antigo para dar espaco ao novo. Os numeros desta carta representam renascimento e renovacao total.", advice: "Deixe ir o que nao serve mais — a transformacao traz novas oportunidades." },
  14: { insight: "A Temperanca mistura elementos opostos com maestria divina, criando harmonia perfeita. Os numeros refletem esse equilibrio sutil entre forcas cosmicas.", advice: "O equilibrio e a moderacao amplificam sua conexao com a sorte." },
  15: { insight: "O Diabo revela o poder material em sua forma mais intensa. Esta carta liberta energias presas e canaliza ambicao em resultados concretos. Os numeros pulsam com forca terrena.", advice: "Use sua determinacao material a seu favor, mas sem apego ao resultado." },
  16: { insight: "A Torre derruba ilusoes com a forca de um relampago divino. Seus numeros surgem da ruptura com padroes antigos, abrindo caminho para revelacoes surpreendentes.", advice: "Nao tema as mudancas subitas — elas limpam o caminho para algo maior." },
  17: { insight: "A Estrela derrama esperanca e inspiracao sobre voce. Esta e uma das cartas mais auspiciosas para jogos de sorte. Os numeros brilham com a luz da orientacao celeste.", advice: "Confie — o universo esta enviando sinais claros. Este e um momento especial." },
  18: { insight: "A Lua ilumina os recantos mais profundos do subconsciente. Seus numeros emergem dos sonhos, da intuicao e das marés cosmicas que governam o invisivel.", advice: "Deixe a intuicao guiar suas escolhas — o racional nem sempre enxerga a verdade." },
  19: { insight: "O Sol irradia vitalidade, sucesso e clareza absoluta. Esta carta banha seus numeros em luz dourada, carregando-os com a energia mais positiva do Tarot.", advice: "A energia esta no auge — aproveite este momento radiante com confianca." },
  20: { insight: "O Julgamento soa a trombeta do despertar cosmico. Esta carta chama voce para um proposito maior. Os numeros revelados carregam a forca de um chamado divino.", advice: "Ouça a voz interior — ela esta mais clara do que nunca." },
  21: { insight: "O Mundo representa a realizacao suprema, o ciclo completo. Esta e a carta da totalidade e da plenitude cosmica. Os numeros refletem a harmonia do universo inteiro.", advice: "Voce esta alinhado com o cosmos — a completude atrai abundancia." },
};

function buildTarotNarrative(cards, lifeNum, moon) {
  var past = TAROT_DETAILS[cards[0].n] || {};
  var present = TAROT_DETAILS[cards[1].n] || {};
  var future = TAROT_DETAILS[cards[2].n] || {};
  var narrative = "A tiragem revelou uma jornada profunda: no Passado, " + cards[0].name + " mostra que " + (past.insight || cards[0].meaning).toLowerCase().slice(0, -1) + ". ";
  narrative += "No Presente, " + cards[1].name + " indica que " + (present.insight || cards[1].meaning).toLowerCase().slice(0, -1) + ". ";
  narrative += "No Futuro, " + cards[2].name + " revela que " + (future.insight || cards[2].meaning).toLowerCase().slice(0, -1) + ". ";
  narrative += "Com seu Numero de Vida " + lifeNum + " sob a " + moon.name + ", a energia de " + moon.influence + " amplifica esta leitura.";
  return { narrative: narrative, advice: future.advice || "Confie na sabedoria do Tarot." };
}

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

  var numbers = fillNumbers(sacredNums, lottery.pick, lottery.range, baseSeed + 333, minNum, lotteryKey);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'tarot',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      cards: cards.map(function(c) { return { name: c.name, number: c.n, emoji: c.emoji, meaning: c.meaning }; }),
      spread: 'Passado \u00b7 Presente \u00b7 Futuro',
      tarotNarrative: buildTarotNarrative(cards, lifeNum, moon),
    },
  };
}

// ══════════════════════════════════════
//  ALGORITMO 2: NUMEROLOGIA
// ══════════════════════════════════════
var LIFE_NUMBER_DETAILS = {
  1: { essence: "Lider nato e pioneiro", insight: "O numero 1 vibra com a energia da criacao original. Voce possui uma forca interior que atrai numeros de inicio e conquista. Sua independencia e determinacao se refletem em combinacoes ousadas e inovadoras." },
  2: { essence: "Diplomata e intuitivo", insight: "O numero 2 pulsa com sensibilidade e cooperacao. Sua intuicao refinada capta frequencias sutis que outros nao percebem. Os numeros que emergem da sua vibracao buscam harmonia e equilibrio perfeito." },
  3: { essence: "Criativo e expressivo", insight: "O numero 3 irradia alegria e criatividade cosmica. Sua energia expansiva atrai combinacoes vibrantes e otimistas. A comunicacao com o universo flui naturalmente atraves da sua expressao artistica." },
  4: { essence: "Construtor e estavel", insight: "O numero 4 representa a base solida sobre a qual a sorte se constroi. Sua disciplina e persistencia criam um campo energetico que favorece resultados consistentes e confiaveis." },
  5: { essence: "Aventureiro e livre", insight: "O numero 5 vibra com mudanca e liberdade. Sua energia dinamica atrai o inesperado e o surpreendente. Os numeros que ressoam com voce carregam a vibracao da aventura e das oportunidades imprevistas." },
  6: { essence: "Harmonizador e protetor", insight: "O numero 6 emana amor e responsabilidade. Sua vibracao cria um campo de protecao que atrai numeros equilibrados e harmoniosos. A energia do lar e da familia fortalece suas escolhas." },
  7: { essence: "Mistico e analitico", insight: "O numero 7 e o mais espiritual de todos. Sua conexao com o invisivel e profunda e natural. Os numeros que emergem carregam sabedoria ancestral e a forca da contemplacao mistica." },
  8: { essence: "Poderoso e abundante", insight: "O numero 8 vibra com poder material e realizacao. O simbolo do infinito em sua essencia indica ciclos de abundancia sem fim. Seus numeros carregam a energia da prosperidade concreta." },
  9: { essence: "Humanitario e sabio", insight: "O numero 9 encerra todos os outros em si, representando completude e sabedoria universal. Sua vibracao altruista atrai numeros carregados de proposito e significado cosmico." },
  11: { essence: "Mestre intuitivo", insight: "O numero mestre 11 possui uma antena cosmica amplificada. Sua intuicao e quase profetica, captando sinais que transcendem o racional. Os numeros revelados vibram numa frequencia espiritual elevada." },
  22: { essence: "Mestre construtor", insight: "O numero mestre 22 combina visao espiritual com poder de manifestacao material. Voce pode transformar sonhos em realidade. Os numeros que emergem carregam um potencial extraordinario de concretizacao." },
  33: { essence: "Mestre curador", insight: "O numero mestre 33 e o mais raro e poderoso. Sua vibracao de compaixao cosmica atrai numeros imbuidos de graca divina e proposito transcendente." },
};

function buildNumeroInterpretation(lifeNum, nameNum, dayVib, persYear) {
  var detail = LIFE_NUMBER_DETAILS[lifeNum] || LIFE_NUMBER_DETAILS[lifeNum > 9 ? 9 : lifeNum] || {};
  var intro = detail.insight || "Sua vibracao numerologica e unica.";
  var analysis = " A Vibracao do Nome (" + nameNum + ") reforca ";
  if (nameNum <= 3) analysis += "sua capacidade criativa e comunicativa. ";
  else if (nameNum <= 6) analysis += "sua estabilidade e senso de responsabilidade. ";
  else analysis += "sua profundidade analitica e espiritual. ";
  analysis += "No Ano Pessoal " + persYear + ", ";
  if (persYear <= 3) analysis += "voce esta num ciclo de novos comecos e expansao. ";
  else if (persYear <= 6) analysis += "voce esta num ciclo de construcao e consolidacao. ";
  else analysis += "voce esta num ciclo de colheita e reflexao profunda. ";
  analysis += "A Vibracao do Dia (" + dayVib + ") adiciona uma camada de energia ";
  if (dayVib <= 3) analysis += "criativa e expansiva ao momento.";
  else if (dayVib <= 6) analysis += "estavel e protetora ao momento.";
  else analysis += "mistica e contemplativa ao momento.";
  return { essence: detail.essence || "Vibracao unica", fullInsight: intro + analysis };
}

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

  var numbers = fillNumbers(coreNums, lottery.pick, lottery.range, baseSeed + 555, minNum, lotteryKey);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'numerologia',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      lifeNumber: lifeNum, nameNumber: nameNum, dayVibration: dayVib, personalYear: persYear,
      interpretation: buildNumeroInterpretation(lifeNum, nameNum, dayVib, persYear),
    },
  };
}

// ══════════════════════════════════════
//  ALGORITMO 3: ANJOS DA GUARDA
// ══════════════════════════════════════
var ANGEL_DETAILS = {
  Vehuiah:  { prayer: "Vehuiah, ilumina meus caminhos com a chama da vontade divina.", deepMsg: "Vehuiah e o anjo do impulso criador, o primeiro raio de luz que rasga a escuridao. Sua presenca ativa a forca de vontade mais profunda, aquela que transforma intencao em destino. Quando Vehuiah guia seus numeros, eles carregam a energia dos novos comecos e da coragem para trilhar caminhos nunca percorridos." },
  Jeliel:   { prayer: "Jeliel, envolve-me no manto do amor incondicional.", deepMsg: "Jeliel e o anjo do amor sagrado e da fidelidade cosmica. Sua energia harmoniza as vibracoes ao redor, criando um campo de recepcao para as bencaos do universo. Os numeros que emergem sob sua guarda vibram com a frequencia do coracao aberto." },
  Sitael:   { prayer: "Sitael, ergue teu escudo de luz sobre minha jornada.", deepMsg: "Sitael e o anjo construtor, aquele que transforma adversidades em oportunidades. Sua protecao vai alem do fisico — ele blinda suas intencoes contra energias dispersivas. Cada numero revelado sob Sitael carrega a forca de uma fortaleza espiritual." },
  Elemiah:  { prayer: "Elemiah, concede-me o poder da transformacao sagrada.", deepMsg: "Elemiah e o anjo do poder divino e da justica cosmica. Ele revela caminhos ocultos e desfaz bloqueios energeticos que impedem a abundancia. Seus numeros pulsam com a forca da renovacao e do merecimento espiritual." },
  Mahasiah: { prayer: "Mahasiah, cura minha alma e abre espaco para a prosperidade.", deepMsg: "Mahasiah e o anjo da cura e da retificacao. Ele purifica o campo energetico, removendo padroes negativos que bloqueiam a sorte. Os numeros canalizados por Mahasiah emergem de um espaco limpo e renovado, prontos para atrair o melhor." },
  Lelahel:  { prayer: "Lelahel, banhe-me na tua luz curativa e reveladora.", deepMsg: "Lelahel e o anjo da luz divina que penetra todos os veus. Sua energia ilumina numeros que permaneciam ocultos nas sombras da probabilidade. Sob sua influencia, a clareza espiritual guia cada escolha com precisao celeste." },
  Achaiah:  { prayer: "Achaiah, ensina-me a paciencia que precede toda grande vitoria.", deepMsg: "Achaiah e o anjo da paciencia sagrada e dos segredos da natureza. Ele revela que o tempo certo e tao importante quanto os numeros certos. Sua energia sincroniza suas escolhas com os ciclos cosmicos, alinhando oportunidade e preparacao." },
  Cahetel:  { prayer: "Cahetel, abencoa esta colheita com tua generosidade infinita.", deepMsg: "Cahetel e o anjo da colheita abundante e das bencaos materiais. Sua energia conecta o esforco terreno com a recompensa divina. Os numeros que fluem sob Cahetel carregam a vibracao da prosperidade merecida e da gratidao cosmica." },
  Haziel:   { prayer: "Haziel, derrama tua graca sobre minhas escolhas.", deepMsg: "Haziel e o anjo da graca, do perdao e da misericordia infinita. Sua energia dissolve resistencias e abre canais de recepcao que estavam bloqueados. Sob Haziel, os numeros fluem com naturalidade, como presentes de um universo generoso." },
  Aladiah:  { prayer: "Aladiah, revela-me os misterios que conduzem a abundancia.", deepMsg: "Aladiah e o anjo dos misterios ocultos e da regeneracao espiritual. Ele atua nas camadas mais profundas da consciencia, trazendo a tona numeros que ressoam com verdades universais. Sua energia e de revelacao e despertar." },
  Lauviah:  { prayer: "Lauviah, abre meus olhos interiores para as revelacoes da noite.", deepMsg: "Lauviah e o anjo das revelacoes noturnas e da sabedoria oculta. Seus numeros podem surgir em sonhos, intuicoes subitas ou lampadas de inspiracao. A conexao com Lauviah intensifica a percepcao extrassensorial e a receptividade aos sinais do universo." },
  Hahaiah:  { prayer: "Hahaiah, concede-me a serenidade que atrai a fortuna.", deepMsg: "Hahaiah e o anjo do refugio interior e da paz profunda. Sua energia cria um espaco de calma onde a mente pode captar as frequencias mais sutis da sorte. Os numeros revelados sob Hahaiah emergem do silencio contemplativo, carregados de serenidade e certeza." },
};

function buildAngelMessage(angel, moon, lifeNum) {
  var detail = ANGEL_DETAILS[angel.name] || {};
  var msg = detail.deepMsg || angel.message;
  msg += " Sob a " + moon.name + " (energia de " + moon.influence + "), a conexao com " + angel.name + " se intensifica, amplificando a virtude de " + angel.virtue + " em cada numero revelado.";
  return { fullMessage: msg, prayer: detail.prayer || ("" + angel.name + ", guia meus numeros com tua luz.") };
}

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

  var numbers = fillNumbers(angelNums, lottery.pick, lottery.range, baseSeed + 144, minNum, lotteryKey);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'anjos',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      angel: { name: angel.name, emoji: angel.emoji, virtue: angel.virtue, message: angel.message },
      angelicNumber: seqPick,
      angelNarrative: buildAngelMessage(angel, moon, lifeNum),
    },
  };
}

// ══════════════════════════════════════
//  ALGORITMO 4: PLANETÁRIA
// ══════════════════════════════════════
var PLANET_DETAILS = {
  Sol:      { deepInfluence: "O Sol e o centro do sistema, a fonte de toda vitalidade. Quando rege o dia, seus numeros brilham com a energia do sucesso, da lideranca e da clareza. E o astro mais favoravel para jogos de sorte, pois irradia confianca e poder de manifestacao.", cosmicTip: "Jogue com confianca — a energia solar amplifica suas intencoes." },
  Lua:      { deepInfluence: "A Lua governa o mundo emocional e as mares do destino. Sob sua regencia, a intuicao atinge o pico e os numeros emergem do subconsciente profundo. A Lua conecta voce aos ciclos naturais, revelando padroes ocultos que a mente racional nao alcanca.", cosmicTip: "Confie nos seus pressentimentos — a Lua intensifica sua percepcao." },
  Marte:    { deepInfluence: "Marte e o guerreiro cosmico, trazendo coragem e energia de conquista. Seus numeros pulsam com determinacao e forca bruta. Sob Marte, a acao decisiva e recompensada e a ousadia se transforma em resultados concretos.", cosmicTip: "Seja ousado nas suas escolhas — Marte favorece quem age com determinacao." },
  Mercurio: { deepInfluence: "Mercurio e o mensageiro dos deuses, o planeta da comunicacao rapida e da inteligencia agil. Seus numeros surgem como insights subitos, conexoes inesperadas entre dados aparentemente aleatorios. A velocidade mental e sua aliada.", cosmicTip: "Preste atencao a sinais e coincidencias — Mercurio comunica atraves deles." },
  Jupiter:  { deepInfluence: "Jupiter e o grande benfeitor, o planeta da expansao e da abundancia ilimitada. Sua influencia e a mais generosa do zodiaco, multiplicando as oportunidades e ampliando os horizontes. Numeros sob Jupiter carregam a energia da prosperidade em grande escala.", cosmicTip: "Pense grande — Jupiter expande tudo o que toca, inclusive sua sorte." },
  Venus:    { deepInfluence: "Venus e o planeta da beleza, harmonia e atracao magnetica. Sua energia cria um campo de atracao que puxa os numeros certos na sua direcao. Sob Venus, a sorte vem com graciosidade, como um presente do universo.", cosmicTip: "Cultive gratidao e beleza ao seu redor — Venus responde a vibracoes harmoniosas." },
  Saturno:  { deepInfluence: "Saturno e o mestre do tempo e da disciplina cosmica. Seus numeros sao conquistados, nao dados. Sob Saturno, a recompensa vem para quem demonstrou paciencia e persistencia. E o planeta que transforma esforco em resultados duradouros.", cosmicTip: "A disciplina e a paciencia sao suas chaves — Saturno recompensa quem persevera." },
};

function buildPlanetNarrative(planet, planetaryHour, moon, location) {
  var detail = PLANET_DETAILS[planet.name] || {};
  var narrative = detail.deepInfluence || ("A energia de " + planet.name + " influencia seus numeros hoje.");
  if (planet.name === planetaryHour.name) {
    narrative += " Neste momento especial, planeta regente e hora planetaria coincidem, criando um Alinhamento Perfeito — uma janela cosmica rara onde a energia astral se concentra com intensidade maxima.";
  } else {
    narrative += " A combinacao de " + planet.name + " (regente do dia) com " + planetaryHour.name + " (hora planetaria) cria uma fusao unica de energias: " + planet.element + " encontra " + planetaryHour.element + ", gerando numeros com dupla influencia astral.";
  }
  narrative += " Sob a " + moon.name + ", a energia de " + moon.influence + " amplifica esta configuracao celeste.";
  return { fullNarrative: narrative, cosmicTip: detail.cosmicTip || "Siga a orientacao dos astros." };
}

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

  var numbers = fillNumbers(mappedNums, lottery.pick, lottery.range, baseSeed + 777, minNum, lotteryKey);
  return {
    numbers: numbers, lottery: lottery, lotteryKey: lotteryKey, lifeNumber: lifeNum, moon: moon,
    feature: 'planetaria',
    pressupostos: buildPressupostos(numbers, minNum, maxNum),
    featureData: {
      rulingPlanet: { name: planet.name, emoji: planet.emoji, element: planet.element, influence: planet.influence },
      planetaryHour: { name: planetaryHour.name, emoji: planetaryHour.emoji },
      alignment: planet.name === planetaryHour.name
        ? 'Alinhamento Perfeito! Planeta regente e hora planetária coincidem.'
        : 'Combinacao de ' + planet.name + ' (dia) com ' + planetaryHour.name + ' (hora).',
      planetNarrative: buildPlanetNarrative(planet, planetaryHour, moon, location),
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

  var numbers = fillNumbers(mappedNums, lottery.pick, lottery.range, baseSeed + 888, minNum, lotteryKey);
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
