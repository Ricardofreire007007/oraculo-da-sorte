// src/App.jsx — Oráculo da Sorte: Fluxo Completo
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { generateMysticNumbers, getMoonPhase, LOTTERIES, FEATURES } from './oracle.js';
import { supabase } from './auth.js';
import { track } from '@vercel/analytics';

const COLORS = {
  bg: "#0a0612", gold: "#c9a84c", goldLight: "#e8c97a", amber: "#d4813a",
  text: "#f0e6d3", textMuted: "#a89880", green: "#3d8c6e",
};

function isPremiumUser(profile) {
  if (!profile || !profile.plano) return false;
  return ['mistico', 'sagrado', 'paid'].includes(profile.plano);
}

function getPlanLabel(profile) {
  if (!profile || !profile.plano || profile.plano === 'free') return { label: 'Plano Livre', color: COLORS.textMuted, bg: 'rgba(168,152,128,0.15)', border: 'rgba(168,152,128,0.3)' };
  if (profile.plano === 'mistico') return { label: 'Plano Místico', color: COLORS.gold, bg: 'rgba(201,168,76,0.15)', border: 'rgba(201,168,76,0.3)' };
  if (profile.plano === 'sagrado') return { label: 'Plano Sagrado', color: COLORS.amber, bg: 'rgba(212,129,58,0.15)', border: 'rgba(212,129,58,0.3)' };
  if (profile.plano === 'paid') return { label: 'Plano Premium', color: COLORS.gold, bg: 'rgba(201,168,76,0.15)', border: 'rgba(201,168,76,0.3)' };
  return { label: 'Plano Livre', color: COLORS.textMuted, bg: 'rgba(168,152,128,0.15)', border: 'rgba(168,152,128,0.3)' };
}

// Duração do período de trial gratuito (dias)
const TRIAL_DURATION_DAYS = 30;

// Formatter reutilizável para converter timestamps para data em São Paulo.
// Criado uma vez ao nível do módulo porque new Intl.DateTimeFormat() é caro.
const SAO_PAULO_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Verifica se o utilizador ainda está no período de trial (30 dias após registo).
// Edge case: se profile.created_at for undefined (acontece imediatamente após o
// onboarding porque completeOnboarding() em AuthContext.jsx constrói um profile
// parcial sem created_at), assumimos que é utilizador acabado de criar → em trial.
function isInTrialPeriod(profile) {
  if (!profile) return false;
  if (!profile.created_at) return true;
  var now = new Date();
  var created = new Date(profile.created_at);
  var diffMs = now.getTime() - created.getTime();
  var diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < TRIAL_DURATION_DAYS;
}

// Verifica se o utilizador já usou a consulta grátis da Mega-Sena hoje.
// Compara a data actual com a data da última consulta, ambas no fuso de São Paulo
// (America/Sao_Paulo), porque o mercado é 100% brasileiro e o reset diário deve
// acontecer à meia-noite no horário local dos utilizadores.
// Usa Intl.DateTimeFormat para extrair YYYY-MM-DD em São Paulo sem dependências
// externas. A comparação de strings funciona porque o formato YYYY-MM-DD é
// lexicograficamente ordenável (ano-mês-dia, sempre com zero-padding).
function usouMegasenaHoje(profile) {
  if (!profile) return false;
  if (!profile.ultima_consulta_megasena) return false;
  var partes = function(date) {
    var p = SAO_PAULO_FORMATTER.formatToParts(date);
    var yEntry = p.find(function(x) { return x.type === 'year'; });
    var mEntry = p.find(function(x) { return x.type === 'month'; });
    var dEntry = p.find(function(x) { return x.type === 'day'; });
    if (!yEntry || !mEntry || !dEntry) return null;
    return yEntry.value + '-' + mEntry.value + '-' + dEntry.value;
  };
  var hoje = partes(new Date());
  var ultima = partes(new Date(profile.ultima_consulta_megasena));
  if (!hoje || !ultima) return false;
  return hoje === ultima;
}

