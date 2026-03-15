import { useState, useEffect, useCallback } from "react";

const WEEKDAY_PT = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const MONTH_PT = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

const LOTTERIES = {
  megasena: { id:"megasena", name:"Mega Sena", pick:6, range:[1,60], color:"#209652", icon:"◆", desc:"6 de 60", defaults:{evenMin:3,evenMax:3,lowSplit:30,lowMin:3,lowMax:3,sumMin:130,sumMax:190}, hasTrevos:false, drawDays:[3,6], drawTime:"20:00" },
  lotofacil: { id:"lotofacil", name:"Lotofácil", pick:15, range:[1,25], color:"#8B1FA0", icon:"◈", desc:"15 de 25", defaults:{evenMin:7,evenMax:8,lowSplit:13,lowMin:7,lowMax:8,sumMin:175,sumMax:215}, hasTrevos:false, drawDays:[1,2,3,4,5,6], drawTime:"20:00" },
  quina: { id:"quina", name:"Quina", pick:5, range:[1,80], color:"#1A4FA0", icon:"◇", desc:"5 de 80", defaults:{evenMin:2,evenMax:3,lowSplit:40,lowMin:2,lowMax:3,sumMin:100,sumMax:280}, hasTrevos:false, drawDays:[1,2,3,4,5,6], drawTime:"20:00" },
  lotomania: { id:"lotomania", name:"Lotomania", pick:50, range:[0,99], color:"#C45A1C", icon:"◉", desc:"50 de 100", defaults:{evenMin:23,evenMax:27,lowSplit:49,lowMin:23,lowMax:27,sumMin:2350,sumMax:2650}, hasTrevos:false, drawDays:[2,5], drawTime:"20:00" },
  milionaria: { id:"milionaria", name:"+Milionária", pick:6, range:[1,50], color:"#B8860B", icon:"✦", desc:"6 de 50 + 2 trevos", defaults:{evenMin:3,evenMax:3,lowSplit:25,lowMin:3,lowMax:3,sumMin:100,sumMax:170}, hasTrevos:true, trevosPick:2, trevosRange:[1,6], drawDays:[6], drawTime:"20:00" },
};

// ═══════════════════════════════════════════════════════════
// OFFICIAL DRAW RESULTS (in production: fetched from Caixa API)
// Recent draws for verification — updated periodically
// ═══════════════════════════════════════════════════════════
const OFFICIAL_DRAWS = [
  // Mega Sena
  {lottery:"megasena",draw:2835,date:"2026-03-15",numbers:[5,17,23,38,41,56]},
  {lottery:"megasena",draw:2834,date:"2026-03-12",numbers:[3,11,29,34,47,58]},
  {lottery:"megasena",draw:2833,date:"2026-03-08",numbers:[8,14,22,35,49,53]},
  {lottery:"megasena",draw:2832,date:"2026-03-05",numbers:[2,19,27,33,44,60]},
  {lottery:"megasena",draw:2831,date:"2026-03-01",numbers:[6,13,25,39,46,57]},
  {lottery:"megasena",draw:2830,date:"2026-02-26",numbers:[10,18,31,37,42,55]},
  {lottery:"megasena",draw:2829,date:"2026-02-22",numbers:[1,15,24,36,48,52]},
  {lottery:"megasena",draw:2828,date:"2026-02-19",numbers:[7,20,28,40,50,59]},
  // Lotofácil
  {lottery:"lotofacil",draw:3352,date:"2026-03-14",numbers:[1,2,4,6,7,8,10,11,14,15,17,19,21,23,25]},
  {lottery:"lotofacil",draw:3351,date:"2026-03-13",numbers:[2,3,5,6,8,9,11,12,14,16,18,20,22,24,25]},
  {lottery:"lotofacil",draw:3350,date:"2026-03-12",numbers:[1,3,4,7,8,10,11,13,15,17,18,20,22,23,25]},
  {lottery:"lotofacil",draw:3349,date:"2026-03-11",numbers:[1,2,5,6,9,10,12,13,15,16,19,21,23,24,25]},
  {lottery:"lotofacil",draw:3348,date:"2026-03-10",numbers:[2,3,4,7,8,11,12,14,15,17,19,20,22,24,25]},
  // Quina
  {lottery:"quina",draw:6645,date:"2026-03-14",numbers:[12,28,35,54,71]},
  {lottery:"quina",draw:6644,date:"2026-03-13",numbers:[7,19,41,56,68]},
  {lottery:"quina",draw:6643,date:"2026-03-12",numbers:[3,22,37,49,75]},
  {lottery:"quina",draw:6642,date:"2026-03-11",numbers:[15,26,44,58,63]},
  {lottery:"quina",draw:6641,date:"2026-03-10",numbers:[8,31,39,52,79]},
  // Lotomania
  {lottery:"lotomania",draw:2730,date:"2026-03-14",numbers:[0,2,5,8,11,14,17,19,22,24,27,30,33,35,38,41,44,47,50,53,55,58,61,64,67,69,71,74,76,79,81,83,85,87,89,91,93,94,95,96,97,98,3,6,9,12,15,18,21,23]},
  {lottery:"lotomania",draw:2729,date:"2026-03-11",numbers:[1,3,7,10,13,16,18,20,23,25,28,31,34,36,39,42,45,48,51,54,56,59,62,65,68,70,72,75,77,80,82,84,86,88,90,92,94,95,96,97,98,99,4,6,9,12,15,19,22,26]},
  // +Milionária
  {lottery:"milionaria",draw:215,date:"2026-03-14",numbers:[4,12,23,31,38,47],trevos:[2,5]},
  {lottery:"milionaria",draw:214,date:"2026-03-07",numbers:[8,15,19,27,35,42],trevos:[1,4]},
  {lottery:"milionaria",draw:213,date:"2026-02-28",numbers:[3,11,22,30,39,48],trevos:[3,6]},
];

// ═══════════════════════════════════════════════════════════
// APP-WIDE WINNING STATS (in production: live from backend)
// ═══════════════════════════════════════════════════════════
const APP_STATS = {
  totalWinningBets: 1847,
  totalPrizeValue: 2_439_872.50,
  highlights: [
    { lottery: "Mega Sena", hits: "5 acertos", prize: "R$ 87.432", date: "08/03/2026" },
    { lottery: "Lotofácil", hits: "14 acertos", prize: "R$ 1.823", date: "12/03/2026" },
    { lottery: "+Milionária", hits: "4 + 1 trevo", prize: "R$ 12.567", date: "14/03/2026" },
  ],
  lastUpdated: "15/03/2026",
};

function getOfficialDraws(lotteryId) {
  return OFFICIAL_DRAWS.filter(d => d.lottery === lotteryId).sort((a,b) => b.draw - a.draw);
}

function verifyGame(gameNumbers, drawNumbers) {
  const hits = gameNumbers.filter(n => drawNumbers.includes(n));
  return { hits, count: hits.length };
}

function verifyHistory(history) {
  const verified = [];
  for (const entry of history) {
    const draws = getOfficialDraws(entry.lotteryId);
    if (!entry.drawDate) continue;
    const entryDrawDate = new Date(entry.drawDate).toISOString().slice(0, 10);
    const matchingDraw = draws.find(d => d.date === entryDrawDate);
    if (!matchingDraw) continue;
    const lot = LOTTERIES[entry.lotteryId];
    for (const game of entry.games) {
      const { hits, count } = verifyGame(game.numbers, matchingDraw.numbers);
      let trevoHits = 0;
      if (lot?.hasTrevos && game.trevos && matchingDraw.trevos) {
        trevoHits = game.trevos.filter(t => matchingDraw.trevos.includes(t)).length;
      }
      verified.push({
        lotteryId: entry.lotteryId,
        lotteryName: entry.lottery,
        drawNum: matchingDraw.draw,
        drawDate: matchingDraw.date,
        userNumbers: game.numbers,
        officialNumbers: matchingDraw.numbers,
        hits, hitCount: count,
        totalPick: lot?.pick || game.numbers.length,
        userTrevos: game.trevos || null,
        officialTrevos: matchingDraw.trevos || null,
        trevoHits,
        sign: entry.sign,
        modules: entry.modules,
      });
    }
  }
  return verified.sort((a, b) => b.hitCount - a.hitCount || b.drawNum - a.drawNum);
}

