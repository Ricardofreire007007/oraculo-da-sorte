import { useState } from "react";

/*
 * ─────────────────────────────────────────────
 *  ORÁCULO DA SORTE — Pricing Component
 * ─────────────────────────────────────────────
 *  3 planos: Livre · Místico · Sagrado
 *  + Pay-per-use (R$1,99/consulta)
 *
 *  Integração Stripe via /api/create-checkout
 *  Substituir os PRICE IDs pelos seus do Stripe
 * ─────────────────────────────────────────────
 */

// ══════════════════════════════════════
//  CONFIGURAÇÃO — Atualize com seus Price IDs do Stripe
// ══════════════════════════════════════
const PLAN_IDS = {
  mistico: "mistico",
  sagrado: "sagrado",
  consulta: "consulta",
};

// ══════════════════════════════════════
//  DADOS DOS PLANOS
// ══════════════════════════════════════
const plans = [
  {
    id: "livre",
    name: "Livre",
    icon: "☽",
    price: "Grátis",
    period: "",
    description: "Para quem quer explorar as energias do acaso",
    features: [
      "1 consulta por dia",
      "Mega-Sena apenas",
      "Números aleatórios básicos",
      "Sem análise mística",
    ],
    cta: "Começar Grátis",
    popular: false,
    stripe: null,
  },
  {
    id: "mistico",
    name: "Místico",
    icon: "✦",
    price: "R$ 9,99",
    period: "/semana",
    description: "Desbloqueie o poder dos astros e da numerologia",
    features: [
      "Consultas ilimitadas",
      "Todas as loterias brasileiras",
      "Análise astrológica personalizada",
      "Numerologia por data de nascimento",
      "Mapa de frequências e padrões",
      "Leitura mística do Oráculo",
    ],
    cta: "Ativar Poderes",
    popular: true,
    stripe: "mistico",
  },
  {
    id: "sagrado",
    name: "Sagrado",
    icon: "◈",
    price: "R$ 29,99",
    period: "/mês",
    description: "A experiência completa para os verdadeiros iniciados",
    features: [
      "Tudo do plano Místico",
      "Análise de ciclos lunares",
      "Combinações com Tarot e Orixás",
      "Histórico completo de consultas",
      "Alertas de alinhamento cósmico",
      "Economia de 25% vs semanal",
    ],
    cta: "Ascender Agora",
    popular: false,
    stripe: "sagrado",
  },
];

// ══════════════════════════════════════
//  ESTILOS
// ══════════════════════════════════════