// Determina se o utilizador tem acesso a gerar números para uma loteria.
// Retorna { permitido, motivo, consumo } para que handleLotterySelect saiba
// o que fazer e registarConsumo saiba o que debitar.
//
// Cenários (por ordem de prioridade):
//   1. Sem profile → sem_login (não devia acontecer, safety net)
//   2. Plano premium (mistico/sagrado/paid) → acesso total, sem consumo
//   3. Créditos avulsos disponíveis → acesso, consome 1 crédito
//   4. Mega-Sena em trial (< 30 dias) e ainda não usou hoje → acesso, consome trial diário
//   5. Nenhum dos anteriores → paywall
function temAcesso(profile, lotteryKey) {
  if (!profile) return { permitido: false, motivo: 'sem_login', consumo: 'nenhum' };
  if (isPremiumUser(profile)) return { permitido: true, motivo: 'premium', consumo: 'nenhum' };
  if (profile.creditos_restantes > 0) return { permitido: true, motivo: 'credito', consumo: 'credito' };
  if (lotteryKey === 'megasena' && isInTrialPeriod(profile) && !usouMegasenaHoje(profile)) {
    return { permitido: true, motivo: 'trial_diario', consumo: 'trial_diario' };
  }
  return { permitido: false, motivo: 'paywall', consumo: 'nenhum' };
}

// Regista o consumo de uma consulta na BD (crédito ou trial diário).
// Não bloqueia a UI se falhar — loga o erro e continua.
// Chamado por handleLotterySelect depois de temAcesso retornar permitido: true.
async function registarConsumo(profile, consumo) {
  if (consumo === 'nenhum') return;
  try {
    if (consumo === 'credito') {
      // Wake up da sessão Supabase — sem isto o UPDATE pode falhar silenciosamente
      await supabase.auth.getUser();
      var { error } = await supabase
        .from('profiles')
        .update({ creditos_restantes: profile.creditos_restantes - 1 })
        .eq('id', profile.id);
      if (error) console.error('Erro ao debitar crédito:', error);
    } else if (consumo === 'trial_diario') {
      // Wake up da sessão Supabase — sem isto o UPDATE pode falhar silenciosamente
      await supabase.auth.getUser();
      var { data: resultado, error: trialError } = await supabase
        .from('profiles')
        .update({ ultima_consulta_megasena: new Date().toISOString() })
        .eq('id', profile.id)
        .select();
      if (trialError) console.error('Erro ao registar consulta trial:', trialError);
    }
  } catch (err) {
    console.error('Erro inesperado em registarConsumo:', err);
  }
}