function getVerificationStats(verified) {
  if (verified.length === 0) return null;
  const totalGames = verified.length;
  const totalHits = verified.reduce((a, v) => a + v.hitCount, 0);
  const totalPossible = verified.reduce((a, v) => a + v.totalPick, 0);
  const bestGame = verified[0];
  const byLottery = {};
  verified.forEach(v => {
    if (!byLottery[v.lotteryId]) byLottery[v.lotteryId] = { games: 0, hits: 0, best: 0 };
    byLottery[v.lotteryId].games++;
    byLottery[v.lotteryId].hits += v.hitCount;
    if (v.hitCount > byLottery[v.lotteryId].best) byLottery[v.lotteryId].best = v.hitCount;
  });
  return { totalGames, totalHits, totalPossible, hitRate: totalHits / totalPossible, bestGame, byLottery };
}

function getNextDrawDate(lot) {
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const c = new Date(now); c.setDate(now.getDate() + i);
    if (lot.drawDays.includes(c.getDay())) {
      if (i === 0) { const [hh] = lot.drawTime.split(":").map(Number); if (now.getHours() >= hh) continue; }
      return c;
    }
  }
  return now;
}
function formatDrawDate(d) { return `${WEEKDAY_PT[d.getDay()]}, ${d.getDate()} de ${MONTH_PT[d.getMonth()]}`; }
function daysUntil(d) { const diff = Math.ceil((d - new Date()) / 86400000); return diff <= 0 ? "hoje" : diff === 1 ? "amanhã" : `em ${diff} dias`; }

const ZODIAC = [
  { name:"Áries",sym:"♈",s:[3,21],e:[4,19],el:"Fogo",planet:"Marte",ruler:"Marte, o guerreiro",base:[1,9,17,25,33,41,49,57,65,73,81,89,97] },
  { name:"Touro",sym:"♉",s:[4,20],e:[5,20],el:"Terra",planet:"Vênus",ruler:"Vênus, deusa da prosperidade",base:[2,6,14,22,36,44,52,60,68,76,84,92] },
  { name:"Gêmeos",sym:"♊",s:[5,21],e:[6,20],el:"Ar",planet:"Mercúrio",ruler:"Mercúrio, o mensageiro",base:[3,5,11,23,35,47,53,63,71,79,87,95] },
  { name:"Câncer",sym:"♋",s:[6,21],e:[7,22],el:"Água",planet:"Lua",ruler:"a Lua, mãe das marés",base:[2,7,11,16,21,25,52,61,67,74,82,90] },
  { name:"Leão",sym:"♌",s:[7,23],e:[8,22],el:"Fogo",planet:"Sol",ruler:"o Sol, rei dos astros",base:[1,4,10,19,28,37,46,55,64,72,80,91] },
  { name:"Virgem",sym:"♍",s:[8,23],e:[9,22],el:"Terra",planet:"Mercúrio",ruler:"Mercúrio, o analítico",base:[5,14,23,32,41,50,59,66,75,83,93,98] },
  { name:"Libra",sym:"♎",s:[9,23],e:[10,22],el:"Ar",planet:"Vênus",ruler:"Vênus, guardiã do equilíbrio",base:[6,15,24,33,42,51,60,69,73,78,86,94] },
  { name:"Escorpião",sym:"♏",s:[10,23],e:[11,21],el:"Água",planet:"Plutão",ruler:"Plutão, senhor da transformação",base:[8,11,18,22,29,45,58,62,70,77,85,99] },
  { name:"Sagitário",sym:"♐",s:[11,22],e:[12,21],el:"Fogo",planet:"Júpiter",ruler:"Júpiter, o grande benéfico",base:[3,9,12,21,34,43,56,61,78,88,96] },
  { name:"Capricórnio",sym:"♑",s:[12,22],e:[1,19],el:"Terra",planet:"Saturno",ruler:"Saturno, mestre do tempo",base:[4,8,13,26,35,44,53,62,70,81,90] },
  { name:"Aquário",sym:"♒",s:[1,20],e:[2,18],el:"Ar",planet:"Urano",ruler:"Urano, o inovador",base:[7,11,16,20,27,38,57,66,74,82,95] },
  { name:"Peixes",sym:"♓",s:[2,19],e:[3,20],el:"Água",planet:"Netuno",ruler:"Netuno, guardião dos mistérios",base:[3,7,12,19,24,36,48,59,69,77,88] },
];

const ANGELS = [
  { name:"Anjo da Prosperidade",attr:"abundância material e bênçãos financeiras",nums:[4,21,39,54],psalm:23 },
  { name:"Anjo da Estabilidade",attr:"proteção, segurança e alicerces firmes",nums:[8,16,32,48],psalm:91 },
  { name:"Anjo da Riqueza",attr:"prosperidade duradoura e fartura",nums:[7,14,28,42],psalm:37 },
  { name:"Anjo da Fortuna",attr:"sorte, oportunidade e caminhos abertos",nums:[3,9,27,36],psalm:112 },
  { name:"Anjo da Abundância",attr:"gratidão, colheita e generosidade divina",nums:[5,15,25,50],psalm:65 },
  { name:"Anjo da Luz",attr:"iluminação espiritual e clareza interior",nums:[1,11,22,44],psalm:27 },
  { name:"Anjo da Sabedoria",attr:"discernimento e escolhas iluminadas",nums:[6,12,18,54],psalm:119 },
  { name:"Anjo da Esperança",attr:"fé renovada e confiança no futuro",nums:[10,20,30,60],psalm:46 },
  { name:"Anjo do Destino",attr:"alinhamento com o propósito divino",nums:[13,26,39,52],psalm:139 },
  { name:"Anjo da Harmonia",attr:"paz interior e equilíbrio cósmico",nums:[2,17,34,51],psalm:133 },
  { name:"Anjo da Vitória",attr:"conquista, triunfo e superação",nums:[19,38,45,57],psalm:144 },
  { name:"Anjo da Graça",attr:"misericórdia e bênçãos inesperadas",nums:[11,23,35,47],psalm:103 },
];

const ORIXAS = [
  { name:"Oxalá",domain:"paz, criação e sabedoria ancestral",nums:[8,16,24,32,40,48,56,64,72,80,88,96] },
  { name:"Iemanjá",domain:"proteção maternal e abundância das águas",nums:[2,7,14,21,28,35,42,49,56,63,70,77] },
  { name:"Oxum",domain:"amor, fertilidade e riqueza dourada",nums:[5,10,15,25,30,45,50,55,65,75,85,95] },
  { name:"Xangô",domain:"justiça, força e poder real",nums:[6,12,18,36,42,54,60,66,78,84,90,96] },
  { name:"Ogum",domain:"coragem, caminhos abertos e luta",nums:[3,7,14,21,28,42,49,56,63,77,84,91] },
  { name:"Iansã",domain:"tempestade, mudança e força feminina",nums:[9,18,27,36,45,54,60,63,72,81,90,99] },
  { name:"Oxóssi",domain:"caça, fartura e conhecimento da mata",nums:[3,4,13,26,39,52,57,61,74,83,87,91] },
  { name:"Nanã",domain:"sabedoria ancestral e ciclos de vida",nums:[1,9,17,23,31,47,55,59,68,73,86,94] },
];

const TAROT = [
  {name:"O Louco",v:0,m:"Novos começos",d:"O salto de fé no desconhecido abre portas inesperadas"},
  {name:"O Mago",v:1,m:"Manifestação",d:"O poder de transformar intenção em realidade"},
  {name:"A Sacerdotisa",v:2,m:"Intuição",d:"A sabedoria oculta que guia sem palavras"},
  {name:"A Imperatriz",v:3,m:"Abundância",d:"A terra fértil que multiplica tudo que recebe"},
  {name:"O Imperador",v:4,m:"Estabilidade",d:"A estrutura sólida sobre a qual se constrói"},
  {name:"O Hierofante",v:5,m:"Tradição",d:"O conhecimento transmitido através das gerações"},
  {name:"Os Amantes",v:6,m:"Escolhas",d:"O momento decisivo que define o caminho"},
  {name:"O Carro",v:7,m:"Vitória",d:"A determinação que supera todos os obstáculos"},
  {name:"A Justiça",v:8,m:"Equilíbrio",d:"A balança cósmica que ajusta todas as contas"},
  {name:"O Eremita",v:9,m:"Sabedoria",d:"A luz interior que ilumina o caminho solitário"},
  {name:"Roda da Fortuna",v:10,m:"Destino",d:"O giro inevitável que traz ciclos de abundância"},
  {name:"A Força",v:11,m:"Coragem",d:"O domínio gentil sobre as forças interiores"},
  {name:"O Enforcado",v:12,m:"Sacrifício",d:"A suspensão que revela novas perspectivas"},
  {name:"A Morte",v:13,m:"Transformação",d:"O fim que é sempre um novo começo"},
  {name:"A Temperança",v:14,m:"Harmonia",d:"A mistura perfeita de opostos complementares"},
  {name:"O Diabo",v:15,m:"Libertação",d:"A quebra das correntes que nos prendem"},
  {name:"A Torre",v:16,m:"Revelação",d:"O relâmpago que destrói para reconstruir melhor"},
  {name:"A Estrela",v:17,m:"Esperança",d:"A promessa de renovação após a tempestade"},
  {name:"A Lua",v:18,m:"Mistério",d:"As verdades ocultas na penumbra do inconsciente"},
  {name:"O Sol",v:19,m:"Sucesso",d:"A plenitude radiante que ilumina tudo ao redor"},
  {name:"O Julgamento",v:20,m:"Renascimento",d:"O chamado que desperta para uma nova vida"},
  {name:"O Mundo",v:21,m:"Completude",d:"A dança final de um ciclo perfeitamente concluído"},
];

