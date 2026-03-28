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

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes shimmer {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 15px rgba(201,168,76,0.3); }
    50% { box-shadow: 0 0 35px rgba(201,168,76,0.7); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-shimmer { animation: shimmer 2.5s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 20s linear infinite; }
  .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
  .animate-pulse-gold { animation: pulse-gold 2s ease-in-out infinite; }
  @keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes glow-breathe {
  0%, 100% { box-shadow: 0 0 30px rgba(180,155,100,0.2), 0 0 60px rgba(180,155,100,0.06); }
  50% { box-shadow: 0 0 55px rgba(180,155,100,0.45), 0 0 100px rgba(180,155,100,0.18); }
}
@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.5; }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

  .star {
    position: absolute;
    border-radius: 50%;
    background: white;
    animation: twinkle var(--duration, 3s) ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }

  .gradient-text {
    background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 50%, ${COLORS.amber} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .divider {
    width: 120px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${COLORS.gold}, transparent);
    margin: 0 auto;
  }

  .card-mystical {
    background: linear-gradient(135deg, ${COLORS.bgCard} 0%, #160f28 100%);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .card-mystical::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top left, rgba(201,168,76,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .card-mystical:hover {
    border-color: rgba(201,168,76,0.5);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(201,168,76,0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, ${COLORS.amber} 0%, ${COLORS.gold} 100%);
    color: #1a0f00;
    border: none;
    padding: 16px 36px;
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.08em;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(201,168,76,0.5);
    filter: brightness(1.1);
  }

  .btn-outline {
    background: transparent;
    color: ${COLORS.gold};
    border: 1px solid ${COLORS.gold};
    padding: 14px 32px;
    font-family: 'Cinzel', serif;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.08em;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
  }
  .btn-outline:hover {
    background: rgba(201,168,76,0.1);
    transform: translateY(-2px);
  }

  .section-title {
    font-family: 'Cinzel Decorative', serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    text-align: center;
    margin-bottom: 12px;
  }

  .nav-link {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    letter-spacing: 0.1em;
    color: ${COLORS.textMuted};
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;
    text-transform: uppercase;
  }
  .nav-link:hover { color: ${COLORS.gold}; }

  .price-badge {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    display: inline-block;
  }

  .tab-btn {
    padding: 10px 24px;
    border-radius: 6px;
    border: 1px solid rgba(201,168,76,0.3);
    font-family: 'Cinzel', serif;
    font-size: 13px;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }
  .tab-btn.active {
    background: linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold});
    color: #1a0f00;
    border-color: transparent;
    font-weight: 700;
  }
  .tab-btn:not(.active) {
    background: transparent;
    color: ${COLORS.textMuted};
  }
  .tab-btn:not(.active):hover {
    border-color: ${COLORS.gold};
    color: ${COLORS.gold};
  }

  input[type="email"], input[type="date"], input[type="text"] {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(201,168,76,0.3);
    border-radius: 8px;
    padding: 14px 18px;
    color: ${COLORS.text};
    font-family: 'EB Garamond', serif;
    font-size: 16px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
  }
  input[type="email"]:focus, input[type="date"]:focus, input[type="text"]:focus {
    border-color: ${COLORS.gold};
    box-shadow: 0 0 15px rgba(201,168,76,0.15);
  }
  input::placeholder { color: ${COLORS.textMuted}; }

  .feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(212,129,58,0.1));
    border: 1px solid rgba(201,168,76,0.25);
  }

  .testimonial-card {
    background: linear-gradient(135deg, #110d1e, #160f28);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 16px;
    padding: 28px;
    position: relative;
  }
  .testimonial-card::before {
    content: '"';
    position: absolute;
    top: -10px;
    left: 24px;
    font-family: 'Cinzel Decorative', serif;
    font-size: 60px;
    color: ${COLORS.gold};
    opacity: 0.3;
    line-height: 1;
  }

  .glow-line {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, ${COLORS.gold} 30%, ${COLORS.amber} 70%, transparent 100%);
    opacity: 0.4;
  }

  .accordion-header {
    width: 100%;
    background: transparent;
    border: none;
    text-align: left;
    padding: 20px 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'Cinzel', serif;
    font-size: 14px;
    letter-spacing: 0.05em;
    color: ${COLORS.text};
    transition: color 0.2s;
  }
  .accordion-header:hover { color: ${COLORS.gold}; }
