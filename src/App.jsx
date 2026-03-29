// src/App.jsx — Página de Consulta do Oráculo
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { generateMysticNumbers, getMoonPhase, calcLifeNumber, getOrixaOfDay, LOTTERIES } from './oracle.js';

const COLORS = {
  bg: "#0a0612",
  gold: "#c9a84c",
  goldLight: "#e8c97a",
  amber: "#d4813a",
  text: "#f0e6d3",
  textMuted: "#a89880",
  green: "#3d8c6e",
  red: "#c94c4c",
};

// ══════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════
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

// ══════════════════════════════════════
//  COMPONENTES
// ══════════════════════════════════════
function MoonCard({ moon }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #110d1e, #160f28)',
      border: '1px solid rgba(201,168,76,0.25)',
      borderRadius: 16, padding: '28px 24px',
      textAlign: 'center', marginBottom: 24,
    }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{moon.emoji}</div>
      <h3 style={{
        fontFamily: "'Cinzel', serif", fontSize: 18,
        color: COLORS.gold, marginBottom: 4,
      }}>{moon.name}</h3>
      <p style={{ color: COLORS.textMuted, fontSize: 14, fontStyle: 'italic' }}>
        Energia de <strong style={{ color: COLORS.text }}>{moon.energy}</strong> — fase de {moon.influence}
      </p>
    </div>
  );
}

function OrixaCard({ orixa }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #110d1e, #160f28)',
      border: '1px solid rgba(201,168,76,0.25)',
      borderRadius: 16, padding: '24px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 36 }}>{orixa.emoji}</span>
        <div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: COLORS.gold, marginBottom: 2 }}>
            Orixá do Dia: {orixa.name}
          </h3>
          <p style={{ fontSize: 12, color: COLORS.textMuted }}>
            Cor: {orixa.cor} · Elemento: {orixa.element}
          </p>
        </div>
      </div>
      <p style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.7, fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>
        "{orixa.affirmation}"
      </p>
    </div>
  );
}

function LotterySelector({ selected, onSelect, isPremium }) {
  const lotteryKeys = Object.keys(LOTTERIES);

  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{
        fontFamily: "'Cinzel', serif", fontSize: 12,
        color: COLORS.gold, letterSpacing: '0.15em',
        textTransform: 'uppercase', marginBottom: 16, textAlign: 'center',
      }}>
        Escolha sua loteria
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10,
      }}>
        {lotteryKeys.map(function(key) {
          var lot = LOTTERIES[key];
          var isSelected = selected === key;
          var isLocked = lot.premium && !isPremium;

          return (
            <button
              key={key}
              onClick={function() { if (!isLocked) onSelect(key); }}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(212,129,58,0.15))'
                  : isLocked
                    ? 'rgba(255,255,255,0.02)'
                    : 'linear-gradient(135deg, #110d1e, #160f28)',
                border: isSelected
                  ? '2px solid rgba(201,168,76,0.6)'
                  : '1px solid rgba(201,168,76,0.15)',
                borderRadius: 12,
                padding: '16px 12px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.4 : 1,
                transition: 'all 0.2s ease',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {isLocked && (
                <span style={{
                  position: 'absolute', top: 6, right: 8,
                  fontSize: 12,
                }}>🔒</span>
              )}
              <div style={{ fontSize: 28, marginBottom: 6 }}>{lot.emoji}</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 11,
                color: isSelected ? COLORS.gold : COLORS.text,
                fontWeight: isSelected ? 700 : 400,
                letterSpacing: '0.03em',
              }}>
                {lot.name}
              </div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
                {lot.desc}
              </div>
            </button>
          );
        })}
      </div>
      {!isPremium && (
        <p style={{ textAlign: 'center', fontSize: 13, color: COLORS.textMuted, marginTop: 12, fontStyle: 'italic' }}>
          🔒 Assine o plano Místico para desbloquear todas as loterias
        </p>
      )}
    </div>
  );
}

function NumberBall({ number, delay }) {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #3d2060, #1a0f35)',
      border: '2px solid rgba(201,168,76,0.5)',
      boxShadow: '0 0 20px rgba(201,168,76,0.3), inset 0 0 15px rgba(201,168,76,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700,
      color: COLORS.goldLight,
      animation: 'fadeInUp 0.6s ease ' + delay + 's both',
      flexShrink: 0,
    }}>
      {number.toString().padStart(2, '0')}
    </div>
  );
}

