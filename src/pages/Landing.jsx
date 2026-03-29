import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext.jsx";
import OnboardingPopup from "../OnboardingPopup.jsx";

const COLORS = {
  bg: "#0a0612",
  bgCard: "#110d1e",
  gold: "#c9a84c",
  goldLight: "#e8c97a",
  amber: "#d4813a",
  indigo: "#1e1535",
  indigoLight: "#2a1e4a",
  text: "#f0e6d3",
  textMuted: "#a89880",
  green: "#3d8c6e",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'EB Garamond', Georgia, serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.gold}; border-radius: 3px; }

  .cinzel { font-family: 'Cinzel', serif; }
  .cinzel-deco { font-family: 'Cinzel Decorative', serif; }

  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse-gold { 0%, 100% { box-shadow: 0 0 15px rgba(201,168,76,0.3); } 50% { box-shadow: 0 0 35px rgba(201,168,76,0.7); } }
  @keyframes orbit { from { transform: rotate(0deg) translateX(80px) rotate(0deg); } to { transform: rotate(360deg) translateX(80px) rotate(-360deg); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes glow-breathe { 0%, 100% { box-shadow: 0 0 30px rgba(180,155,100,0.2); } 50% { box-shadow: 0 0 55px rgba(180,155,100,0.45); } }
  @keyframes pulse-ring { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.5; } }

  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
  .animate-pulse-gold { animation: pulse-gold 2s ease-in-out infinite; }

  .star {
    position: absolute; border-radius: 50%; background: white;
    animation: twinkle var(--duration, 3s) ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }

  .gradient-text {
    background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 50%, ${COLORS.amber} 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .divider { width: 120px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.gold}, transparent); margin: 0 auto; }

  .card-mystical {
    background: linear-gradient(135deg, ${COLORS.bgCard} 0%, #160f28 100%);
    border: 1px solid rgba(201,168,76,0.2); border-radius: 16px;
    position: relative; overflow: hidden; transition: all 0.3s ease;
  }
  .card-mystical::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at top left, rgba(201,168,76,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .card-mystical:hover {
    border-color: rgba(201,168,76,0.5); transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(201,168,76,0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, ${COLORS.amber} 0%, ${COLORS.gold} 100%);
    color: #1a0f00; border: none; padding: 16px 36px;
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 15px;
    letter-spacing: 0.08em; border-radius: 8px; cursor: pointer;
    transition: all 0.3s ease; text-transform: uppercase;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.5); }

  .btn-outline {
    background: transparent; color: ${COLORS.gold};
    border: 1px solid ${COLORS.gold}; padding: 14px 32px;
    font-family: 'Cinzel', serif; font-weight: 600; font-size: 14px;
    letter-spacing: 0.08em; border-radius: 8px; cursor: pointer;
    transition: all 0.3s ease; text-transform: uppercase;
  }
  .btn-outline:hover { background: rgba(201,168,76,0.1); transform: translateY(-2px); }

  .section-title {
    font-family: 'Cinzel Decorative', serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    text-align: center; margin-bottom: 12px;
  }

  .nav-link {
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.1em;
    color: ${COLORS.textMuted}; text-decoration: none; cursor: pointer;
    transition: color 0.2s; text-transform: uppercase;
  }
  .nav-link:hover { color: ${COLORS.gold}; }

  .tab-btn {
    padding: 10px 24px; border-radius: 6px;
    border: 1px solid rgba(201,168,76,0.3);
    font-family: 'Cinzel', serif; font-size: 13px;
    cursor: pointer; transition: all 0.2s; text-transform: uppercase;
  }
  .tab-btn.active {
    background: linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold});
    color: #1a0f00; border-color: transparent; font-weight: 700;
  }
  .tab-btn:not(.active) { background: transparent; color: ${COLORS.textMuted}; }
  .tab-btn:not(.active):hover { border-color: ${COLORS.gold}; color: ${COLORS.gold}; }

  .feature-icon {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(212,129,58,0.1));
    border: 1px solid rgba(201,168,76,0.25);
  }

  .testimonial-card {
    background: linear-gradient(135deg, #110d1e, #160f28);
    border: 1px solid rgba(201,168,76,0.15); border-radius: 16px; padding: 28px; position: relative;
  }
  .testimonial-card::before {
    content: '"'; position: absolute; top: -10px; left: 24px;
    font-family: 'Cinzel Decorative', serif; font-size: 60px; color: ${COLORS.gold}; opacity: 0.3;
  }

  .glow-line {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, ${COLORS.gold} 30%, ${COLORS.amber} 70%, transparent 100%);
    opacity: 0.4;
  }

  .accordion-header {
    width: 100%; background: transparent; border: none; text-align: left;
    padding: 20px 24px; cursor: pointer; display: flex; align-items: center;
    justify-content: space-between; font-family: 'Cinzel', serif; font-size: 14px;
    letter-spacing: 0.05em; color: ${COLORS.text}; transition: color 0.2s;
  }
  .accordion-header:hover { color: ${COLORS.gold}; }

  .mystic-path-card {
    position: relative; overflow: hidden; border-radius: 16px;
    background: linear-gradient(135deg, #110d1e, #160f28);
    border: 1px solid rgba(201,168,76,0.15);
    padding: 36px 24px; text-align: center; cursor: pointer;
    transition: all 0.4s ease; text-decoration: none; display: block;
  }
  .mystic-path-card:hover {
    transform: translateY(-6px); border-color: rgba(201,168,76,0.5);
    box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 30px var(--glow-color, rgba(201,168,76,0.15));
  }
  .mystic-path-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, var(--glow-color, rgba(201,168,76,0.6)), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .mystic-path-card:hover::before { opacity: 1; }
`;

// ── Stars ─────────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: (Math.random() * 3 + 2).toFixed(1),
    delay: (Math.random() * 4).toFixed(1),
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s) => (
        <div key={s.id} className="star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, "--duration": `${s.duration}s`, "--delay": `${s.delay}s` }} />
      ))}
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,30,100,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "0%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,129,58,0.1) 0%, transparent 70%)", filter: "blur(50px)" }} />
    </div>
  );
}

// ── MysticalOrb ───────────────────────────────────────────────────
function MysticalOrb() {
  return (
    <div className="animate-float" style={{ position: "relative", width: 240, height: 240, margin: "0 auto" }}>
      <div style={{ position: "absolute", inset: -30, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.15)", animation: "spin-slow 20s linear infinite" }} />
      <div style={{ position: "absolute", inset: -55, borderRadius: "50%", border: "1px dashed rgba(201,168,76,0.08)", animation: "spin-slow 30s linear infinite reverse" }} />
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #3d2060 0%, #1a0f35 40%, #0d0820 100%)",
        border: "2px solid rgba(201,168,76,0.4)",
        boxShadow: "0 0 60px rgba(61,30,100,0.6), 0 0 120px rgba(61,30,100,0.3), inset 0 0 40px rgba(201,168,76,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ zIndex: 2, position: "relative" }}>🔮</div>
        <div style={{ position: "absolute", top: "20%", left: "20%", width: "30%", height: "30%", borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(10px)" }} />
      </div>
      {[7, 13, 28, 42].map((num, i) => (
        <div key={num} style={{ position: "absolute", top: "50%", left: "50%", width: 32, height: 32, marginLeft: -16, marginTop: -16, animation: `orbit ${8 + i * 3}s linear infinite`, animationDelay: `${i * -2}s` }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", fontSize: 11, color: COLORS.gold, fontWeight: 600 }}>{num}</div>
        </div>
      ))}
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────
function Navbar({ activeSection, setActiveSection, user, login, logout }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,6,18,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(201,168,76,0.1)" : "none",
      transition: "all 0.3s ease", padding: "16px 32px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div className="cinzel-deco gradient-text" style={{ fontSize: 18, letterSpacing: "0.05em" }}>✦ Oráculo da Sorte</div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Início", "caminhos", "como-funciona", "planos", "faq"].map((item) => (
          <span key={item} className="nav-link" onClick={() => { setActiveSection(item); document.getElementById(item)?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ color: activeSection === item ? COLORS.gold : undefined }}>
            {item === 'caminhos' ? 'Caminhos' : item}
          </span>
        ))}
        {user ? (
          <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={logout}>Sair</button>
        ) : (
          <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={login}>Entrar com Google</button>
        )}
      </div>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="Início" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 32px 80px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div className="animate-fadeInUp">
          <h1 className="cinzel-deco" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.2, marginBottom: 20 }}>
            <span className="gradient-text">Escolha seus números</span><br />
            <span style={{ color: COLORS.text }}>com intenção</span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.8, color: COLORS.textMuted, marginBottom: 16, maxWidth: 480 }}>
            O único app brasileiro que une <em style={{ color: COLORS.text }}>numerologia ancestral</em>, espiritualidade e análise de dados reais da Caixa Econômica — tudo em um ritual personalizado para cada jogo.
          </p>
          <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 36, fontStyle: "italic" }}>
            Entretenimento espiritual. Jogue com intenção, não com sorte cega.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button className="btn-primary animate-pulse-gold" onClick={() => window.location.href = "/app"}>
              ✦ Começar Agora
            </button>
            <button className="btn-outline" onClick={() => document.getElementById('caminhos')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver Caminhos Místicos
            </button>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
            {[["5 Rituais", "caminhos místicos"], ["7 Loterias", "suportadas"], ["R$9,99", "plano semanal"]].map(([num, label]) => (
              <div key={label}>
                <div className="cinzel gradient-text" style={{ fontSize: 22, fontWeight: 700 }}>{num}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MysticalOrb />
        </div>
      </div>
    </section>
  );
}

// ── 5 CAMINHOS MÍSTICOS (NOVO) ────────────────────────────────────
function MysticPaths() {
  const paths = [
    { key: 'tarot',       emoji: '🃏', name: 'Tarot Místico',     color: '#8B5CF6', desc: 'Três cartas do destino revelam seus números. O Oráculo interpreta Passado, Presente e Futuro para canalizar a combinação perfeita.' },
    { key: 'numerologia', emoji: '🔢', name: 'Numerologia',       color: '#c9a84c', desc: 'Seu Número de Vida, Vibração do Nome e Ano Pessoal se combinam num cálculo pitagórico que gera frequências numéricas únicas.' },
    { key: 'anjos',       emoji: '👼', name: 'Anjos da Guarda',   color: '#60A5FA', desc: 'Seu anjo protetor, baseado na Cabala, sussurra sequências angélicas sagradas — números que carregam a virtude do seu guardião.' },
    { key: 'planetaria',  emoji: '🪐', name: 'Mapa Planetário',   color: '#A78BFA', desc: 'O planeta regente do dia e a hora planetária atual influenciam a geração dos números com base na sua geolocalização.' },
    { key: 'orixas',      emoji: '🕯️', name: 'Ritual dos Orixás', color: '#F59E0B', desc: 'A energia do Orixá regente do dia combinada com o seu Orixá de nascimento canaliza números de poder ancestral.' },
  ];

  return (
    <section id="caminhos" style={{ padding: "100px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          ESCOLHA SEU CAMINHO
        </p>
        <h2 className="section-title gradient-text">5 Caminhos Místicos</h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 17, marginBottom: 12, maxWidth: 600, margin: "0 auto", fontStyle: "italic" }}>
          Cada caminho utiliza um algoritmo espiritual diferente para gerar seus números sagrados
        </p>
        <div className="divider" style={{ marginBottom: 56, marginTop: 16 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {paths.map((path) => (
            <a key={path.key} href="/app" className="mystic-path-card" style={{ "--glow-color": path.color + "44" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg, transparent, " + path.color + ", transparent)",
                opacity: 0.5,
              }} />
              <div style={{ fontSize: 52, marginBottom: 16 }}>{path.emoji}</div>
              <h3 className="cinzel" style={{ fontSize: 17, color: path.color, marginBottom: 12 }}>{path.name}</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>{path.desc}</p>
              <div style={{
                marginTop: 20, display: "inline-block",
                padding: "8px 20px", borderRadius: 8,
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.25)",
                fontFamily: "'Cinzel', serif", fontSize: 12,
                color: COLORS.gold, letterSpacing: "0.05em",
              }}>
                Experimentar →
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button className="btn-primary" onClick={() => window.location.href = "/app"} style={{ fontSize: 16, padding: "18px 44px" }}>
            ✦ Escolher Meu Caminho
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Como Funciona ─────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: "🗓️", title: "Informe sua data de nascimento", desc: "O Oráculo calcula seu número de vida, arquétipo e vibração numerológica pessoal." },
    { icon: "🌙", title: "Escolha seu caminho místico", desc: "Tarot, Numerologia, Anjos, Mapa Planetário ou Orixás — cada um com algoritmo próprio." },
    { icon: "🎰", title: "Selecione a loteria", desc: "Mega-Sena, Lotofácil, Quina, Lotomania, Dupla Sena, Timemania ou Dia de Sorte." },
    { icon: "✨", title: "Receba seus números sagrados", desc: "Números gerados com base na sua vibração pessoal, fase lunar e o ritual escolhido." },
  ];
  return (
    <section id="como-funciona" style={{ padding: "100px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>O RITUAL</p>
        <h2 className="section-title gradient-text">Como o Oráculo Funciona</h2>
        <div className="divider" style={{ marginBottom: 64 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {steps.map((step, i) => (
            <div key={i} className="card-mystical" style={{ padding: 32 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(212,129,58,0.1))",
                border: "1px solid rgba(201,168,76,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Cinzel', serif", fontSize: 13, color: COLORS.gold, fontWeight: 700, marginBottom: 20,
              }}>{i + 1}</div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
              <h3 className="cinzel" style={{ fontSize: 15, marginBottom: 10, color: COLORS.text, lineHeight: 1.4 }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Planos ─────────────────────────────────────────────────────────
async function handleCheckout(plan) {
  const res = await fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

function Pricing() {
  const [billingTab, setBillingTab] = useState("mensal");
  const plans = [
    {
      name: "Livre", icon: "🌟",
      price: { mensal: "R$0", anual: "R$0" }, period: "para sempre",
      color: COLORS.textMuted,
      features: ["✓ Mega-Sena apenas", "✓ 1 consulta por dia", "✓ Tarot básico", "✗ Todas as loterias", "✗ Consultas ilimitadas", "✗ Todos os rituais"],
      cta: "Começar Grátis", highlight: false,
    },
    {
      name: "Místico", icon: "🔮",
      price: { mensal: "R$9,90", anual: "R$7,90" },
      period: billingTab === "anual" ? "/semana — cobrado anualmente" : "/semana",
      color: COLORS.gold, badge: "Mais Popular",
      features: ["✓ Todas as 7 loterias", "✓ Consultas ilimitadas", "✓ 5 caminhos místicos completos", "✓ Orixás + Anjos + Planetária", "✓ Análise de padrões históricos", "✗ Bolão espiritual"],
      cta: "Assinar Místico", highlight: true,
    },
    {
      name: "Sagrado", icon: "👑",
      price: { mensal: "R$24,90", anual: "R$19,90" },
      period: billingTab === "anual" ? "/semana — cobrado anualmente" : "/semana",
      color: COLORS.amber,
      features: ["✓ Tudo do plano Místico", "✓ Bolão espiritual ilimitado", "✓ Consultor IA via chat", "✓ Relatório mensal personalizado", "✓ Badge exclusivo de fundador", "✓ Suporte prioritário"],
      cta: "Assinar Sagrado", highlight: false,
    },
  ];
  return (
    <section id="planos" style={{ padding: "100px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>PLANOS</p>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 12 }}>
          Escolha seu <span className="gradient-text">caminho espiritual</span>
        </h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 17, marginBottom: 36, fontStyle: "italic" }}>Comece grátis. Evolua quando sentir a chamada.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 56 }}>
          {["mensal", "anual"].map((t) => (
            <button key={t} className={`tab-btn ${billingTab === t ? "active" : ""}`} onClick={() => setBillingTab(t)}>
              {t === "mensal" ? "Mensal" : "Anual (−20%)"}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
          {plans.map((plan) => (
            <div key={plan.name} className="card-mystical" style={{
              padding: 36,
              ...(plan.highlight ? { border: `2px solid ${COLORS.gold}`, boxShadow: `0 0 40px rgba(201,168,76,0.15)`, transform: "scale(1.03)" } : {}),
            }}>
              {plan.badge && (
                <div style={{ background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold})`, color: "#1a0f00", fontSize: 11, fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 20, display: "inline-block", marginBottom: 16 }}>{plan.badge}</div>
              )}
              <div style={{ fontSize: 40, marginBottom: 12 }}>{plan.icon}</div>
              <h3 className="cinzel" style={{ fontSize: 20, color: plan.color, marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ marginBottom: 24 }}>
                <span className="cinzel" style={{ fontSize: 42, fontWeight: 700, color: COLORS.text }}>{plan.price[billingTab]}</span>
                <span style={{ fontSize: 14, color: COLORS.textMuted, marginLeft: 8 }}>{plan.period}</span>
              </div>
              <div className="glow-line" style={{ marginBottom: 24 }} />
              <ul style={{ listStyle: "none", marginBottom: 32 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ padding: "7px 0", fontSize: 14, color: f.startsWith("✗") ? COLORS.textMuted : COLORS.text, opacity: f.startsWith("✗") ? 0.5 : 1, lineHeight: 1.5 }}>{f}</li>
                ))}
              </ul>
              <button className={plan.highlight ? "btn-primary" : "btn-outline"} style={{ width: "100%" }}
                onClick={() => plan.name === "Místico" ? handleCheckout("mistico") : plan.name === "Sagrado" ? handleCheckout("sagrado") : window.location.href = "/app"}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: "24px 32px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, textAlign: "center" }}>
          <span className="cinzel" style={{ color: COLORS.gold, fontSize: 14 }}>💡 Prefere não assinar?</span>
          <span style={{ color: COLORS.textMuted, fontSize: 15, marginLeft: 12 }}>
            Pacote de 3 consultas por <strong style={{ color: COLORS.text }}>R$6,00</strong> (R$2,00 cada) — sem assinatura.
          </span>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────