`;

// ── Stars background ──────────────────────────────────────────────
function WinnersBanner({ wins, totalBRL }) {
  return (
    <div style={{
      position: "fixed", top: "80px", right: "20px", zIndex: 100,
      background: "linear-gradient(135deg, rgba(12,10,28,0.97), rgba(18,14,38,0.97))",
      border: "1px solid rgba(180,155,100,0.5)",
      borderRadius: "12px", padding: "22px 26px", width: "300px", overflow: "hidden",
      animation: "glow-breathe 4s ease-in-out infinite",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",
        background:"linear-gradient(90deg,transparent,rgba(180,155,100,0.9),rgba(255,220,120,1),rgba(180,155,100,0.9),transparent)",
        backgroundSize:"200% auto",animation:"shimmer 2.5s linear infinite"}}/>
      <div style={{position:"absolute",top:0,left:0,width:28,height:28,borderTop:"1px solid rgba(180,155,100,0.7)",borderLeft:"1px solid rgba(180,155,100,0.7)",borderRadius:"12px 0 0 0",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderBottom:"1px solid rgba(180,155,100,0.7)",borderRight:"1px solid rgba(180,155,100,0.7)",borderRadius:"0 0 12px 0",pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"#4ade80",
            animation:"pulse-ring 2s ease-in-out infinite",boxShadow:"0 0 8px #4ade8066"}}/>
          <span style={{fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",
            color:"rgba(180,155,100,0.7)",fontFamily:"'DM Sans',sans-serif"}}>Comunidade Oráculo</span>
        </div>
        <span style={{fontSize:"18px",animation:"float 3s ease-in-out infinite"}}>🔮</span>
      </div>
      <div style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(180,155,100,0.3),transparent)",marginBottom:"18px"}}/>
      <div style={{display:"flex",alignItems:"stretch"}}>
        <div style={{flex:1,paddingRight:"16px"}}>
          <div style={{fontSize:"10px",color:"rgba(240,237,232,0.35)",letterSpacing:"1px",
            textTransform:"uppercase",marginBottom:"6px",fontFamily:"'DM Sans',sans-serif"}}>Apostas vencedoras</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"40px",fontWeight:300,lineHeight:1,
            background:"linear-gradient(135deg,#f0ede8,rgba(180,155,100,0.9),#f0ede8)",
            backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"shimmer 3s linear infinite"
          }}>{wins.toLocaleString("pt-BR")}</div>
          <div style={{fontSize:"9px",color:"rgba(180,155,100,0.45)",marginTop:"4px",
            fontFamily:"'DM Sans',sans-serif"}}>jogadores premiados</div>
        </div>
        <div style={{width:"1px",background:"linear-gradient(180deg,transparent,rgba(180,155,100,0.3),transparent)",flexShrink:0}}/>
        <div style={{flex:1,paddingLeft:"16px"}}>
          <div style={{fontSize:"10px",color:"rgba(240,237,232,0.35)",letterSpacing:"1px",
            textTransform:"uppercase",marginBottom:"6px",fontFamily:"'DM Sans',sans-serif"}}>Total ganho</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:300,lineHeight:1.2,
            color:"rgba(180,155,100,0.95)",textShadow:"0 0 20px rgba(180,155,100,0.4)"
          }}>R$<br/><span style={{fontSize:"28px"}}>{totalBRL.toLocaleString("pt-BR",{maximumFractionDigits:0})}</span></div>
          <div style={{fontSize:"9px",color:"rgba(180,155,100,0.45)",marginTop:"4px",
            fontFamily:"'DM Sans',sans-serif"}}>em prémios reais</div>
        </div>
      </div>
    </div>
  );
}
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: (Math.random() * 3 + 2).toFixed(1),
    delay: (Math.random() * 4).toFixed(1),
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            "--duration": `${s.duration}s`,
            "--delay": `${s.delay}s`,
          }}
        />
      ))}
      {/* Nebula blobs */}
      <div style={{
        position: "absolute", top: "10%", right: "5%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(61,30,100,0.25) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", left: "0%",
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,129,58,0.1) 0%, transparent 70%)",
        filter: "blur(50px)",
      }} />
    </div>
  );
}

// ── Mystical orb ──────────────────────────────────────────────────
function MysticalOrb() {
  return (
    <div className="animate-float" style={{ position: "relative", width: 240, height: 240, margin: "0 auto" }}>
      {/* Outer glow rings */}
      <div style={{
        position: "absolute", inset: -30,
        borderRadius: "50%",
        border: "1px solid rgba(201,168,76,0.15)",
        animation: "spin-slow 20s linear infinite",
      }} />
      <div style={{
        position: "absolute", inset: -55,
        borderRadius: "50%",
        border: "1px dashed rgba(201,168,76,0.08)",
        animation: "spin-slow 30s linear infinite reverse",
      }} />
      {/* Main orb */}
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #3d2060 0%, #1a0f35 40%, #0d0820 100%)",
        border: "2px solid rgba(201,168,76,0.4)",
        boxShadow: "0 0 60px rgba(61,30,100,0.6), 0 0 120px rgba(61,30,100,0.3), inset 0 0 40px rgba(201,168,76,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 80,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ zIndex: 2, position: "relative" }}>🔮</div>
        {/* Inner shimmer */}
        <div style={{
          position: "absolute", top: "20%", left: "20%",
          width: "30%", height: "30%", borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          filter: "blur(10px)",
        }} />
      </div>
      {/* Orbiting numbers */}
      {[7, 13, 28, 42].map((num, i) => (
        <div key={num} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 32, height: 32, marginLeft: -16, marginTop: -16,
          animation: `orbit ${8 + i * 3}s linear infinite`,
          animationDelay: `${i * -2}s`,
        }}>
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cinzel', serif", fontSize: 11, color: COLORS.gold,
            fontWeight: 600,
          }}>{num}</div>
        </div>
      ))}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────
function Navbar({ activeSection, setActiveSection, user, login, logout }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,6,18,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(201,168,76,0.1)" : "none",
      transition: "all 0.3s ease",
      padding: "16px 32px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div className="cinzel-deco gradient-text" style={{ fontSize: 18, letterSpacing: "0.05em" }}>
        ✦ Oráculo da Sorte
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Início", "como-funciona", "planos", "faq"].map((item) => (
          <span
            key={item}
            className="nav-link"
            onClick={() => { setActiveSection(item); document.getElementById(item)?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ color: activeSection === item ? COLORS.gold : undefined }}
          >
            {item}
          </span>
        ))}
{user ? (
          <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={logout}>
            Sair
          </button>
        ) : (
          <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={login}>
            Entrar com Google
          </button>
        )}
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "120px 32px 80px", position: "relative", zIndex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        {/* Left */}
        <div className="animate-fadeInUp">









          </div>

          <h1 className="cinzel-deco" style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.2,
            marginBottom: 20,
          }}>
            <span className="gradient-text">Escolha seus números</span>
            <br />
            <span style={{ color: COLORS.text }}>com intenção</span>
          </h1>

          <p style={{
            fontSize: 19, lineHeight: 1.8, color: COLORS.textMuted,
            marginBottom: 16, maxWidth: 480,
          }}>
            O único app brasileiro que une <em style={{ color: COLORS.text }}>numerologia ancestral</em>, espiritualidade e análise de dados reais da Caixa Econômica — tudo em um ritual personalizado para cada jogo.
          </p>

          <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 36, fontStyle: "italic" }}>
            Entretenimento espiritual. Jogue com intenção, não com sorte cega.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button className="btn-primary animate-pulse-gold" onClick={() => window.location.href="/pricing"}>
              ✦ Começar Agora
            </button>
            <button className="btn-outline">
              Ver Como Funciona
            </button>
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
            {[["4.8★", "avaliação beta"], ["100%", "místico"], ["R$9,99", "plano semanal"]].map(([num, label]) => (
              <div key={label}>
                <div className="cinzel gradient-text" style={{ fontSize: 22, fontWeight: 700 }}>{num}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MysticalOrb />
        </div>
      </div>
    </section>
  );
}

// ── Como Funciona ─────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: "🗓️", title: "Informe sua data de nascimento", desc: "O Oráculo calcula seu número de vida, arquétipo e vibração numerológica pessoal." },
    { icon: "🌙", title: "Escolha o ritual de hoje", desc: "Tarot, orixás ou lua — cada caminho ativa uma lógica diferente de geração de palpites." },
    { icon: "🔢", title: "Receba seus números", desc: "Combinamos sua vibração pessoal com padrões históricos reais dos sorteios da Caixa." },
    { icon: "✨", title: "Jogue com intenção", desc: "Visualize, afirme e registre seu jogo. Acompanhe seus resultados ao longo do tempo." },
  ];

  return (
    <section id="como-funciona" style={{ padding: "100px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          O RITUAL
        </p>
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
                fontFamily: "'Cinzel', serif", fontSize: 13, color: COLORS.gold, fontWeight: 700,
                marginBottom: 20,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
              <h3 className="cinzel" style={{ fontSize: 15, marginBottom: 10, color: COLORS.text, lineHeight: 1.4 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: "🔢", title: "Numerologia Personalizada", desc: "Algoritmo baseado em Pitágoras e Cabalá Hebraica adaptado para loterias brasileiras.", tag: "Grátis" },
    { icon: "🌙", title: "Ciclos Lunares", desc: "Sorteios mapeados com fases da lua. Saiba quando sua energia está mais alinhada.", tag: "Premium" },
    { icon: "📊", title: "Padrões Históricos Reais", desc: "Análise de frequência com dados oficiais da Caixa desde 1996 — transparente e verificável.", tag: "Premium" },
    { icon: "🃏", title: "Consulta de Tarot", desc: "Um ritual de 3 cartas antes de cada jogo. Intenção antes da ação.", tag: "Grátis" },
    { icon: "🕯️", title: "Ritual dos Orixás", desc: "Orixá regente do dia + afirmação personalizada. Conexão com a espiritualidade brasileira.", tag: "Premium" },
    { icon: "👥", title: "Bolão Espiritual", desc: "Forme grupos com amigos, partilhem a energia e multipliquem a intenção coletiva.", tag: "Em breve" },
  ];

  return (
    <section style={{ padding: "80px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          FUNCIONALIDADES
        </p>
        <h2 className="section-title" style={{ color: COLORS.text }}>
          Tudo que você precisa para{" "}
          <span className="gradient-text">jogar com consciência</span>
        </h2>
        <div className="divider" style={{ marginBottom: 64 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} className="card-mystical" style={{ padding: 28, display: "flex", gap: 20 }}>
              <div className="feature-icon">{f.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <h3 className="cinzel" style={{ fontSize: 14, color: COLORS.text }}>{f.title}</h3>
                  <span className="price-badge" style={{
                    background: f.tag === "Grátis" ? "rgba(61,140,110,0.15)" : f.tag === "Premium" ? "rgba(201,168,76,0.15)" : "rgba(100,100,150,0.15)",
                    color: f.tag === "Grátis" ? COLORS.green : f.tag === "Premium" ? COLORS.gold : COLORS.textMuted,
                    border: `1px solid ${f.tag === "Grátis" ? "rgba(61,140,110,0.3)" : f.tag === "Premium" ? "rgba(201,168,76,0.3)" : "rgba(100,100,150,0.3)"}`,
                  }}>{f.tag}</span>
                </div>
                <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Monetização / Planos ──────────────────────────────────────────
async function handleCheckout(plan) {
  const res = await fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

function Pricing() {
  const [billingTab, setBillingTab] = useState("mensal");

  const plans = [
    {
      name: "Livre",
      icon: "🌟",
      price: { mensal: "R$0", anual: "R$0" },
      period: "para sempre",
      color: COLORS.textMuted,
      features: [
        "✓ Numerologia básica diária",
        "✓ Tirada de 3 cartas de tarot",
        "✓ 2 consultas completas por mês",
        "✓ Orixá do dia",
        "✗ Análise de padrões históricos",
        "✗ Ciclos lunares",
        "✗ Bolão espiritual",
      ],
      cta: "Começar Grátis",
      highlight: false,
    },
    {
      name: "Místico",
      icon: "🔮",
      price: { mensal: "R$9,90", anual: "R$7,90" },
      period: billingTab === "anual" ? "/semana � cobrado anualmente" : "/semana",
      color: COLORS.gold,
      badge: "Mais Popular",
      features: [
        "✓ Tudo do plano Livre",
        "✓ Consultas ilimitadas",
        "✓ Análise de padrões históricos (Caixa)",
        "✓ Rituais com fases da lua",
        "✓ Ritual dos Orixás completo",
        "✓ Histórico e estatísticas pessoais",
        "✗ Bolão espiritual",
      cta: "Assinar Místico",
      cta: "Assinar Místico",
      highlight: true,
    },
    {
      name: "Sagrado",
      icon: "👑",
      price: { mensal: "R$24,90", anual: "R$19,90" },
      period: billingTab === "anual" ? "/semana � cobrado anualmente" : "/semana",
      color: COLORS.amber,
      features: [
        "✓ Tudo do plano Místico",
        "✓ Bolão espiritual ilimitado",
        "✓ Consultor IA via chat",
        "✓ Relatório mensal personalizado",
        "✓ Acesso antecipado a novidades",
        "✓ Badge exclusivo de fundador",
        "✓ Suporte prioritário",
      cta: "Assinar Sagrado",
      cta: "Assinar Sagrado",
      highlight: false,
    },
  ];

  return (
    <section id="planos" style={{ padding: "100px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          PLANOS
        </p>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 12 }}>
          Escolha seu <span className="gradient-text">caminho espiritual</span>
        </h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 17, marginBottom: 36, fontStyle: "italic" }}>
          Comece grátis. Evolua quando sentir a chamada.
        </p>

        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 56 }}>
          {["mensal", "anual"].map((t) => (
            <button key={t} className={`tab-btn ${billingTab === t ? "active" : ""}`} onClick={() => setBillingTab(t)}>
              {t === "mensal" ? "Mensal" : "Anual (−20%)"}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="card-mystical"
              style={{
                padding: 36,
                ...(plan.highlight ? {
                  border: `2px solid ${COLORS.gold}`,
                  boxShadow: `0 0 40px rgba(201,168,76,0.15), 0 20px 60px rgba(0,0,0,0.3)`,
                  transform: "scale(1.03)",
                } : {}),
              }}
            >
              {plan.badge && (
                <div style={{
                  background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold})`,
                  color: "#1a0f00",
                  fontSize: 11,
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "4px 14px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginBottom: 16,
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ fontSize: 40, marginBottom: 12 }}>{plan.icon}</div>
              <h3 className="cinzel" style={{ fontSize: 20, color: plan.color, marginBottom: 8 }}>{plan.name}</h3>

              <div style={{ marginBottom: 24 }}>
                <span className="cinzel" style={{ fontSize: 42, fontWeight: 700, color: COLORS.text }}>
                  {plan.price[billingTab]}
                </span>
                <span style={{ fontSize: 14, color: COLORS.textMuted, marginLeft: 8 }}>{plan.period}</span>
              </div>

              <div className="glow-line" style={{ marginBottom: 24 }} />

              <ul style={{ listStyle: "none", marginBottom: 32 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{
                    padding: "7px 0",
                    fontSize: 14,
                    color: f.startsWith("✗") ? COLORS.textMuted : COLORS.text,
                    opacity: f.startsWith("✗") ? 0.5 : 1,
                    lineHeight: 1.5,
                  }}>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={plan.highlight ? "btn-primary" : "btn-outline"}
                style={{ width: "100%" }}
              onClick={() => plan.name === "Místico" ? handleCheckout("mistico") : plan.name === "Sagrado" ? handleCheckout("sagrado") : null}
              >
                {plan.cta}
              </button>

              {plan.highlight && (
                <p style={{ textAlign: "center", fontSize: 12, color: COLORS.textMuted, marginTop: 12, fontStyle: "italic" }}>
                  Cancele quando quiser. Sem fidelidade.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pay-per-use note */}
        <div style={{
          marginTop: 40,
          padding: "24px 32px",
          background: "rgba(201,168,76,0.05)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: 12,
          textAlign: "center",
        }}>
          <span className="cinzel" style={{ color: COLORS.gold, fontSize: 14, letterSpacing: "0.05em" }}>
            💡 Prefere não assinar?
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: 15, marginLeft: 12 }}>
            Pacote de 3 consultas por <strong style={{ color: COLORS.text }}>R$6,00</strong> (R$2,00 cada) — sem assinatura. Ideal para experimentar.
          </span>
          <div style={{ marginTop: 12 }}>
            <a href="/pricing" className="nav-link" style={{ color: COLORS.gold, fontSize: 14 }}>
              Ver detalhes completos dos planos →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


























































