// ══════════════════════════════════════
//  ETAPA 1: SELEÇÃO DE FEATURE
// ══════════════════════════════════════
function FeatureSelection({ onSelect }) {
  var featureKeys = Object.keys(FEATURES);
  var moon = getMoonPhase();

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔮</div>
        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
          background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8,
        }}>Escolha seu caminho místico</h2>
        <p style={{ color: COLORS.textMuted, fontSize: 15, fontStyle: 'italic' }}>
          {moon.name} {moon.emoji} — energia de {moon.influence}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {featureKeys.map(function(key) {
          var f = FEATURES[key];
          return (
            <button key={key} onClick={function() { onSelect(key); }} style={{
              background: 'linear-gradient(135deg, #110d1e, #160f28)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 16, padding: '32px 24px',
              cursor: 'pointer', transition: 'all 0.3s ease',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4), 0 0 20px ' + f.color + '22'; }}
            onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, transparent, ' + f.color + ', transparent)',
                opacity: 0.6,
              }} />
              <div style={{ fontSize: 48, marginBottom: 16 }}>{f.emoji}</div>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: COLORS.text, marginBottom: 8 }}>{f.name}</h3>
              <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6 }}>{f.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  ETAPA 2: SELEÇÃO DE LOTERIA
// ══════════════════════════════════════
function LotterySelection({ feature, onSelect, onBack, isPremium, profile }) {
  var lotteryKeys = Object.keys(LOTTERIES);
  var featureData = FEATURES[feature];

  return (
    <div>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: COLORS.gold,
        fontFamily: "'Cinzel', serif", fontSize: 13, cursor: 'pointer',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        ← Voltar aos caminhos
      </button>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{featureData.emoji}</div>
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: '1.4rem',
          color: featureData.color, marginBottom: 8,
        }}>{featureData.name}</h2>
        <p style={{ color: COLORS.textMuted, fontSize: 14, fontStyle: 'italic' }}>
          Agora escolha para qual loteria deseja gerar os números
        </p>
      </div>

      {(function() {
        if (isPremium) return false;
        var acessoMega = temAcesso(profile, 'megasena');
        if (acessoMega.permitido && acessoMega.motivo === 'trial_diario') return (
          <div style={{ textAlign: 'center', fontSize: 14, color: COLORS.gold, marginBottom: 24, fontStyle: 'italic' }}>✨ Tens 1 consulta grátis hoje na Mega-Sena</div>
        );
        if (acessoMega.permitido && acessoMega.motivo === 'credito') return (
          <div style={{ textAlign: 'center', fontSize: 14, color: COLORS.gold, marginBottom: 24, fontStyle: 'italic' }}>{profile.creditos_restantes} crédito{profile.creditos_restantes !== 1 ? 's' : ''} disponíve{profile.creditos_restantes !== 1 ? 'is' : 'l'}</div>
        );
        return false;
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {lotteryKeys.map(function(key) {
          var lot = LOTTERIES[key];
          var isLocked = lot.premium && !isPremium;

          return (
            <button key={key}
              onClick={function() { if (!isLocked) onSelect(key); }}
              style={{
                background: isLocked ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, #110d1e, #160f28)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 12, padding: '18px 12px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.4 : 1,
                transition: 'all 0.2s ease', textAlign: 'center', position: 'relative',
              }}
              onMouseEnter={function(e) { if (!isLocked) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isLocked && <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 12 }}>🔒</span>}
              <div style={{ fontSize: 28, marginBottom: 6 }}>{lot.emoji}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: COLORS.text }}>{lot.name}</div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>{lot.desc}</div>
            </button>
          );
        })}
      </div>

      {!isPremium && (
        <p style={{ textAlign: 'center', fontSize: 13, color: COLORS.textMuted, marginTop: 16, fontStyle: 'italic' }}>
          🔒 Assine um plano para desbloquear todas as loterias
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  POPUP DE PLANOS (para free users)
// ══════════════════════════════════════
function PlanPopup({ onClose, feature }) {
  var featureData = FEATURES[feature];

  var plans = [
    { key: 'consulta', name: 'Pacote 3 Consultas', price: 'R$6,00', period: 'avulso', desc: '3 consultas completas · R$2 cada · Sem assinatura', icon: '🎯' },
    { key: 'mistico',  name: 'Plano Místico',      price: 'R$9,99', period: '/semana', desc: 'Consultas ilimitadas · Todas as loterias · Todos os rituais', icon: '🔮', badge: 'Mais Popular' },
    { key: 'sagrado',  name: 'Plano Sagrado',      price: 'R$29,99',period: '/mês',   desc: 'Tudo do Místico + Bolão espiritual + Consultor IA + Badge', icon: '👑' },
  ];

  var handleCheckout = function(plan) {
    track('oraculo_checkout_started', { plan: plan });
    fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: plan }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) { if (data.url) window.location.href = data.url; })
      .catch(function(err) { console.error('Checkout error:', err); });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0e0a1a, #150f28)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 20, padding: '36px 28px',
        maxWidth: 480, width: '100%', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'transparent', border: 'none',
          color: COLORS.textMuted, fontSize: 24, cursor: 'pointer',
        }}>×</button>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{featureData.emoji}</div>
          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: 18,
            color: COLORS.gold, marginBottom: 8,
          }}>
            Desbloqueie o {featureData.name}
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: 14, fontStyle: 'italic' }}>
            Escolha um plano para consultar o Oráculo
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plans.map(function(plan) {
            var isFeatured = plan.key === 'mistico';
            return (
              <div key={plan.key} style={{
                background: isFeatured ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                border: isFeatured ? '2px solid rgba(201,168,76,0.5)' : '1px solid rgba(201,168,76,0.15)',
                borderRadius: 14, padding: '20px 20px',
                position: 'relative',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -10, right: 16,
                    background: 'linear-gradient(135deg, #d4813a, #c9a84c)',
                    color: '#1a0f00', fontSize: 10, fontWeight: 700,
                    fontFamily: "'Cinzel', serif", padding: '3px 10px',
                    borderRadius: 12, letterSpacing: '0.05em',
                  }}>{plan.badge}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>{plan.icon}</span>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.text }}>{plan.name}</span>
                    </div>
                    <p style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>{plan.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: COLORS.gold, fontWeight: 700 }}>{plan.price}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{plan.period}</div>
                    <button onClick={function() { handleCheckout(plan.key); }} style={{
                      marginTop: 8, padding: '8px 16px',
                      background: isFeatured ? 'linear-gradient(135deg, #c9a84c, #8a7230)' : 'transparent',
                      border: isFeatured ? 'none' : '1px solid rgba(201,168,76,0.4)',
                      borderRadius: 8, color: isFeatured ? '#1a0f00' : COLORS.gold,
                      fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                      {plan.key === 'consulta' ? 'Comprar' : 'Assinar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: 20, fontStyle: 'italic' }}>
          Pagamento seguro via Stripe · Cancele quando quiser
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  RESULTADO: VISUAL POR FEATURE
// ══════════════════════════════════════
function FeatureResultHeader({ result }) {
  var fd = result.featureData;

  if (result.feature === 'tarot') {
    return (
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: '#8B5CF6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
          🃏 {fd.spread}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {fd.cards.map(function(card, i) {
            var labels = ['Passado', 'Presente', 'Futuro'];
            return (
              <div key={i} style={{
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 12, padding: '16px 14px', textAlign: 'center', width: 120,
              }}>
                <div style={{ fontSize: 10, color: '#8B5CF6', marginBottom: 6, fontFamily: "'Cinzel', serif" }}>{labels[i]}</div>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{card.emoji}</div>
                <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 600, marginBottom: 4 }}>{card.name}</div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.4 }}>{card.meaning}</div>
              </div>
            );
          })}
        </div>
        {fd.tarotNarrative && (
          <div style={{ marginTop: 20, padding: "16px 20px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.8, fontFamily: "'EB Garamond', serif", marginBottom: 12 }}>{fd.tarotNarrative.narrative}</p>
            <p style={{ fontSize: 13, color: "#8B5CF6", fontStyle: "italic", textAlign: "center", fontFamily: "'EB Garamond', serif" }}>{fd.tarotNarrative.advice}</p>
          </div>
        )}
      </div>
    );
  }

  if (result.feature === 'numerologia') {
    return (
      <div style={{
        background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 28,
      }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: COLORS.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
          🔢 Sua Matriz Numerológica
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {[['Vida', fd.lifeNumber], ['Nome', fd.nameNumber], ['Dia', fd.dayVibration], ['Ano', fd.personalYear]].map(function(item) {
            return (
              <div key={item[0]} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>{item[0]}</div>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cinzel', serif", fontSize: 16, color: COLORS.gold, fontWeight: 700,
                }}>{item[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          {fd.interpretation && fd.interpretation.essence && <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: COLORS.gold, marginBottom: 8 }}>{fd.interpretation.essence}</p>}
          <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8, fontStyle: "italic", fontFamily: "'EB Garamond', serif" }}>{fd.interpretation.fullInsight || fd.interpretation}</p>
        </div>
      </div>
    );
  }

  if (result.feature === 'anjos') {
    return (
      <div style={{
        background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)',
        borderRadius: 12, padding: '20px', marginBottom: 28, textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{fd.angel.emoji}</div>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: '#60A5FA', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          Seu Anjo da Guarda
        </p>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: COLORS.text, marginBottom: 4 }}>{fd.angel.name}</h3>
        <p style={{ fontSize: 12, color: '#60A5FA', marginBottom: 12 }}>Virtude: {fd.angel.virtue}</p>
        <p style={{ fontSize: 14, color: COLORS.text, fontStyle: 'italic', lineHeight: 1.7, fontFamily: "'EB Garamond', serif" }}>
          "{fd.angel.message}"
        </p>
        {fd.angelicNumber && (
          <div style={{ marginTop: 12, fontSize: 12, color: COLORS.textMuted }}>
            Número angélico ativado: <strong style={{ color: '#60A5FA' }}>{fd.angelicNumber}</strong>
          </div>
        )}
        {fd.angelNarrative && (
          <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.12)", borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.8, fontFamily: "'EB Garamond', serif", marginBottom: 10 }}>{fd.angelNarrative.fullMessage}</p>
            <p style={{ fontSize: 12, color: "#60A5FA", fontStyle: "italic", textAlign: "center" }}>{fd.angelNarrative.prayer}</p>
          </div>
        )}
      </div>
    );
  }

  if (result.feature === 'planetaria') {
    return (
      <div style={{
        background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: 12, padding: '20px', marginBottom: 28, textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 36 }}>{fd.rulingPlanet.emoji}</div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Planeta do Dia</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.text }}>{fd.rulingPlanet.name}</p>
          </div>
          <div style={{ width: 1, background: 'rgba(167,139,250,0.2)' }} />
          <div>
            <div style={{ fontSize: 36 }}>{fd.planetaryHour.emoji}</div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Hora Planetária</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.text }}>{fd.planetaryHour.name}</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#A78BFA', fontStyle: 'italic' }}>{fd.alignment}</p>
        <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8 }}>
          Elemento: {fd.rulingPlanet.element} · Influência: {fd.rulingPlanet.influence}
        </p>
        {fd.planetNarrative && (
          <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.8, fontFamily: "'EB Garamond', serif", marginBottom: 10 }}>{fd.planetNarrative.fullNarrative}</p>
            <p style={{ fontSize: 12, color: "#A78BFA", fontStyle: "italic", textAlign: "center" }}>{fd.planetNarrative.cosmicTip}</p>
          </div>
        )}
      </div>
    );
  }

  if (result.feature === 'orixas') {
    return (
      <div style={{
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 12, padding: '20px', marginBottom: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>{fd.dayOrixa.emoji}</div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Orixá do Dia</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.text }}>{fd.dayOrixa.name}</p>
            <p style={{ fontSize: 10, color: COLORS.textMuted }}>Cor: {fd.dayOrixa.cor}</p>
          </div>
          <div style={{ width: 1, background: 'rgba(245,158,11,0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>{fd.birthOrixa.emoji}</div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Seu Orixá</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.text }}>{fd.birthOrixa.name}</p>
            <p style={{ fontSize: 10, color: COLORS.textMuted }}>Elemento: {fd.birthOrixa.element}</p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: COLORS.text, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.6, fontFamily: "'EB Garamond', serif" }}>
          "{fd.dayOrixa.affirmation}"
        </p>
        {fd.orixaNarrative && (
          <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.8, fontFamily: "'EB Garamond', serif", marginBottom: 10 }}>{fd.orixaNarrative.fullNarrative}</p>
            <p style={{ fontSize: 12, color: "#F59E0B", fontStyle: "italic", textAlign: "center" }}>{fd.orixaNarrative.ritual}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function NumberBall({ number, delay, featureColor }) {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #3d2060, #1a0f35)',
      border: '2px solid ' + (featureColor || 'rgba(201,168,76,0.5)') + '88',
      boxShadow: '0 0 15px ' + (featureColor || 'rgba(201,168,76,0.3)') + '44',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700,
      color: COLORS.goldLight, flexShrink: 0,
      animation: 'fadeInUp 0.5s ease ' + delay + 's both',
    }}>
      {number.toString().padStart(2, '0')}
    </div>
  );
}