function Testimonials() {
  const items = [
    { name: "Carla M.", city: "São Paulo – SP", text: "Uso para escolher meus números com mais intenção. A experiência do ritual mudou minha relação com o jogo.", stars: 5 },
    { name: "Jorge P.", city: "Recife – PE", text: "A parte dos orixás é incrível. Me sinto mais conectado à minha espiritualidade antes de apostar.", stars: 5 },
    { name: "Ana L.", city: "Belo Horizonte – MG", text: "Nunca esperei 'prever' números — uso como entretenimento espiritual e adoro. O tarot diário virou ritual.", stars: 4 },
  ];
  return (
    <section style={{ padding: "80px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 12 }}>O que a comunidade <span className="gradient-text">está dizendo</span></h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 15, fontStyle: "italic", marginBottom: 56 }}>Beta fechado com 200 usuários selecionados</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {items.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div style={{ marginBottom: 16, paddingTop: 8 }}>{"★".repeat(t.stars)}<span style={{ opacity: 0.3 }}>{"★".repeat(5 - t.stars)}</span></div>
              <p style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{t.text}</p>
              <div>
                <div className="cinzel" style={{ fontSize: 14, color: COLORS.gold }}>{t.name}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>{t.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  const items = [
    { q: "O Oráculo da Sorte garante que vou ganhar na loteria?", a: "Não. O Oráculo da Sorte é um aplicativo de entretenimento espiritual. Loterias são jogos de azar com resultados completamente aleatórios — nenhum sistema pode prever ou garantir resultados." },
    { q: "O que são os 5 caminhos místicos?", a: "São 5 métodos espirituais diferentes para gerar seus números: Tarot (3 cartas do destino), Numerologia (cálculo pitagórico), Anjos da Guarda (anjo protetor da Cabala), Mapa Planetário (posição dos astros) e Ritual dos Orixás (tradição afro-brasileira). Cada um usa um algoritmo único." },
    { q: "Meus dados pessoais estão seguros?", a: "Sim. Data de nascimento e localização são usados exclusivamente para cálculos místicos dentro do app. Seguimos a LGPD. Você pode solicitar exclusão dos seus dados a qualquer momento." },
    { q: "Posso cancelar minha assinatura quando quiser?", a: "Sim, sem burocracia e sem multa. Cancele a qualquer momento pelo app ou por e-mail. O acesso premium permanece ativo até o fim do período pago." },
    { q: "Para que serve a geolocalização?", a: "Usamos sua localização para calcular o fuso horário correto e as posições planetárias no caminho do Mapa Planetário. Nunca compartilhamos seus dados de localização." },
    { q: "O app tem relação com práticas religiosas?", a: "O Oráculo incorpora elementos de diversas tradições espirituais brasileiras como parte de uma experiência de entretenimento cultural. Não somos afiliados a nenhuma instituição religiosa." },
  ];
  return (
    <section id="faq" style={{ padding: "80px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 8 }}>Perguntas <span className="gradient-text">Frequentes</span></h2>
        <div className="divider" style={{ marginBottom: 56 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} className="card-mystical" style={{ overflow: "visible" }}>
              <button className="accordion-header" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                <span style={{ color: COLORS.gold, fontSize: 20, flexShrink: 0, marginLeft: 16 }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div style={{ padding: "0 24px 24px", color: COLORS.textMuted, fontSize: 15, lineHeight: 1.8 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Legal ─────────────────────────────────────────────────────────
function LegalDisclaimer() {
  return (
    <section style={{ padding: "40px 32px 0", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "28px 32px" }}>
          <p className="cinzel" style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>⚖️ Aviso Legal</p>
          <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
            O Oráculo da Sorte é um <strong style={{ color: COLORS.text }}>aplicativo de entretenimento e espiritualidade</strong>. Não garantimos resultados em jogos de azar. Loterias são eventos aleatórios regulados pela Caixa Econômica Federal. <strong style={{ color: COLORS.text }}>Jogue com responsabilidade.</strong> Conformidade com a <strong style={{ color: COLORS.text }}>LGPD (Lei nº 13.709/2018)</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding: "60px 32px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="glow-line" style={{ marginBottom: 40 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="cinzel-deco gradient-text" style={{ fontSize: 20, marginBottom: 8 }}>✦ Oráculo da Sorte</div>
            <p style={{ color: COLORS.textMuted, fontSize: 13, fontStyle: "italic" }}>Entretenimento espiritual para quem joga com intenção.</p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {["Privacidade", "Termos de Uso", "Contato", "LGPD"].map(link => (
              <span key={link} className="nav-link" style={{ fontSize: 12 }}>{link}</span>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 12, marginTop: 40, opacity: 0.5 }}>© 2026 Oráculo da Sorte. Todos os direitos reservados. | Não afiliado à Caixa Econômica Federal.</p>
      </div>
    </footer>
  );
}

// ── App Principal ─────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState("Início");
  const { user, profile, loading, showOnboarding, login, logout, completeOnboarding } = useAuth();

  return (
    <>
      <style>{styles}</style>
      {showOnboarding && user && (
        <OnboardingPopup userId={user.id} onComplete={completeOnboarding} />
      )}
      <Stars />
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} user={user} login={login} logout={logout} />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <MysticPaths />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <LegalDisclaimer />
      </main>

      <Footer />
    </>
  );
}