function Testimonials() {
  const items = [
    { name: "Carla M.", city: "São Paulo – SP", text: "Uso para escolher meus números com mais intenção. A experiência do ritual mudou minha relação com o jogo.", stars: 5 },
    { name: "Jorge P.", city: "Recife – PE", text: "A parte dos orixás é incrível. Me sinto mais conectado à minha espiritualidade antes de apostar.", stars: 5 },
    { name: "Ana L.", city: "Belo Horizonte – MG", text: "Nunca esperei 'prever' números — uso como entretenimento espiritual e adoro. O tarot diário virou ritual.", stars: 4 },
  ];

  return (
    <section style={{ padding: "80px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 12 }}>
          O que a comunidade <span className="gradient-text">está dizendo</span>
        </h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 15, fontStyle: "italic", marginBottom: 56 }}>
          Beta fechado com 200 usuários selecionados
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {items.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div style={{ marginBottom: 16, paddingTop: 8 }}>
                {"★".repeat(t.stars)}<span style={{ opacity: 0.3 }}>{"★".repeat(5 - t.stars)}</span>
              </div>
              <p style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                {t.text}
              </p>
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

// ── FAQ (com aviso legal integrado) ──────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  const items = [
    {
      q: "O Oráculo da Sorte garante que vou ganhar na loteria?",
      a: "Não. O Oráculo da Sorte é um aplicativo de entretenimento espiritual. Loterias são jogos de azar com resultados completamente aleatórios — nenhum sistema, algoritmo ou prática espiritual pode prever ou garantir resultados. Nossa proposta é enriquecer a experiência de quem já joga, adicionando intenção, espiritualidade e análise histórica para fins de entretenimento.",
    },
    {
      q: "O que é 'numerologia' e como ela funciona no app?",
      a: "Numerologia é uma tradição milenar que atribui significados e energias a números com base em datas e nomes. No app, usamos o sistema Pitagórico e a Cabalá para calcular seu número de vida e sugerir combinações alinhadas à sua vibração. É uma prática espiritual e de entretenimento — não matemática preditiva.",
    },
    {
      q: "Os dados históricos da Caixa realmente ajudam a escolher números?",
      a: "A análise de frequência mostra padrões históricos reais (números mais/menos sorteados), úteis como curiosidade e referência. Em teoria das probabilidades, cada sorteio é independente — padrões passados não predizem o futuro. Disponibilizamos os dados com transparência para que você decida como usá-los.",
    },
    {
      q: "Meus dados pessoais estão seguros?",
      a: "Sim. Sua data de nascimento é usada exclusivamente para cálculos numerológicos dentro do app. Não vendemos, compartilhamos ou usamos seus dados para fins publicitários. Seguimos a LGPD (Lei Geral de Proteção de Dados Pessoais — Lei nº 13.709/2018). Você pode solicitar exclusão dos seus dados a qualquer momento pelo app.",
    },
    {
      q: "Posso cancelar minha assinatura quando quiser?",
      a: "Sim, sem burocracia e sem multa. Você pode cancelar a qualquer momento pelo próprio app ou por e-mail. O acesso premium permanece ativo até o fim do período pago. Não há fidelidade obrigatória.",
    },
    {
      q: "O app tem alguma relação com práticas religiosas específicas?",
      a: "O Oráculo da Sorte incorpora elementos de diversas tradições espirituais brasileiras — numerologia ocidental, tarô, referências aos Orixás — como parte de uma experiência de entretenimento cultural e espiritual. Não representamos, endossamos nem somos afiliados a nenhuma instituição religiosa. Respeitamos todas as crenças.",
    },
  ];

  return (
    <section id="faq" style={{ padding: "80px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 8 }}>
          Perguntas <span className="gradient-text">Frequentes</span>
        </h2>
        <div className="divider" style={{ marginBottom: 56 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} className="card-mystical" style={{ overflow: "visible" }}>
              <button className="accordion-header" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                <span style={{ color: COLORS.gold, fontSize: 20, flexShrink: 0, marginLeft: 16 }}>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 24px", color: COLORS.textMuted, fontSize: 15, lineHeight: 1.8 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Legal Disclaimer ──────────────────────────────────────────────
function LegalDisclaimer() {
  return (
    <section style={{ padding: "40px 32px 0", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "28px 32px",
        }}>
          <p className="cinzel" style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            ⚖️ Aviso Legal
          </p>
          <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
            O Oráculo da Sorte é um <strong style={{ color: COLORS.text }}>aplicativo de entretenimento e espiritualidade</strong>. Não garantimos, prometemos nem sugerimos que nossos serviços aumentam a probabilidade de ganho em loterias ou quaisquer jogos de azar. Loterias são eventos aleatórios regulados pela Caixa Econômica Federal. <strong style={{ color: COLORS.text }}>Jogue com responsabilidade.</strong> Se o jogo está causando problemas financeiros ou emocionais, procure ajuda: <strong style={{ color: COLORS.gold }}>jogadores.org.br</strong>. Este app está em conformidade com a <strong style={{ color: COLORS.text }}>LGPD (Lei nº 13.709/2018)</strong> e não é afiliado à Caixa Econômica Federal.
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
            <p style={{ color: COLORS.textMuted, fontSize: 13, fontStyle: "italic" }}>
              Entretenimento espiritual para quem joga com intenção.
            </p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {["Privacidade", "Termos de Uso", "Contato", "LGPD"].map(link => (
              <span key={link} className="nav-link" style={{ fontSize: 12 }}>{link}</span>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 12, marginTop: 40, opacity: 0.5 }}>
          © 2026 Oráculo da Sorte. Todos os direitos reservados. | Não afiliado à Caixa Econômica Federal.
        </p>
      </div>
    </footer>
  );
}

// ── Content Strategy Panel ────────────────────────────────────────
export default function App() {
  const [communityWins] = useState(247);
  const [communityTotal] = useState(184930);
  const [activeSection, setActiveSection] = useState("Início");

  const { user, profile, loading, showOnboarding, login, logout, completeOnboarding } = useAuth();



  };

  return (
    <>
     <style>{styles}</style>
      {showOnboarding && user && (
        <OnboardingPopup userId={user.id} onComplete={completeOnboarding} />
      )}
      <Stars />
      <WinnersBanner wins={communityWins} totalBRL={communityTotal} />
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} user={user} login={login} logout={logout} />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <Testimonials />


        <FAQ />
        <LegalDisclaimer />
      </main>

      <Footer />
    </>
  );
}