function ResultCard({ result }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #110d1e, #160f28)',
      border: '1px solid rgba(201,168,76,0.3)',
      borderRadius: 16, padding: '36px 28px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
      <h2 style={{
        fontFamily: "'Cinzel Decorative', serif", fontSize: '1.4rem',
        background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 8,
      }}>
        Os astros revelaram seus números
      </h2>
      <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 28, fontStyle: 'italic' }}>
        {result.lottery.name} {result.lottery.emoji} · {result.moon.name} {result.moon.emoji} · Número de Vida: {result.lifeNumber}
      </p>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 10,
        flexWrap: 'wrap', marginBottom: 32,
      }}>
        {result.numbers.map(function(n, i) {
          return <NumberBall key={String(n) + '-' + i} number={n} delay={i * 0.1} />;
        })}
      </div>

      {/* Leitura Mística */}
      <div style={{
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: 12, padding: '20px 24px',
        textAlign: 'left', marginBottom: 24,
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: 12,
          color: COLORS.gold, letterSpacing: '0.15em',
          textTransform: 'uppercase', marginBottom: 12,
        }}>
          🔮 Leitura Mística
        </p>
        <p style={{ color: COLORS.text, fontSize: 15, lineHeight: 1.8, fontFamily: "'EB Garamond', serif" }}>
          Sob a energia da <strong style={{ color: COLORS.gold }}>{result.moon.name}</strong>,
          fase de <em>{result.moon.influence}</em>, com a proteção de{' '}
          <strong style={{ color: COLORS.gold }}>{result.orixa.name} {result.orixa.emoji}</strong>,
          o Oráculo combinou a vibração do seu Número de Vida{' '}
          <strong style={{ color: COLORS.gold }}>({result.lifeNumber})</strong> com
          a ressonância do dia <strong style={{ color: COLORS.gold }}>({result.dayVibration})</strong>{' '}
          para revelar {result.lottery.pick} números sagrados na <strong>{result.lottery.name}</strong>.
        </p>
        <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 12, fontStyle: 'italic' }}>
          Jogue com intenção, não com sorte cega. Este é um momento de conexão espiritual.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 8, padding: '8px 14px', fontSize: 12, color: COLORS.textMuted,
        }}>
          ⚖️ {result.pressupostos.pares}P / {result.pressupostos.impares}I
        </div>
        <div style={{
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 8, padding: '8px 14px', fontSize: 12, color: COLORS.textMuted,
        }}>
          📊 {result.pressupostos.baixos}B / {result.pressupostos.altos}A
        </div>
        <div style={{
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 8, padding: '8px 14px', fontSize: 12, color: COLORS.textMuted,
        }}>
          🔢 Soma: {result.pressupostos.soma}
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessBanner({ onDismiss }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(61,140,110,0.15), rgba(61,140,110,0.05))',
      border: '1px solid rgba(61,140,110,0.4)',
      borderRadius: 12, padding: '20px 24px',
      marginBottom: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: COLORS.green, marginBottom: 8 }}>
        Pagamento confirmado!
      </h3>
      <p style={{ color: COLORS.text, fontSize: 15, marginBottom: 4 }}>
        Seus poderes místicos estão ativados. Todas as loterias e features premium estão disponíveis.
      </p>
      <p style={{ color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic' }}>
        Se o plano ainda mostrar "Livre", aguarde alguns segundos e recarregue a página.
      </p>
      <button onClick={onDismiss} style={{
        marginTop: 12, padding: '8px 20px',
        background: 'transparent', border: '1px solid rgba(61,140,110,0.4)',
        borderRadius: 8, color: COLORS.green, cursor: 'pointer',
        fontFamily: "'Cinzel', serif", fontSize: 12,
      }}>
        Entendi ✦
      </button>
    </div>
  );
}