function ResultView({ result, onNewConsult, onBackToStart }) {
  var featureData = FEATURES[result.feature];
  var featureColor = featureData.color;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #110d1e, #160f28)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 16, padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem',
          background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8,
        }}>Seus Números Sagrados</h2>
        <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24, fontStyle: 'italic' }}>
          {result.lottery.name} {result.lottery.emoji} · {featureData.name} · {result.moon.name} {result.moon.emoji}
        </p>

        <FeatureResultHeader result={result} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {result.numbers.map(function(n, i) {
            return <NumberBall key={String(n) + '-' + i} number={n} delay={i * 0.08} featureColor={featureColor} />;
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: COLORS.textMuted }}>
            ⚖️ {result.pressupostos.pares}P / {result.pressupostos.impares}I
          </div>
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: COLORS.textMuted }}>
            📊 {result.pressupostos.baixos}B / {result.pressupostos.altos}A
          </div>
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: COLORS.textMuted }}>
            🔢 Soma: {result.pressupostos.soma}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button onClick={onNewConsult} style={{
          padding: '14px 28px', background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
          color: '#06060e', border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 700, fontFamily: "'Cinzel', serif", cursor: 'pointer',
        }}>🔮 Nova Consulta</button>
        <button onClick={onBackToStart} style={{
          padding: '14px 28px', background: 'transparent',
          color: COLORS.gold, border: '1px solid rgba(201,168,76,0.4)', borderRadius: 10,
          fontSize: 14, fontFamily: "'Cinzel', serif", cursor: 'pointer',
        }}>← Outro Caminho</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  BANNER PAGAMENTO SUCESSO