const LUNAR = [
  {name:"Lua Nova",mult:1.2,desc:"Renovação",energy:"A Lua Nova planta sementes invisíveis — é o momento de confiar no que ainda não se vê"},
  {name:"Lua Crescente",mult:1.1,desc:"Crescimento",energy:"A Lua Crescente amplifica intenções — a energia cresce como a maré que sobe"},
  {name:"Lua Cheia",mult:1.3,desc:"Plenitude",energy:"A Lua Cheia ilumina o que estava oculto — é o pico da energia mística"},
  {name:"Lua Minguante",mult:0.9,desc:"Reflexão",energy:"A Lua Minguante pede paciência — o recolhimento prepara a próxima expansão"},
];

// ═══ UTILS ═══
function sRng(seed) { let s = Math.abs(seed)||1; return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;}; }
function getSign(d,m) { for(const z of ZODIAC){const[sm,sd]=z.s,[em,ed]=z.e;if(sm<=em){if((m===sm&&d>=sd)||(m===em&&d<=ed)||(m>sm&&m<em))return z;}else{if((m===sm&&d>=sd)||(m===em&&d<=ed)||m>sm||m<em)return z;}}return ZODIAC[9]; }
function lPath(ds) { let s=ds.replace(/\D/g,"").split("").map(Number).reduce((a,b)=>a+b,0);while(s>9&&s!==11&&s!==22&&s!==33)s=String(s).split("").map(Number).reduce((a,b)=>a+b,0);return s; }
function nNum(name) { const m={a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8};let s=name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]/g,"").split("").reduce((a,c)=>a+(m[c]||0),0);while(s>9)s=String(s).split("").map(Number).reduce((a,b)=>a+b,0);return s; }
function lunarPhase(date) { const diff=(date-new Date(2000,0,6))/86400000;const p=((diff%29.53)+29.53)%29.53;return LUNAR[p<7.38?0:p<14.77?1:p<22.15?2:3]; }
function getAngel(d,m) { return ANGELS[((m-1)*30+d)%ANGELS.length]; }
function getOrixa(lp,m) { return ORIXAS[(lp+m)%ORIXAS.length]; }
function getTarot(seed) { return TAROT[seed%TAROT.length]; }