const fonts = {
  display: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const colors = {
  bg: "#06060e",
  card: "#0c0c18",
  cardBorder: "#1a1a2e",
  cardPopular: "#0f0f22",
  cardPopularBorder: "#c9a84c44",
  gold: "#c9a84c",
  goldLight: "#e8d48b",
  goldDim: "#8a7230",
  text: "#e8e4dc",
  textDim: "#7a7670",
  textMuted: "#4a4640",
  accent: "#1e1b4b",
  purple: "#7c6aef",
  purpleDim: "#4a3f8a",
};

const s = {
  // ── Container ──
  section: {
    background: colors.bg,
    minHeight: "100vh",
    padding: "80px 20px 60px",
    position: "relative",
    overflow: "hidden",
    fontFamily: fonts.body,
  },

  // ── Fundo estelar ──
  starsOverlay: {
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(1px 1px at 10% 20%, rgba(201,168,76,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 60%, rgba(201,168,76,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 80%, rgba(201,168,76,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.15) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 20% 90%, rgba(201,168,76,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 60% 50%, rgba(201,168,76,0.2) 0%, transparent 100%)
    `,
    pointerEvents: "none",
    zIndex: 0,
  },

  glowTop: {
    position: "absolute",
    top: "-200px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "800px",
    height: "500px",
    background: `radial-gradient(ellipse, ${colors.gold}08 0%, transparent 70%)`,
    pointerEvents: "none",
    zIndex: 0,
  },

  // ── Header ──
  header: {
    textAlign: "center",
    marginBottom: "56px",
    position: "relative",
    zIndex: 1,
  },

  badge: {
    display: "inline-block",
    padding: "6px 18px",
    border: `1px solid ${colors.goldDim}66`,
    borderRadius: "40px",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: colors.goldDim,
    marginBottom: "24px",
    background: `${colors.gold}08`,
  },

  title: {
    fontFamily: fonts.display,
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 300,
    color: colors.text,
    margin: "0 0 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.5px",
  },

  titleAccent: {
    fontWeight: 600,
    fontStyle: "italic",
    color: colors.gold,
  },

  subtitle: {
    fontSize: "16px",
    color: colors.textDim,
    maxWidth: "480px",
    margin: "0 auto",
    lineHeight: 1.6,
  },

  // ── Grid ──
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    maxWidth: "960px",
    margin: "0 auto 56px",
    position: "relative",
    zIndex: 1,
  },

  // ── Card ──
  card: (popular, hover) => ({
    position: "relative",
    background: popular ? colors.cardPopular : colors.card,
    border: `1px solid ${popular ? colors.cardPopularBorder : colors.cardBorder}`,
    borderRadius: "16px",
    padding: popular ? "36px 28px 32px" : "32px 28px",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
    transform: hover ? "translateY(-6px)" : "translateY(0)",
    boxShadow: hover
      ? popular
        ? `0 20px 60px ${colors.gold}15, 0 0 40px ${colors.gold}08`
        : `0 16px 48px rgba(0,0,0,0.5)`
      : "none",
    overflow: "hidden",
  }),

  popularTag: {
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
    color: "#06060e",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.8px",
    textTransform: "uppercase",
    padding: "5px 20px",
    borderRadius: "0 0 8px 8px",
  },

  cardGlow: {
    position: "absolute",
    top: "-100px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "300px",
    height: "200px",
    background: `radial-gradient(ellipse, ${colors.gold}0a 0%, transparent 70%)`,
    pointerEvents: "none",
  },

  icon: {
    fontSize: "28px",
    marginBottom: "16px",
    filter: "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
  },

  planName: {
    fontFamily: fonts.display,
    fontSize: "24px",
    fontWeight: 600,
    color: colors.text,
    margin: "0 0 6px",
    letterSpacing: "0.5px",
  },

  planDesc: {
    fontSize: "13px",
    color: colors.textDim,
    margin: "0 0 20px",
    lineHeight: 1.5,
  },

  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
    marginBottom: "24px",
  },

  priceValue: {
    fontFamily: fonts.display,
    fontSize: "36px",
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1,
  },

  pricePeriod: {
    fontSize: "14px",
    color: colors.textMuted,
  },

  divider: {
    height: "1px",
    background: `linear-gradient(90deg, transparent, ${colors.cardBorder}, transparent)`,
    margin: "0 0 20px",
  },

  featureList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 28px",
    flex: 1,
  },

  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "7px 0",
    fontSize: "13.5px",
    color: colors.textDim,
    lineHeight: 1.45,
  },

  featureCheck: (popular) => ({
    flexShrink: 0,
    marginTop: "2px",
    fontSize: "11px",
    color: popular ? colors.gold : colors.purpleDim,
  }),

  // ── Botões ──
  btnPrimary: (hover) => ({
    width: "100%",
    padding: "14px 24px",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: fonts.body,
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: hover
      ? `linear-gradient(135deg, ${colors.goldLight}, ${colors.gold})`
      : `linear-gradient(135deg, ${colors.gold}, ${colors.goldDim})`,
    color: "#06060e",
    transform: hover ? "scale(1.02)" : "scale(1)",
    boxShadow: hover
      ? `0 8px 24px ${colors.gold}40`
      : `0 2px 8px ${colors.gold}20`,
  }),

  btnSecondary: (hover) => ({
    width: "100%",
    padding: "14px 24px",
    background: hover ? `${colors.cardBorder}` : "transparent",
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: fonts.body,
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: colors.textDim,
  }),

  // ── Pay-per-use ──
  payPerUse: {
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },

  ppuBox: (hover) => ({
    background: colors.card,
    border: `1px solid ${hover ? colors.goldDim + "66" : colors.cardBorder}`,
    borderRadius: "14px",
    padding: "32px",
    transition: "all 0.3s ease",
  }),

  ppuTitle: {
    fontFamily: fonts.display,
    fontSize: "20px",
    fontWeight: 500,
    color: colors.text,
    margin: "0 0 8px",
  },

  ppuDesc: {
    fontSize: "14px",
    color: colors.textDim,
    margin: "0 0 20px",
    lineHeight: 1.5,
  },

  ppuPrice: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: "4px",
    background: `${colors.gold}0a`,
    border: `1px solid ${colors.gold}22`,
    borderRadius: "8px",
    padding: "8px 20px",
    marginBottom: "20px",
  },

  ppuValue: {
    fontFamily: fonts.display,
    fontSize: "24px",
    fontWeight: 700,
    color: colors.gold,
  },

  ppuPer: {
    fontSize: "13px",
    color: colors.goldDim,
  },

  ppuBtn: (hover) => ({
    display: "inline-block",
    padding: "12px 36px",
    background: hover ? `${colors.accent}` : "transparent",
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: fonts.body,
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: colors.textDim,
    letterSpacing: "0.5px",
  }),

  // ── Footer note ──
  footer: {
    textAlign: "center",
    marginTop: "48px",
    position: "relative",
    zIndex: 1,
  },

  footerText: {
    fontSize: "12px",
    color: colors.textMuted,
    lineHeight: 1.6,
  },

  // ── Loading ──
  loadingOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,6,14,0.85)",
    backdropFilter: "blur(4px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  spinner: {
    width: "36px",
    height: "36px",
    border: `2px solid ${colors.cardBorder}`,
    borderTop: `2px solid ${colors.gold}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "16px",
  },

  loadingText: {
    fontFamily: fonts.display,
    fontSize: "16px",
    color: colors.textDim,
    fontStyle: "italic",
  },
};

// ══════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════
export default function Pricing() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredPpu, setHoveredPpu] = useState(false);
  const [btnHover, setBtnHover] = useState(null);
  const [ppuBtnHover, setPpuBtnHover] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Stripe Checkout ──
 const handleCheckout = async (plan) => {
    if (!plan) return; // Plano Livre → não faz checkout
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Erro ao criar sessão:", data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro no checkout:", err);
      setLoading(false);
    }
  };

  const handleFree = () => {
    // Redireciona para o app ou para o cadastro
    window.location.href = "/app";
  };

  return (
    <section style={s.section}>
      {/* Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background */}
      <div style={s.starsOverlay} />
      <div style={s.glowTop} />

      {/* Loading */}
      {loading && (
        <div style={s.loadingOverlay}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Conectando ao portal de pagamento…</p>
        </div>
      )}

      {/* Header */}
      <header style={s.header}>
        <div style={s.badge}>Escolha seu caminho</div>
        <h2 style={s.title}>
          Cada jornada mística{" "}
          <span style={s.titleAccent}>tem seu preço</span>
        </h2>
        <p style={s.subtitle}>
          Do acaso livre à leitura profunda dos astros — escolha o nível de
          revelação que deseja receber do Oráculo.
        </p>
      </header>

      {/* Plans Grid */}
      <div style={s.grid}>
        {plans.map((plan, i) => {
          const isHovered = hoveredCard === plan.id;
          const isBtnHovered = btnHover === plan.id;

          return (
            <div
              key={plan.id}
              style={{
                ...s.card(plan.popular, isHovered),
                animation: `fadeUp 0.6s ease ${i * 0.12}s both`,
              }}
              onMouseEnter={() => setHoveredCard(plan.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular tag */}
              {plan.popular && <div style={s.popularTag}>Mais Popular</div>}

              {/* Glow (popular only) */}
              {plan.popular && <div style={s.cardGlow} />}

              {/* Icon */}
              <div style={s.icon}>{plan.icon}</div>

              {/* Name & Description */}
              <h3 style={s.planName}>{plan.name}</h3>
              <p style={s.planDesc}>{plan.description}</p>

              {/* Price */}
              <div style={s.priceRow}>
                <span style={s.priceValue}>{plan.price}</span>
                {plan.period && (
                  <span style={s.pricePeriod}>{plan.period}</span>
                )}
              </div>

              {/* Divider */}
              <div style={s.divider} />

              {/* Features */}
              <ul style={s.featureList}>
                {plan.features.map((feat, j) => (
                  <li key={j} style={s.featureItem}>
                    <span style={s.featureCheck(plan.popular)}>✦</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() =>
                  plan.stripe
                    ? handleCheckout(plan.stripe)
                    : handleFree()
                }
                onMouseEnter={() => setBtnHover(plan.id)}
                onMouseLeave={() => setBtnHover(null)}
                style={
                  plan.popular
                    ? s.btnPrimary(isBtnHovered)
                    : s.btnSecondary(isBtnHovered)
                }
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pay-per-use */}
      <div style={s.payPerUse}>
        <div
          style={s.ppuBox(hoveredPpu)}
          onMouseEnter={() => setHoveredPpu(true)}
          onMouseLeave={() => setHoveredPpu(false)}
        >
          <h3 style={s.ppuTitle}>Consulta Avulsa</h3>
          <p style={s.ppuDesc}>
            Sem compromisso? Faça uma consulta única ao Oráculo
            com análise mística completa, sem precisar de assinatura.
          </p>
          <div style={s.ppuPrice}>
            <span style={s.ppuValue}>R$ 1,99</span>
            <span style={s.ppuPer}>/consulta</span>
          </div>
          <br />
          <button
            onClick={() => handleCheckout("consulta")}
            onMouseEnter={() => setPpuBtnHover(true)}
            onMouseLeave={() => setPpuBtnHover(false)}
            style={s.ppuBtn(ppuBtnHover)}
          >
            Consultar o Oráculo
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={s.footerText}>
          Pagamentos processados com segurança via Stripe.
          <br />
          Cancele quando quiser — sem multas, sem mistério.
          <br />
          <br />
          ⚠️ O Oráculo da Sorte é entretenimento espiritual.
          <br />
          Não garantimos resultados em jogos de azar.
        </p>
      </footer>
    </section>
  );
}