// ══════════════════════════════════════
function PaymentSuccessBanner({ onDismiss }) {
  return (
    <div style={{
      background: 'rgba(61,140,110,0.12)', border: '1px solid rgba(61,140,110,0.4)',
      borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: COLORS.green, marginBottom: 6 }}>Pagamento confirmado!</h3>
      <p style={{ color: COLORS.text, fontSize: 14 }}>Seus poderes místicos estão ativados.</p>
      <button onClick={onDismiss} style={{
        marginTop: 10, padding: '6px 16px', background: 'transparent',
        border: '1px solid rgba(61,140,110,0.4)', borderRadius: 8,
        color: COLORS.green, cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: 11,
      }}>Entendi ✦</button>
    </div>
  );
}

// ══════════════════════════════════════
//  APP PRINCIPAL
// ══════════════════════════════════════
export default function App() {
  var auth = useAuth();
  var user = auth.user, profile = auth.profile, login = auth.login, loading = auth.loading, refreshProfile = auth.refreshProfile;

  var [step, setStep] = useState('features'); // features | lottery | generating | result
  var [selectedFeature, setSelectedFeature] = useState(null);
  var [selectedLottery, setSelectedLottery] = useState(null);
  var [result, setResult] = useState(null);
  var [showPlanPopup, setShowPlanPopup] = useState(false);
  var [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  var premium = isPremiumUser(profile);
  var planInfo = getPlanLabel(profile);

  // Detectar retorno do pagamento
  useEffect(function() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('pagamento') === 'sucesso') {
      setShowPaymentSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
      if (refreshProfile) {
        refreshProfile();
        setTimeout(function() { refreshProfile(); }, 3000);
        setTimeout(function() { refreshProfile(); }, 8000);
      }
    }
  }, [refreshProfile]);

  var handleFeatureSelect = function(feature) {
    setSelectedFeature(feature);
    setStep('lottery');
  };

  var handleLotterySelect = function(lottery) {
    setSelectedLottery(lottery);
    var acesso = temAcesso(profile, lottery);
    if (!acesso.permitido) {
      track('oraculo_plan_popup_opened', {
        lottery: lottery,
        feature: selectedFeature
      });
      setShowPlanPopup(true);
      return;
    }
    startGeneration(lottery);
    // Registar consumo e actualizar profile em background (fire-and-forget)
    registarConsumo(profile, acesso.consumo).then(function() {
      if (refreshProfile) refreshProfile();
    });
  };

  var startGeneration = function(lottery) {
    var lotteryKey = lottery || selectedLottery;
    setShowPlanPopup(false);
    setStep('generating');

    setTimeout(function() {
      var oracleResult = generateMysticNumbers(
        profile.birth_date,
        lotteryKey,
        selectedFeature,
        { fullName: profile.full_name, location: profile.location }
      );
      setResult(oracleResult);
      track('oraculo_consultation_completed', {
        lottery: lotteryKey,
        feature: selectedFeature,
        plan: (profile && profile.plano) || 'free'
      });
      setStep('result');
    }, 2500);
  };

  var handleNewConsult = function() {
    setResult(null);
    setStep('lottery');
  };

  var handleBackToStart = function() {
    setResult(null);
    setSelectedFeature(null);
    setSelectedLottery(null);
    setStep('features');
  };

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: COLORS.bg, color: COLORS.gold, fontFamily: "'Cinzel', serif", fontSize: 18,
      }}>✦ Consultando os astros...</div>
    );
  }

  // ── Login ──
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: COLORS.bg, color: COLORS.text, padding: 32,
        fontFamily: "'EB Garamond', serif", textAlign: 'center',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔮</div>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: '2rem', marginBottom: 12,
          background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>✦ Oráculo da Sorte</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 18, marginBottom: 32 }}>Faça login para consultar os astros</p>
        <button onClick={login} style={{
          padding: '16px 40px', background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
          color: '#06060e', border: 'none', borderRadius: 12,
          fontSize: 16, fontWeight: 700, fontFamily: "'Cinzel', serif", cursor: 'pointer',
        }}>✦ Entrar com Google</button>
      </div>
    );
  }

  // ── App ──
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, fontFamily: "'EB Garamond', serif" }}>
      <style dangerouslySetInnerHTML={{ __html: [
        "@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');",
        "@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}",
        "@keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(201,168,76,0.3)}50%{box-shadow:0 0 50px rgba(201,168,76,0.7)}}",
        "@keyframes spin-orb{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}",
      ].join('\n') }} />

      {/* Header */}
      <div style={{
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}>
        <a href="/" style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: 15,
          background: 'linear-gradient(135deg, #e8c97a, #c9a84c)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none',
        }}>✦ Oráculo da Sorte</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 13 }}>
            {profile ? profile.full_name : user.email}
          </span>
          <span style={{
            background: planInfo.bg, border: '1px solid ' + planInfo.border,
            borderRadius: 20, padding: '3px 10px', fontSize: 11, color: planInfo.color,
            fontFamily: "'Cinzel', serif",
          }}>{planInfo.label}</span>
          {(function() {
            if (isPremiumUser(profile)) return false;
            if (profile && profile.creditos_restantes > 0) return (
              <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: COLORS.gold, fontFamily: "'Cinzel', serif" }}>{profile.creditos_restantes} crédito{profile.creditos_restantes !== 1 ? 's' : ''}</span>
            );
            if (profile && isInTrialPeriod(profile) && !usouMegasenaHoje(profile)) return (
              <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: COLORS.gold, fontFamily: "'Cinzel', serif" }}>1 grátis hoje</span>
            );
            if (profile && isInTrialPeriod(profile) && usouMegasenaHoje(profile)) return (
              <span style={{ background: 'rgba(168,152,128,0.15)', border: '1px solid rgba(168,152,128,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: COLORS.textMuted, fontFamily: "'Cinzel', serif" }}>Próxima grátis amanhã</span>
            );
            return false;
          })()}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '32px 20px' }}>

        {showPaymentSuccess && <PaymentSuccessBanner onDismiss={function() { setShowPaymentSuccess(false); }} />}

        {/* Saudação */}
        {step === 'features' && (
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif", fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6,
            }}>
              {profile && profile.full_name ? 'Olá, ' + profile.full_name.split(' ')[0] : 'Olá, Buscador'}
            </h1>
          </div>
        )}

        {/* Etapas */}
        {step === 'features' && <FeatureSelection onSelect={handleFeatureSelect} />}

        {step === 'lottery' && (
          <LotterySelection
            feature={selectedFeature}
            onSelect={handleLotterySelect}
            onBack={handleBackToStart}
            isPremium={premium}
            profile={profile}
          />
        )}

        {step === 'generating' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 100, height: 100, margin: '0 auto 24px', borderRadius: '50%',
              border: '2px solid rgba(201,168,76,0.3)', borderTop: '2px solid #c9a84c',
              animation: 'spin-orb 1s linear infinite',
            }} />
            <p style={{ fontFamily: "'Cinzel', serif", color: COLORS.gold, fontSize: 16, fontStyle: 'italic' }}>
              ✦ O {FEATURES[selectedFeature].name} está revelando seus números...
            </p>
          </div>
        )}

        {step === 'result' && result && (
          <ResultView result={result} onNewConsult={handleNewConsult} onBackToStart={handleBackToStart} />
        )}

        {/* Disclaimer */}
        <p style={{
          textAlign: 'center', color: COLORS.textMuted, fontSize: 11, marginTop: 48, opacity: 0.5, lineHeight: 1.6,
        }}>
          ⚖️ O Oráculo da Sorte é entretenimento espiritual. Não garantimos resultados em jogos de azar. Jogue com responsabilidade.
        </p>
      </div>

      {/* Plan Popup */}
      {showPlanPopup && <PlanPopup onClose={function() { setShowPlanPopup(false); setStep('lottery'); }} feature={selectedFeature} />}
    </div>
  );
}