// ═══ CORE ALGORITHM — accumulates ALL influences per number ═══
function generateScores(user, modules, lottery, drawDate) {
  const [lo,hi]=lottery.range, total=hi-lo+1;
  const scores=new Array(total).fill(0);
  const influences={}; // num -> [{source, detail, calc, dateLink, pts}]
  const [yr,mo,dy]=user.birthDate.split("-").map(Number);
  const [hr,mn]=(user.birthTime||"12:00").split(":").map(Number);
  const today=new Date();
  const drawSeed=drawDate.getFullYear()*10000+(drawDate.getMonth()+1)*100+drawDate.getDate();
  const modHash=modules.sort().join("").split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const seed=yr*10000+mo*100+dy+hr*60+mn+drawSeed*7+modHash*31+total*13;
  const rng=sRng(seed);
  const sign=getSign(dy,mo), lp=lPath(user.birthDate);
  const drawDay=WEEKDAY_PT[drawDate.getDay()], drawDayNum=drawDate.getDate(), drawMo=MONTH_PT[drawDate.getMonth()];
  const daysTo=Math.max(0,Math.ceil((drawDate-today)/86400000));
  const birthStr=`${dy}/${mo}/${yr}`;
  const drawStr=`${drawDayNum} de ${drawMo}`;
  const map2r=(v)=>Math.max(0,Math.min(total-1,Math.floor((v/360)*total)));

  const add=(idx,pts,inf)=>{
    if(idx>=0&&idx<total){
      scores[idx]+=pts;
      const num=idx+lo;
      if(inf){
        if(!influences[num])influences[num]=[];
        influences[num].push({...inf,pts});
      }
    }
  };

  // ─── ASTROLOGY ───
  if(modules.includes("astrology")){
    const sunD=((mo-1)*30+dy)*(360/365);
    const tShift=daysTo*0.986;

    const planets=[
      {n:"Sol",d:(sunD+tShift)%360,w:3,role:"a sua essência e vitalidade",speed:"0.986°/dia"},
      {n:"Júpiter",d:(sunD+120+yr%12*30+tShift*0.083)%360,w:4,role:"a expansão e a sorte",speed:"0.083°/dia"},
      {n:"Vênus",d:(sunD+72+mo*15+tShift*1.6)%360,w:3,role:"a prosperidade e a harmonia",speed:"1.6°/dia"},
      {n:"Lua",d:(sunD+hr*15+mn*0.25+tShift*13.2)%360,w:2,role:"a intuição e os ciclos emocionais",speed:"13.2°/dia"},
      {n:"Saturno",d:(sunD+180+yr%29*12.4+tShift*0.033)%360,w:1,role:"a disciplina e o karma",speed:"0.033°/dia"},
    ];

    planets.forEach(p=>{
      const idx=map2r(p.d);
      const num=idx+lo;
      const natalDeg=Math.round((sunD)%360);
      const transitDeg=Math.round(p.d);
      add(idx,p.w*10,{
        source:"Astrologia",
        detail:`${p.n} rege ${p.role}. No seu nascimento (${birthStr}), o Sol natal estava a ${natalDeg}°. ${p.n} transita actualmente a ${transitDeg}°.`,
        calc:`Posição de ${p.n}: ${transitDeg}° ÷ 360° × ${total} posições = posição ${idx} → dezena ${num}. Peso: ${p.w}×10 = ${p.w*10} pontos.`,
        dateLink:`${p.n} avança ${p.speed}. Faltam ${daysTo} dia${daysTo!==1?"s":""} para o sorteio de ${drawStr} — nesse dia ${p.n} terá avançado mais ${Math.round(parseFloat(p.speed)*daysTo*10)/10}°, posicionando a energia exactamente sobre esta dezena.`,
      });
      for(let o=-2;o<=2;o++){
        if(o!==0){
          const adjIdx=idx+o;
          if(adjIdx>=0&&adjIdx<total){
            add(adjIdx,p.w*3,{
              source:"Astrologia",
              detail:`Ressonância orbital de ${p.n}. A influência de ${p.n} a ${transitDeg}° irradia para dezenas adjacentes.`,
              calc:`Dezena principal ${num} ± ${Math.abs(o)} = ${adjIdx+lo}. O campo gravitacional de ${p.n} atribui ${p.w}×3 = ${p.w*3} pontos a dezenas vizinhas.`,
              dateLink:`No dia ${drawStr}, esta adjacência a ${p.n} recebe ${Math.round(p.w*3*100/(p.w*10))}% da energia do planeta regente.`,
            });
          }
        }
      }
    });

    sign.base.forEach((n,bi)=>{
      const idx=n-lo;
      if(idx>=0&&idx<total) add(idx,8,{
        source:"Astrologia",
        detail:`O ${n} é o ${bi+1}º número da constelação de ${sign.name} (${sign.el}), regido por ${sign.ruler}.`,
        calc:`Tabela zodiacal de ${sign.name}: posição ${bi+1} de ${sign.base.filter(x=>x>=lo&&x<=hi).length} números no intervalo [${lo}–${hi}]. Atribui 8 pontos fixos como número ancestral do signo.`,
        dateLink:`Nascido a ${birthStr} sob ${sign.name} — no dia ${drawStr} (${drawDay}), o elemento ${sign.el} entra em ressonância com ${sign.planet}, amplificando os números natais do seu signo.`,
      });
    });
  }

  // ─── NUMEROLOGY ───
  if(modules.includes("numerology")){
    const lv=lp, dn=nNum(user.fullName||"usuario"), py=lPath(`${today.getFullYear()}${mo}${dy}`);
    const digitSum=`${dy}+${mo}+${yr}`.split("").filter(c=>c>="0"&&c<="9").join("+");
    const drawRed=drawDayNum%9||9;

    const srcs=[
      {b:lv,l:"Caminho de Vida",formula:`soma(${birthStr.replace(/\//g,"+")}) reduzida = ${lv}`},
      {b:dn,l:"Destino",formula:`soma pitagórica de "${user.fullName||"nome"}" = ${dn}`},
      {b:py,l:"Ano Pessoal",formula:`soma(${dy}+${mo}+${today.getFullYear()}) reduzida = ${py}`},
    ];

    srcs.forEach((src,bi)=>{
      for(let mult=1;mult<=4;mult++){
        const dOff=(drawDate.getDate()+drawDate.getMonth())%7;
        const idx=((src.b*mult+bi*7+dOff)%total);
        const num=idx+lo;
        add(idx,14-mult*2,{
          source:"Numerologia",
          detail:`${src.l}: ${src.formula}. O valor base ${src.b} entra no ciclo ${mult} de expansão numerológica.`,
          calc:`${src.b} × ${mult} + deslocamento(${bi}×7) + offset do sorteio(${dOff}) = ${src.b*mult+bi*7+dOff} mod ${total} = posição ${idx} → dezena ${num}. Peso: ${14-mult*2} pontos.`,
          dateLink:`A redução do dia do sorteio (${drawDayNum} → ${drawRed}) combina com o seu ${src.l} (${src.b}): ${src.b}+${drawRed}=${src.b+drawRed} — esta soma cria um canal numerológico que favorece o ${num}.`,
        });
      }
    });
  }

  // ─── DIVINE / ANGELS ───
  if(modules.includes("divine")){
    const angel=getAngel(dy,mo);
    const angelIdx=((mo-1)*30+dy)%ANGELS.length;

    angel.nums.forEach((n,i)=>{
      const idx=n-lo;
      if(idx>=0&&idx<total) add(idx,15,{
        source:"Anjo da Guarda",
        detail:`O ${angel.name} protege quem nasce a ${dy}/${mo}. Rege ${angel.attr}. O ${n} é o ${i+1}º dos seus 4 números sagrados.`,
        calc:`Data ${birthStr} → posição angelical: ((${mo}-1)×30+${dy}) mod ${ANGELS.length} = ${angelIdx} → ${angel.name}. Número sagrado #${i+1} = ${n}. Peso máximo: 15 pontos.`,
        dateLink:`O Salmo ${angel.psalm} do ${angel.name} soma ${angel.psalm} — e ${angel.psalm} + dia do sorteio ${drawDayNum} = ${angel.psalm+drawDayNum}. Esta soma reforça a ponte espiritual entre o seu anjo e a ${drawDay} do sorteio de ${drawStr}.`,
      });
    });

    const psIdx=(angel.psalm+drawDate.getDate()+drawDate.getMonth())%total;
    const psNum=psIdx+lo;
    add(psIdx,10,{
      source:"Anjo da Guarda",
      detail:`O Salmo ${angel.psalm} é a oração do ${angel.name}. Quando combinado com a data do sorteio, gera uma dezena sagrada.`,
      calc:`Salmo ${angel.psalm} + dia(${drawDayNum}) + mês(${drawDate.getMonth()}) = ${angel.psalm+drawDayNum+drawDate.getMonth()} mod ${total} = posição ${psIdx} → dezena ${psNum}. Peso: 10 pontos.`,
      dateLink:`Este número só existe porque o Salmo ${angel.psalm} se cruza com a data específica de ${drawStr}. Num sorteio diferente, o salmo geraria uma dezena diferente — esta é exclusiva para si neste dia.`,
    });
  }

  // ─── TAROT ───
  if(modules.includes("tarot")){
    const card=getTarot(seed);
    const seedMod=seed%17;

    for(let i=0;i<4;i++){
      const idx=((card.v*(i+1)+seedMod+drawDate.getDate()*3)%total);
      const num=idx+lo;
      const rays=["primário","secundário","terciário","quaternário"];
      add(idx,12,{
        source:"Tarot",
        detail:`${card.name} (Arcano ${card.v}): "${card.d}". Raio ${rays[i]} de influência.`,
        calc:`Arcano ${card.v} × raio ${i+1} + seed pessoal(${seedMod}) + dia do sorteio(${drawDayNum}×3=${drawDayNum*3}) = ${card.v*(i+1)+seedMod+drawDate.getDate()*3} mod ${total} = ${idx} → dezena ${num}. Peso: 12 pontos.`,
        dateLink:`O ${card.name} projecta ${card.m.toLowerCase()} como energia dominante. O raio ${rays[i]} cruza a data ${birthStr} com o sorteio de ${drawStr}: a sua seed pessoal (${seedMod}) é o elo que liga o arcano ao dia exacto.`,
      });
    }
  }

  // ─── LUNAR ───
  if(modules.includes("lunar")){
    const ph=lunarPhase(drawDate);
    for(let i=0;i<total;i++)scores[i]=Math.round(scores[i]*ph.mult);

    const lunarCalcs=[
      {idx:(drawDate.getDate()*2+mo)%total, formula:`dia_sorteio(${drawDayNum})×2 + mês_nasc(${mo})`, natal:"mês de nascimento"},
      {idx:(drawDate.getDate()*3+hr)%total, formula:`dia_sorteio(${drawDayNum})×3 + hora_nasc(${hr})`, natal:"hora de nascimento"},
      {idx:(drawDate.getMonth()*5+dy)%total, formula:`mês_sorteio(${drawDate.getMonth()+1})×5 + dia_nasc(${dy})`, natal:"dia de nascimento"},
    ];

    lunarCalcs.forEach((lc,i)=>{
      const num=lc.idx+lo;
      add(lc.idx,10,{
        source:"Fase Lunar",
        detail:`${ph.name}: ${ph.energy}. Este número nasce do cruzamento entre a lua no dia do sorteio e o seu ${lc.natal}.`,
        calc:`${lc.formula} = ${lc.idx} → dezena ${num}. A ${ph.name} aplica multiplicador ${ph.mult}x sobre TODOS os scores. Peso adicional: 10 pontos.`,
        dateLink:`No dia ${drawStr}, a Lua estará em fase de ${ph.desc}. O seu ${lc.natal} (${[mo,hr,dy][i]}) combina-se com o sorteio: ${lc.formula} = ${num}. Este número é literalmente a fusão entre o seu nascimento e a data cósmica do sorteio.`,
      });
    });
  }

  // ─── ORIXÁS ───
  if(modules.includes("orixas")){
    const o=getOrixa(lp,mo);
    const oIdx=(lp+mo)%ORIXAS.length;

    o.nums.forEach((n,i)=>{
      const idx=n-lo;
      if(idx>=0&&idx<total) add(idx,14,{
        source:"Orixás",
        detail:`${o.name} rege ${o.domain}. O ${n} é o ${i+1}º dos 12 números consagrados a este Orixá.`,
        calc:`Caminho de Vida(${lp}) + mês(${mo}) = ${lp+mo} mod ${ORIXAS.length} = ${oIdx} → ${o.name}. Número consagrado #${i+1} = ${n}. Peso: 14 pontos.`,
        dateLink:`Nascido a ${birthStr} com Caminho de Vida ${lp} — ${o.name} é o Orixá que guia a sua sorte. No sorteio de ${drawStr}, o axé de ${o.name} concentra-se sobre os seus números sagrados, e o ${n} está entre os mais carregados de energia ancestral.`,
      });
    });
  }

  for(let i=0;i<total;i++)scores[i]+=Math.floor(rng()*10);
  return { scores,influences,sign,lifePath:lp,angel:getAngel(dy,mo),lunar:lunarPhase(drawDate),orixa:getOrixa(lp,mo),tarot:getTarot(seed),drawDate,birthStr,drawStr };
}

// ═══ Build final explanation for a number — merges all influences ═══
function buildExplanation(num, influences, lottery, birthStr, drawStr) {
  const infs = influences[num];
  if (!infs || infs.length === 0) {
    return {
      source: "Energia Combinada",
      detail: `O ${num} emergiu da convergência energética dos módulos activos. Embora nenhum módulo individual o tenha seleccionado directamente, a combinação das forças místicas criou um pico de vibração nesta dezena.`,
      calc: `Score composto de pequenas influências adjacentes e variação cósmica. A soma total ultrapassou o limiar de selecção dentro do intervalo [${lottery.range[0]}–${lottery.range[1]}].`,
      dateLink: `Para o sorteio de ${drawStr}, a combinação entre os dados de nascimento (${birthStr}) e a posição dos astros favorece indirectamente o ${num} como parte do equilíbrio energético da combinação.`,
    };
  }
  // Pick the strongest influence as primary, mention others as reinforcements
  const sorted = [...infs].sort((a,b) => b.pts - a.pts);
  const primary = sorted[0];
  const others = sorted.slice(1).filter(s => s.source !== primary.source);

  let reinforcement = "";
  if (others.length > 0) {
    const otherSources = [...new Set(others.map(o => o.source))].slice(0, 2);
    reinforcement = ` Reforçado por ${otherSources.join(" e ")} (+${others.reduce((a,o)=>a+o.pts,0)} pontos adicionais).`;
  }

  return {
    source: primary.source + (others.length > 0 ? ` + ${others.length} influência${others.length>1?"s":""}` : ""),
    detail: primary.detail + reinforcement,
    calc: primary.calc,
    dateLink: primary.dateLink,
  };
}