// ══════════════════════════════════════
//  APP PRINCIPAL
// ══════════════════════════════════════
export default function App() {
  const { user, profile, login, loading, refreshProfile } = useAuth();
  const [selectedLottery, setSelectedLottery] = useState('megasena');
  const [result, setResult] = useState(null);
  const [consulted, setConsulted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const moon = getMoonPhase();
  const orixa = getOrixaOfDay();
  const premium = isPremiumUser(profile);
  const planInfo = getPlanLabel(profile);

  // Detectar retorno do pagamento
  useEffect(function() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('pagamento') === 'sucesso') {
      setShowPaymentSuccess(true);
      // Limpar a URL sem recarregar
      window.history.replaceState({}, '', window.location.pathname);
      // Atualizar o perfil para pegar o plano novo
      if (refreshProfile) {
        // Tentar imediatamente e depois de 3s (webhook pode demorar)
        refreshProfile();
        setTimeout(function() { refreshProfile(); }, 3000);
        setTimeout(function() { refreshProfile(); }, 8000);
      }
    }
  }, [refreshProfile]);

  // Controle de consulta diária (só para free)
  useEffect(function() {
    if (user && !premium) {
      var key = 'oracle_consulted_' + user.id + '_' + selectedLottery;
      var lastConsult = localStorage.getItem(key);
      var today = new Date().toDateString();
      if (lastConsult === today) {
        setConsulted(true);
        var savedResult = localStorage.getItem(key + '_result');
        if (savedResult) setResult(JSON.parse(savedResult));
      } else {
        setConsulted(false);
        setResult(null);
      }
    } else if (premium) {
      // Premium: sem limite diário, resetar estado ao trocar loteria
      setConsulted(false);
      setResult(null);
    }
  }, [user, premium, selectedLottery]);

  var handleConsult = function() {
    if (!profile || !profile.birth_date) return;
    setAnimating(true);

    setTimeout(function() {
      var oracleResult = generateMysticNumbers(profile.birth_date, selectedLottery);
      setResult(oracleResult);
      setAnimating(false);

      if (!premium) {
        // Free: marcar como consultado hoje
        setConsulted(true);
        var key = 'oracle_consulted_' + user.id + '_' + selectedLottery;
        localStorage.setItem(key, new Date().toDateString());
        localStorage.setItem(key + '_result', JSON.stringify(oracleResult));
      }
    }, 2500);
  };

  var handleNewConsult = function() {
    setResult(null);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: COLORS.bg, color: COLORS.gold,
        fontFamily: "'Cinzel', serif", fontSize: 18,
      }}>
        ✦ Consultando os astros...
      </div>
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
        }}>
          ✦ Oráculo da Sorte
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 18, marginBottom: 32 }}>
          Faça login para consultar os astros
        </p>
        <button onClick={login} style={{
          padding: '16px 40px',
          background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
          color: '#06060e', border: 'none', borderRadius: 12,
          fontSize: 16, fontWeight: 700, fontFamily: "'Cinzel', serif",
          cursor: 'pointer', letterSpacing: '0.05em',
        }}>
          ✦ Entrar com Google
        </button>
      </div>
    );
  }

  // ── App principal ──
  return (
    <div style={{
      minHeight: '100vh', background: COLORS.bg,
      color: COLORS.text, fontFamily: "'EB Garamond', serif",
    }}>
      <style dangerouslySetInnerHTML={{ __html: [
        "@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');",
        "@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }",
        "@keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.3); } 50% { box-shadow: 0 0 50px rgba(201,168,76,0.7); } }",
        "@keyframes spin-orb { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }",
      ].join('\n') }} />

      {/* Header */}
      <div style={{
        padding: '20px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}>
        <a href="/" style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: 16,
          background: 'linear-gradient(135deg, #e8c97a, #c9a84c)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}>
          ✦ Oráculo da Sorte
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 14 }}>
            {profile ? profile.full_name : user.email}
          </span>
          <span style={{
            background: planInfo.bg,
            border: '1px solid ' + planInfo.border,
            borderRadius: 20, padding: '4px 12px', fontSize: 12,
            color: planInfo.color,
            fontFamily: "'Cinzel', serif",
          }}>
            {planInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>

        {/* Banner de pagamento bem-sucedido */}
        {showPaymentSuccess && (
          <PaymentSuccessBanner onDismiss={function() { setShowPaymentSuccess(false); }} />
        )}

        {/* Saudação */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: '1.6rem',
            background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            {profile && profile.full_name ? 'Olá, ' + profile.full_name.split(' ')[0] : 'Olá, Buscador'}
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 16, fontStyle: 'italic' }}>
            Os astros esperam por você
          </p>
        </div>

        {/* Lua */}
        <MoonCard moon={moon} />

        {/* Orixá do dia (premium) */}
        {premium && <OrixaCard orixa={orixa} />}

        {/* Seletor de loterias */}
        <LotterySelector
          selected={selectedLottery}
          onSelect={function(key) { setSelectedLottery(key); setResult(null); }}
          isPremium={premium}
        />

        {/* Resultado */}
        {result ? (
          <div>
            <ResultCard result={result} />
            {premium && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button onClick={handleNewConsult} style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
                  color: '#06060e', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  fontFamily: "'Cinzel', serif",
                  cursor: 'pointer', letterSpacing: '0.05em',
                }}>
                  🔮 Nova Consulta
                </button>
              </div>
            )}
          </div>
        ) : animating ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 100, height: 100, margin: '0 auto 24px',
              borderRadius: '50%',
              border: '2px solid rgba(201,168,76,0.3)',
              borderTop: '2px solid #c9a84c',
              animation: 'spin-orb 1s linear infinite',
            }} />
            <p style={{
              fontFamily: "'Cinzel', serif", color: COLORS.gold,
              fontSize: 16, fontStyle: 'italic',
            }}>
              ✦ O Oráculo está lendo as estrelas...
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #110d1e, #160f28)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 16, padding: '36px 28px', marginBottom: 24,
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{LOTTERIES[selectedLottery].emoji}</div>
              <h3 style={{
                fontFamily: "'Cinzel', serif", fontSize: 18,
                color: COLORS.text, marginBottom: 8,
              }}>
                {LOTTERIES[selectedLottery].name}
              </h3>
              <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
                O Oráculo combina sua numerologia pessoal com a energia da {moon.name} para
                revelar {LOTTERIES[selectedLottery].pick} números sagrados.
              </p>

              {consulted && !premium ? (
                <div>
                  <p style={{ color: COLORS.amber, fontSize: 15, fontStyle: 'italic' }}>
                    🌙 Você já consultou o Oráculo hoje para {LOTTERIES[selectedLottery].name}.
                  </p>
                  <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 8 }}>
                    Volte amanhã para uma nova leitura, ou desbloqueie consultas ilimitadas.
                  </p>
                  <a href="/pricing" style={{
                    display: 'inline-block', marginTop: 16,
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
                    color: '#06060e', borderRadius: 10,
                    fontWeight: 700, fontSize: 14,
                    fontFamily: "'Cinzel', serif",
                    textDecoration: 'none',
                  }}>
                    ✦ Desbloquear Poderes Místicos
                  </a>
                </div>
              ) : (
                <button onClick={handleConsult} style={{
                  padding: '16px 40px',
                  background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
                  color: '#06060e', border: 'none', borderRadius: 12,
                  fontSize: 16, fontWeight: 700,
                  fontFamily: "'Cinzel', serif",
                  cursor: 'pointer', letterSpacing: '0.05em',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}>
                  🔮 Consultar o Oráculo
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upgrade CTA (para free users) */}
        {!premium && (
          <div style={{
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 12, padding: '20px 24px',
            textAlign: 'center', marginTop: 24,
          }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.gold, marginBottom: 8 }}>
              ✨ Desbloqueie o poder completo do Oráculo
            </p>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
              Todas as 7 loterias · Consultas ilimitadas · Ritual dos Orixás · Ciclos lunares · Padrões históricos
            </p>
            <a href="/pricing" style={{
              display: 'inline-block', padding: '10px 24px',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(212,129,58,0.1))',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 8, color: COLORS.gold,
              fontFamily: "'Cinzel', serif", fontSize: 13,
              textDecoration: 'none', fontWeight: 600,
            }}>
              Ver Planos →
            </a>
          </div>
        )}

        {/* Disclaimer */}
        <p style={{
          textAlign: 'center', color: COLORS.textMuted,
          fontSize: 11, marginTop: 40, opacity: 0.5,
          lineHeight: 1.6,
        }}>
          ⚖️ O Oráculo da Sorte é entretenimento espiritual.
          Não garantimos resultados em jogos de azar.
          Jogue com responsabilidade.
        </p>
      </div>
    </div>
  );
}