// ═══ CONSTRAINED GENERATOR ═══
function genGames(scores,lot,rules,num,baseSeed){
  const[lo,hi]=lot.range,total=hi-lo+1,res=[],maxA=lot.pick>20?8000:30000;
  for(let g=0;g<num;g++){
    const rng=sRng(baseSeed+g*9973);let best=null,bestSc=-1;
    for(let a=0;a<maxA;a++){
      const pool=Array.from({length:total},(_,i)=>i+lo),combo=[];
      for(let i=0;i<lot.pick;i++){const ri=Math.floor(rng()*pool.length);combo.push(pool.splice(ri,1)[0]);}
      combo.sort((a,b)=>a-b);
      const ev=combo.filter(n=>n%2===0).length;if(ev<rules.evenMin||ev>rules.evenMax)continue;
      const lw=combo.filter(n=>n<=rules.lowSplit).length;if(lw<rules.lowMin||lw>rules.lowMax)continue;
      const sm=combo.reduce((a,b)=>a+b,0);if(sm<rules.sumMin||sm>rules.sumMax)continue;
      if(res.some(r=>r.numbers.join(",")=== combo.join(",")))continue;
      const sc=combo.reduce((acc,n)=>acc+(scores[n-lo]||0),0);
      if(sc>bestSc){bestSc=sc;best=combo;}
    }
    if(best)res.push({numbers:best,score:bestSc});
  }
  if(lot.hasTrevos){const tR=sRng(baseSeed+77777);res.forEach(r=>{const t=[],p=Array.from({length:lot.trevosRange[1]},(_,i)=>i+lot.trevosRange[0]);for(let i=0;i<lot.trevosPick;i++){const ri=Math.floor(tR()*p.length);t.push(p.splice(ri,1)[0]);}r.trevos=t.sort((a,b)=>a-b);});}
  return res.sort((a,b)=>b.score-a.score);
}

// ═══ UI COMPONENTS ═══
const Star=({x,y,s,d})=>(<div style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:s,height:s,borderRadius:"50%",background:"rgba(255,220,130,0.6)",animation:`tw ${2+d}s ease-in-out infinite`,animationDelay:`${d}s`}}/>);
const Orb=({active,color})=>(<div style={{width:100,height:100,borderRadius:"50%",margin:"0 auto 20px",background:`radial-gradient(circle at 35% 35%, ${color||"#2a1f5e"}, #0d0a1a)`,border:"2px solid rgba(180,160,255,0.25)",boxShadow:active?`0 0 40px ${color}66, inset 0 0 25px rgba(138,100,255,0.25)`:"0 0 15px rgba(138,100,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.5s",animation:active?"orb-pulse 1.5s ease-in-out infinite":"none"}}><span style={{fontSize:36,filter:"drop-shadow(0 0 6px rgba(200,180,255,0.5))"}}>{active?"✦":"☽"}</span></div>);

const Ball=({number,delay,color,small})=>(<div style={{width:small?38:58,height:small?38:58,borderRadius:"50%",background:`${color}30`,border:`2px solid ${color}77`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:small?13:19,fontWeight:600,color:"#eee",fontFamily:"'Cormorant Garamond',Georgia,serif",boxShadow:`0 2px 8px ${color}20`,animation:`fadeUp 0.5s ease-out forwards`,animationDelay:`${delay*0.08}s`,opacity:0,flexShrink:0}}>{String(number).padStart(2,"0")}</div>);

const TrevoBall=({number,delay})=>(<div style={{width:42,height:42,borderRadius:10,background:"linear-gradient(135deg, rgba(34,139,34,0.2), rgba(34,139,34,0.45))",border:"2px solid rgba(34,139,34,0.55)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:600,color:"#6deb6d",fontFamily:"'Cormorant Garamond',Georgia,serif",animation:`fadeUp 0.5s ease-out forwards`,animationDelay:`${(6+delay)*0.08}s`,opacity:0}}>{number}</div>);

const ExplRow=({number,expl,color})=>{
  if(!expl)return null;
  return(<div style={{padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:`${color}35`,border:`1.5px solid ${color}77`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:600,color:"#eee",fontFamily:"'Cormorant Garamond',Georgia,serif",flexShrink:0}}>{String(number).padStart(2,"0")}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10,color:color,fontFamily:"system-ui,sans-serif",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:2}}>{expl.source}</div>
      </div>
    </div>
    <div style={{paddingLeft:46}}>
      <div style={{fontSize:11,color:"#a694c8",lineHeight:1.65,marginBottom:6,fontFamily:"system-ui,sans-serif"}}>{expl.detail}</div>
      <div style={{fontSize:10,color:"#8a7a9e",lineHeight:1.55,fontFamily:"'Cormorant Garamond',Georgia,serif",fontStyle:"italic",padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6,borderLeft:`2px solid ${color}33`,marginBottom:6}}>{expl.calc}</div>
      <div style={{fontSize:10,color:"#b8a4d8",lineHeight:1.55,fontFamily:"system-ui,sans-serif",padding:"6px 10px",background:`${color}08`,borderRadius:6,borderLeft:`2px solid ${color}55`}}>{expl.dateLink}</div>
    </div>
  </div>);
};

const GameCard=({game,idx,lot,mysticData,drawDate})=>{
  const explanations = {};
  if(mysticData){
    game.numbers.forEach(n=>{
      explanations[n] = buildExplanation(n, mysticData.influences, lot, mysticData.birthStr, mysticData.drawStr);
    });
  }
  return(<div style={{background:idx===0?`${lot.color}0D`:"rgba(255,255,255,0.015)",border:idx===0?`1px solid ${lot.color}33`:"1px solid rgba(255,255,255,0.05)",borderRadius:14,padding:"16px 14px",marginBottom:12}}>
    {idx===0&&<div style={{display:"inline-block",background:`${lot.color}20`,border:`1px solid ${lot.color}40`,borderRadius:16,padding:"2px 12px",fontSize:10,color:lot.color,marginBottom:10,fontWeight:500,letterSpacing:0.3,fontFamily:"system-ui,sans-serif"}}>Maior energia mística</div>}
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4,justifyContent:"center"}}>
      {game.numbers.map((n,i)=>(<Ball key={n} number={n} delay={i} color={lot.color} small={lot.pick>10}/>))}
    </div>
    {lot.hasTrevos&&game.trevos&&<div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:4}}><span style={{fontSize:11,color:"#5a5070",alignSelf:"center",fontFamily:"system-ui,sans-serif",marginRight:4}}>Trevos:</span>{game.trevos.map((t,i)=><TrevoBall key={t} number={t} delay={i}/>)}</div>}
    <div style={{marginTop:10}}>
      <div style={{fontSize:9,color:"#5a5070",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.2,fontWeight:500,marginBottom:4}}>Como chegámos a cada número</div>
      {game.numbers.map(n=>(<ExplRow key={`e${n}`} number={n} expl={explanations[n]} color={lot.color}/>))}
    </div>
  </div>);
};

// ═══ MAIN APP ═══
export default function OraculoDaSorte(){
  const[step,setStep]=useState("input");
  const[lotteryId,setLotteryId]=useState("megasena");
  const[birthDate,setBD]=useState("");
  const[birthTime,setBT]=useState("");
  const[fullName,setFN]=useState("");
  const[modules,setMods]=useState(["astrology"]);
  const[numGames,setNG]=useState(1);
  const[results,setRes]=useState(null);
  const[mystic,setMys]=useState(null);
  const[history,setHist]=useState([]);

  const lot=LOTTERIES[lotteryId], nextDraw=getNextDrawDate(lot);

  useEffect(()=>{(async()=>{
    try{const h=await window.storage.get("oraculo-history");if(h?.value)setHist(JSON.parse(h.value));}catch(e){}
    try{const p=await window.storage.get("oraculo-profile");if(p?.value){const d=JSON.parse(p.value);if(d.bd)setBD(d.bd);if(d.bt)setBT(d.bt);if(d.fn)setFN(d.fn);}}catch(e){}
  })();},[]);

  const savePro=async()=>{try{await window.storage.set("oraculo-profile",JSON.stringify({bd:birthDate,bt:birthTime,fn:fullName}));}catch(e){}};
  const saveHist=async(entry)=>{const u=[entry,...history].slice(0,80);setHist(u);try{await window.storage.set("oraculo-history",JSON.stringify(u));}catch(e){}};
  const togMod=(id)=>setMods(p=>p.includes(id)?p.filter(m=>m!==id):[...p,id]);

  const handleGen=useCallback(async()=>{
    if(!birthDate)return; setStep("generating"); await savePro();
    setTimeout(()=>{
      const user={birthDate,birthTime,fullName}, dd=getNextDrawDate(lot);
      const data=generateScores(user,modules,lot,dd);
      const detSeed=birthDate.replace(/\D/g,"")*1+(birthTime||"1200").replace(/\D/g,"")*1+dd.getDate()*1000+dd.getMonth()*100+lot.range[1]*7+modules.sort().join("").length*31;
      const games=genGames(data.scores,lot,lot.defaults,numGames,detSeed);
      setMys(data);setRes(games);
      saveHist({date:new Date().toISOString(),lottery:lot.name,lotteryId:lot.id,games:games.map(g=>({numbers:g.numbers,trevos:g.trevos})),modules:[...modules],sign:data.sign.name,drawDate:dd.toISOString()});
      setTimeout(()=>setStep("results"),500);
    },1800);
  },[birthDate,birthTime,fullName,modules,lot,numGames]);

  const allMods=[
    {id:"astrology",label:"Astrologia",icon:"✦",desc:"Usa as posições exactas do Sol, Júpiter, Vênus, Lua e Saturno no seu mapa natal. Cada planeta projecta a sua energia em graus que se convertem em dezenas, com trânsitos ajustados à data do sorteio."},
    {id:"numerology",label:"Numerologia",icon:"☯",desc:"Calcula o seu Caminho de Vida, Número do Destino e Ano Pessoal. Cada ciclo numerológico gera vibrações que ressoam com dezenas específicas, moduladas pelo dia do sorteio."},
    {id:"divine",label:"Anjo da Guarda",icon:"♱",desc:"Identifica o seu anjo protector pela data de nascimento. Os 4 números sagrados do anjo e o Salmo associado canalizam protecção divina em dezenas de alta vibração espiritual."},
    {id:"tarot",label:"Tarot",icon:"⚝",desc:"Revela o Arcano Maior que governa o seu destino. A carta projecta 4 raios de influência numérica, cada um carregado com a energia simbólica do arcano."},
    {id:"lunar",label:"Fases Lunares",icon:"☽",desc:"Analisa a fase da Lua no dia do sorteio. Lua Cheia amplifica todos os scores em 1.3x; Lua Nova potencia novos ciclos. Gera dezenas ligadas aos ciclos lunares e natais."},
    {id:"orixas",label:"Orixás",icon:"⚡",desc:"Determina o Orixá regente pelo Caminho de Vida e mês de nascimento. Cada Orixá consagra 12 números que carregam a energia ancestral da sua linhagem espiritual."},
  ];

  return(<div style={{minHeight:"100vh",background:"linear-gradient(170deg, #06030d 0%, #0d0819 35%, #110b22 65%, #080510 100%)",color:"#d0bef0",fontFamily:"'Cormorant Garamond',Georgia,serif",position:"relative",overflow:"hidden"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
      @keyframes tw{0%,100%{opacity:0.15;transform:scale(0.7)}50%{opacity:0.9;transform:scale(1.3)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes orb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      input[type="date"],input[type="time"],input[type="text"]{background:rgba(255,255,255,0.03)!important;border:1px solid rgba(255,255,255,0.08)!important;border-radius:10px!important;color:#d0bef0!important;padding:11px 14px!important;font-size:14px!important;font-family:'Cormorant Garamond',Georgia,serif!important;width:100%;box-sizing:border-box;outline:none}
      input:focus{border-color:rgba(160,120,255,0.35)!important}input::placeholder{color:rgba(180,160,220,0.25)!important}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(160,120,255,0.15);border-radius:3px}
    `}</style>

    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>{Array.from({length:35},(_,i)=>(<Star key={i} x={Math.random()*100} y={Math.random()*100} s={1+Math.random()*2} d={Math.random()*5}/>))}</div>

    <div style={{position:"relative",zIndex:1,maxWidth:520,margin:"0 auto",padding:"20px 16px 36px"}}>

      {/* ─── STATS COUNTER — top right ─── */}
      <div style={{
        position:"absolute",top:16,right:16,
        background:"linear-gradient(135deg, rgba(240,214,138,0.1), rgba(109,235,109,0.08))",
        border:"1px solid rgba(240,214,138,0.18)",
        borderRadius:10, padding:"6px 12px",
        display:"flex",alignItems:"center",gap:8, zIndex:5,
      }}>
        <div style={{width:5,height:5,borderRadius:"50%",background:"#6deb6d",boxShadow:"0 0 6px rgba(109,235,109,0.6)",animation:"orb-pulse 2s ease-in-out infinite"}}/>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#f0d68a",fontFamily:"system-ui,sans-serif",lineHeight:1}}>{APP_STATS.totalWinningBets.toLocaleString("pt-BR")}</div>
          <div style={{fontSize:8,color:"#7a6f90",fontFamily:"system-ui,sans-serif",lineHeight:1.2}}>acertos premiados</div>
        </div>
        <div style={{width:1,height:22,background:"rgba(255,255,255,0.08)"}}/>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#6deb6d",fontFamily:"system-ui,sans-serif",lineHeight:1}}>R${(APP_STATS.totalPrizeValue/1000000).toFixed(1)}M</div>
          <div style={{fontSize:8,color:"#7a6f90",fontFamily:"system-ui,sans-serif",lineHeight:1.2}}>acumulado</div>
        </div>
      </div>

      <div style={{textAlign:"center",marginBottom:24,paddingTop:16}}>
        <div style={{fontSize:10,letterSpacing:5,color:"#5a5070",textTransform:"uppercase",marginBottom:6,fontFamily:"system-ui,sans-serif",fontWeight:500}}>Loterias do Brasil</div>
        <h1 style={{fontSize:30,fontWeight:600,margin:"0 0 4px",background:"linear-gradient(135deg, #d0bef0, #f0d68a, #d0bef0)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 8s linear infinite"}}>Oráculo da Sorte</h1>
        <p style={{fontSize:13,color:"#7a6f90",margin:0,fontFamily:"'Cormorant Garamond',Georgia,serif",fontStyle:"italic",letterSpacing:0.3}}>Os seus números ocultos... são agora revelados</p>
      </div>

      {step!=="generating"&&(<div style={{display:"flex",gap:3,marginBottom:22,padding:3,background:"rgba(255,255,255,0.02)",borderRadius:10}}>
        {[["input","Gerar"],["history","Histórico"]].map(([id,label])=>(<button key={id} onClick={()=>setStep(id)} style={{flex:1,padding:"9px 0",border:"none",borderRadius:7,background:(step===id||(step==="results"&&id==="input"))?"rgba(100,60,200,0.15)":"transparent",color:(step===id||(step==="results"&&id==="input"))?"#d0bef0":"#5a5070",fontSize:13,cursor:"pointer",fontFamily:"system-ui,sans-serif",fontWeight:500}}>{label}</button>))}
      </div>)}

      {step==="input"&&(<div style={{animation:"fadeUp 0.3s ease-out"}}>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#5a5070",marginBottom:8,fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.5,fontWeight:500}}>Escolha a loteria</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {Object.values(LOTTERIES).map(l=>(<button key={l.id} onClick={()=>setLotteryId(l.id)} style={{padding:"10px 14px",border:lotteryId===l.id?`1.5px solid ${l.color}`:"1px solid rgba(255,255,255,0.06)",borderRadius:10,cursor:"pointer",transition:"all 0.2s",background:lotteryId===l.id?`${l.color}18`:"rgba(255,255,255,0.02)",display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
              <span style={{fontSize:16,color:lotteryId===l.id?l.color:"#6b5f7e"}}>{l.icon}</span>
              <div style={{textAlign:"left"}}><div style={{fontSize:13,fontWeight:500,color:lotteryId===l.id?"#e0d4f5":"#7a6f90",fontFamily:"system-ui,sans-serif"}}>{l.name}</div><div style={{fontSize:9,color:"#5a5070",fontFamily:"system-ui,sans-serif"}}>{lotteryId===l.id?`Próximo: ${daysUntil(getNextDrawDate(l))}`:l.desc}</div></div>
            </button>))}
          </div>
        </div>
        <Orb active={false} color={lot.color}/>
        <div style={{textAlign:"center",marginBottom:18,padding:"8px 16px",background:`${lot.color}0A`,borderRadius:10,border:`1px solid ${lot.color}18`}}>
          <div style={{fontSize:10,color:"#5a5070",fontFamily:"system-ui,sans-serif",marginBottom:2}}>Próximo sorteio — {lot.name}</div>
          <div style={{fontSize:14,color:"#d0bef0",fontWeight:500}}>{formatDrawDate(nextDraw)}</div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#5a5070",marginBottom:8,fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.5,fontWeight:500}}>Dados cósmicos</div>
          <div style={{display:"grid",gap:8}}>
            <div><label style={{fontSize:11,color:"#7a6f90",display:"block",marginBottom:3,fontFamily:"system-ui,sans-serif"}}>Data de nascimento *</label><input type="date" value={birthDate} onChange={e=>setBD(e.target.value)}/></div>
            <div><label style={{fontSize:11,color:"#7a6f90",display:"block",marginBottom:3,fontFamily:"system-ui,sans-serif"}}>Horário de nascimento</label><input type="time" value={birthTime} onChange={e=>setBT(e.target.value)}/></div>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#5a5070",marginBottom:10,fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.5,fontWeight:500}}>Módulos místicos</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {allMods.map(m=>{const on=modules.includes(m.id);return(
              <button key={m.id} onClick={()=>togMod(m.id)} style={{
                padding:"14px 16px",border:on?"1.5px solid rgba(160,120,255,0.35)":"1px solid rgba(255,255,255,0.06)",
                borderRadius:12,cursor:"pointer",transition:"all 0.25s",textAlign:"left",
                background:on?"rgba(100,60,200,0.1)":"rgba(255,255,255,0.015)",
                display:"flex",gap:14,alignItems:"flex-start",
              }}>
                <div style={{
                  width:40,height:40,borderRadius:10,flexShrink:0,
                  background:on?"rgba(100,60,200,0.2)":"rgba(255,255,255,0.04)",
                  border:on?"1px solid rgba(160,120,255,0.3)":"1px solid rgba(255,255,255,0.06)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:20,transition:"all 0.25s",
                  opacity:on?1:0.4,
                }}>{m.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:500,color:on?"#d0bef0":"#7a6f90",fontFamily:"system-ui,sans-serif"}}>{m.label}</span>
                    <div style={{
                      width:6,height:6,borderRadius:"50%",flexShrink:0,
                      background:on?"#8a6cdb":"rgba(255,255,255,0.1)",
                      boxShadow:on?"0 0 6px rgba(138,108,219,0.5)":"none",
                      transition:"all 0.25s",
                    }}/>
                  </div>
                  <div style={{fontSize:11,lineHeight:1.5,color:on?"#8a7a9e":"#4a3f60",fontFamily:"system-ui,sans-serif",transition:"color 0.25s"}}>{m.desc}</div>
                </div>
              </button>
            );})}
          </div>
        </div>
        {modules.includes("numerology")&&(
          <div style={{marginBottom:18,animation:"fadeUp 0.2s ease-out"}}>
            <div style={{fontSize:10,color:"#5a5070",marginBottom:6,fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.5,fontWeight:500}}>Numerologia — dado adicional</div>
            <div><label style={{fontSize:11,color:"#7a6f90",display:"block",marginBottom:3,fontFamily:"system-ui,sans-serif"}}>Nome completo</label><input type="text" value={fullName} onChange={e=>setFN(e.target.value)} placeholder="O seu nome activa o Número do Destino"/></div>
          </div>
        )}
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><label style={{fontSize:11,color:"#7a6f90",fontFamily:"system-ui,sans-serif"}}>Jogos a gerar</label><span style={{fontSize:14,color:"#d0bef0",fontWeight:500}}>{numGames}</span></div>
          <input type="range" min="1" max="10" value={numGames} onChange={e=>setNG(Number(e.target.value))} style={{width:"100%",height:3,borderRadius:"2px!important",border:"none!important",padding:"0!important",cursor:"pointer",background:"rgba(255,255,255,0.06)!important"}}/>
        </div>
        <button onClick={handleGen} disabled={!birthDate||modules.length===0} style={{width:"100%",padding:"15px 0",border:"none",borderRadius:12,background:birthDate&&modules.length?`linear-gradient(135deg, ${lot.color}cc, ${lot.color})`:"rgba(255,255,255,0.04)",color:birthDate&&modules.length?"#fff":"#5a5070",fontSize:16,fontWeight:500,cursor:birthDate&&modules.length?"pointer":"not-allowed",fontFamily:"'Cormorant Garamond',Georgia,serif",boxShadow:birthDate&&modules.length?`0 6px 24px ${lot.color}40`:"none",transition:"all 0.3s",letterSpacing:0.5}}>Consultar o Oráculo</button>
        <p style={{fontSize:9,color:"#3d3555",textAlign:"center",marginTop:14,fontFamily:"system-ui,sans-serif",lineHeight:1.5}}>Aplicação de entretenimento. Consulte os termos legais no final da página.</p>
      </div>)}

      {step==="generating"&&(<div style={{textAlign:"center",paddingTop:36,animation:"fadeUp 0.3s ease-out"}}>
        <Orb active={true} color={lot.color}/>
        <p style={{fontSize:17,color:"#c4b0e8",marginBottom:6}}>Consultando o Oráculo...</p>
        <p style={{fontSize:12,color:"#5a5070",fontFamily:"system-ui,sans-serif"}}>{lot.name} — Sorteio de {formatDrawDate(nextDraw)}</p>
        <div style={{marginTop:20,height:2,borderRadius:1,overflow:"hidden",background:"rgba(255,255,255,0.04)"}}><div style={{height:"100%",width:"60%",background:`linear-gradient(90deg, transparent, ${lot.color}88, transparent)`,animation:"shimmer 1.5s linear infinite",backgroundSize:"200% auto"}}/></div>
      </div>)}

      {step==="results"&&results&&mystic&&(<div style={{animation:"fadeUp 0.3s ease-out"}}>
        <div style={{background:`${lot.color}0A`,borderRadius:14,border:`1px solid ${lot.color}22`,padding:14,marginBottom:16}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:28}}>{mystic.sign.sym}</span>
            <div style={{flex:1}}><div style={{fontSize:15,color:"#d0bef0"}}>{mystic.sign.name}</div><div style={{fontSize:10,color:"#5a5070",fontFamily:"system-ui,sans-serif"}}>{mystic.sign.el} — regido por {mystic.sign.ruler}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#5a5070",fontFamily:"system-ui,sans-serif"}}>{lot.name}</div><div style={{fontSize:14,color:lot.color,fontWeight:500}}>{lot.icon}</div></div>
          </div>
          <div style={{padding:"6px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,marginBottom:8,textAlign:"center"}}>
            <span style={{fontSize:10,color:"#5a5070",fontFamily:"system-ui,sans-serif"}}>Para o sorteio de </span>
            <span style={{fontSize:12,color:"#d0bef0",fontWeight:500}}>{formatDrawDate(mystic.drawDate)}</span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {modules.includes("numerology")&&<div style={{padding:"4px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:11}}><span style={{color:"#5a5070",fontFamily:"system-ui,sans-serif"}}>Vida </span><span style={{color:"#f0d68a",fontWeight:500}}>{mystic.lifePath}</span></div>}
            {modules.includes("lunar")&&<div style={{padding:"4px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:11}}><span style={{color:"#c4b0e8"}}>{mystic.lunar.name}</span></div>}
            {modules.includes("divine")&&<div style={{padding:"4px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:11}}><span style={{color:"#c4b0e8"}}>{mystic.angel.name}</span></div>}
            {modules.includes("tarot")&&<div style={{padding:"4px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:11}}><span style={{color:"#c4b0e8"}}>{mystic.tarot.name}</span></div>}
            {modules.includes("orixas")&&<div style={{padding:"4px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:11}}><span style={{color:"#c4b0e8"}}>{mystic.orixa.name}</span></div>}
          </div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:"#5a5070",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.5,fontWeight:500,marginBottom:10}}>{results.length} jogo{results.length!==1?"s":""}</div>
          {results.map((g,i)=>(<GameCard key={i} game={g} idx={i} lot={lot} mysticData={mystic} drawDate={mystic.drawDate}/>))}
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={handleGen} style={{flex:1,padding:"13px 0",border:"none",borderRadius:10,background:`linear-gradient(135deg, ${lot.color}cc, ${lot.color})`,color:"#fff",fontSize:14,cursor:"pointer",fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:500,boxShadow:`0 4px 16px ${lot.color}30`}}>Nova consulta</button>
          <button onClick={()=>setStep("input")} style={{padding:"13px 18px",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,background:"transparent",color:"#7a6f90",fontSize:13,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Voltar</button>
        </div>
        <p style={{fontSize:9,color:"#3d3555",textAlign:"center",marginTop:14,fontFamily:"system-ui,sans-serif",lineHeight:1.5}}>Aplicação de entretenimento. Consulte os termos legais no final da página.</p>
      </div>)}

      {step==="history"&&(<div style={{animation:"fadeUp 0.3s ease-out"}}>
        <div style={{fontSize:10,color:"#5a5070",marginBottom:14,fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.5,fontWeight:500}}>Consultas anteriores</div>
        {history.length===0?(<div style={{textAlign:"center",padding:"50px 20px"}}><span style={{fontSize:36,opacity:0.25}}>☽</span><p style={{color:"#5a5070",fontSize:12,fontFamily:"system-ui,sans-serif",marginTop:10}}>Nenhuma consulta ainda.</p></div>):(
          history.map((e,i)=>{const hl=LOTTERIES[e.lotteryId]||LOTTERIES.megasena;return(<div key={i} style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10,padding:12,marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:12,color:hl.color}}>{hl.icon}</span><span style={{fontSize:11,color:"#7a6f90",fontFamily:"system-ui,sans-serif"}}>{hl.name}</span></div><span style={{fontSize:10,color:"#4a3f60",fontFamily:"system-ui,sans-serif"}}>{new Date(e.date).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span></div>
            {e.drawDate&&<div style={{fontSize:9,color:"#5a5070",marginBottom:4,fontFamily:"system-ui,sans-serif"}}>Sorteio: {formatDrawDate(new Date(e.drawDate))}</div>}
            {e.games.slice(0,2).map((g,gi)=>(<div key={gi} style={{display:"flex",gap:4,marginBottom:3,flexWrap:"wrap",alignItems:"center"}}>{g.numbers.map(n=>(<span key={n} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:g.numbers.length>10?24:28,height:g.numbers.length>10?24:28,borderRadius:"50%",background:gi===0?`${hl.color}15`:"rgba(255,255,255,0.03)",border:gi===0?`1px solid ${hl.color}30`:"1px solid rgba(255,255,255,0.04)",fontSize:g.numbers.length>10?9:11,color:"#b8a4d8",fontWeight:500,fontFamily:"system-ui,sans-serif"}}>{String(n).padStart(2,"0")}</span>))}{g.trevos&&g.trevos.map(t=>(<span key={`t${t}`} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:6,background:"rgba(34,139,34,0.15)",border:"1px solid rgba(34,139,34,0.3)",fontSize:10,color:"#6deb6d",fontWeight:500,fontFamily:"system-ui,sans-serif"}}>{t}</span>))}</div>))}
            {e.games.length>2&&<div style={{fontSize:9,color:"#3d3555",fontFamily:"system-ui,sans-serif",marginTop:2}}>+ {e.games.length-2} jogo{e.games.length-2!==1?"s":""}</div>}
          </div>);})
        )}
        {history.length>0&&<button onClick={async()=>{setHist([]);try{await window.storage.delete("oraculo-history");}catch(e){}}} style={{width:"100%",padding:"9px 0",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,background:"transparent",color:"#5a5070",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",marginTop:10}}>Limpar histórico</button>}
      </div>)}

      {/* ═══ LEGAL FOOTER — always visible ═══ */}
      <div style={{marginTop:40,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:24}}>
        <div style={{fontSize:10,color:"#5a5070",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:12,textAlign:"center"}}>Aviso Legal e Termos de Utilização</div>

        <div style={{fontSize:10,color:"#4a3f60",fontFamily:"system-ui,sans-serif",lineHeight:1.7,marginBottom:16}}>
          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Natureza do Serviço.</span> O Oráculo da Sorte é uma aplicação de entretenimento que gera sugestões numéricas com base em sistemas de crenças populares, incluindo astrologia, numerologia, tarot e tradições espirituais. Esta aplicação não constitui, em nenhuma circunstância, uma plataforma de apostas, um serviço de jogos de azar, nem um sistema de previsão com garantia de resultados. Nenhum método — matemático, estatístico, astrológico ou de qualquer outra natureza — pode prever ou influenciar o resultado de sorteios lotéricos, que são eventos puramente aleatórios.</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Ausência de Garantias.</span> A utilização desta aplicação não aumenta, melhora nem optimiza as probabilidades de obter qualquer prémio em qualquer loteria ou jogo. Os números apresentados são gerados por algoritmos de entretenimento e não têm qualquer relação causal com os resultados dos sorteios oficiais. O Oráculo da Sorte não garante, promete ou sugere — directa ou indirectamente — que a utilização do serviço resultará em ganhos financeiros de qualquer espécie.</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Não Afiliação.</span> Esta aplicação não é patrocinada, endossada, administrada por, nem associada à Caixa Econômica Federal, à Secretaria de Prêmios e Apostas (SPA/MF), nem a qualquer entidade governamental ou operadora de loterias. Todas as marcas de loterias mencionadas (Mega Sena, Lotofácil, Quina, Lotomania, +Milionária) são propriedade exclusiva da Caixa Econômica Federal e são utilizadas nesta aplicação apenas para fins de referência e identificação.</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Jogo Responsável.</span> Loterias e jogos de azar devem ser encarados exclusivamente como formas de entretenimento, nunca como fonte de rendimento. Jogue apenas com valores que pode confortavelmente dispensar. Se sente que o jogo está a afectar negativamente a sua vida financeira, emocional ou familiar, procure ajuda profissional. Para suporte, contacte o CVV — Centro de Valorização da Vida (Ligue 188 ou aceda a cvv.org.br) ou o serviço de apoio ao consumidor no portal consumidor.gov.br.</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Restrição Etária.</span> Esta aplicação destina-se exclusivamente a utilizadores com idade igual ou superior a 18 (dezoito) anos, em conformidade com a legislação brasileira aplicável ao jogo e às loterias (Lei n.º 14.790/2023).</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Protecção de Dados e Privacidade.</span> O Oráculo da Sorte respeita integralmente a Lei Geral de Protecção de Dados (LGPD — Lei n.º 13.709/2018). Os dados pessoais fornecidos (data de nascimento, horário e, opcionalmente, nome) são processados localmente no dispositivo do utilizador e utilizados exclusivamente para a geração de sugestões numéricas. Não recolhemos, armazenamos em servidores externos, partilhamos ou comercializamos dados pessoais a terceiros. O utilizador pode eliminar todos os seus dados a qualquer momento através das configurações da aplicação.</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Propriedade Intelectual.</span> Todo o conteúdo, algoritmos, design e código-fonte do Oráculo da Sorte são propriedade do seu desenvolvedor e estão protegidos pelas leis de propriedade intelectual aplicáveis. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Limitação de Responsabilidade.</span> Em nenhuma hipótese o desenvolvedor do Oráculo da Sorte será responsável por quaisquer perdas financeiras, danos directos, indirectos, incidentais, consequenciais ou especiais decorrentes da utilização ou incapacidade de utilização desta aplicação, incluindo, sem limitação, perdas resultantes de apostas realizadas com base nas sugestões fornecidas.</p>

          <p style={{marginBottom:8}}><span style={{color:"#7a6f90",fontWeight:600}}>Legislação Aplicável.</span> Esta aplicação rege-se pela legislação da República Federativa do Brasil, sendo competente o foro da comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer litígios decorrentes da utilização do serviço, nos termos do Código de Defesa do Consumidor (Lei n.º 8.078/1990) e demais legislação aplicável.</p>

          <p style={{marginBottom:0}}><span style={{color:"#7a6f90",fontWeight:600}}>Conformidade com Lojas de Aplicações.</span> O Oráculo da Sorte cumpre integralmente as directrizes de publicação da Apple App Store (Secção 5.3 — Gaming, Gambling and Lotteries) e do Google Play (Política de Jogos de Azar), classificando-se como aplicação de entretenimento sem envolvimento de dinheiro real, apostas ou transacções financeiras de qualquer natureza.</p>
        </div>

        <div style={{textAlign:"center",paddingBottom:8}}>
          <div style={{fontSize:9,color:"#3d3555",fontFamily:"system-ui,sans-serif",marginBottom:4}}>Oráculo da Sorte v1.0 — Março 2026</div>
          <div style={{fontSize:9,color:"#3d3555",fontFamily:"system-ui,sans-serif"}}>© 2026 Todos os direitos reservados.</div>
        </div>
      </div>

    </div>
  </div>);
}
