import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext.jsx";
import OnboardingPopup from "../OnboardingPopup.jsx";

const COLORS = {
  bg: "#0a0612", bgCard: "#110d1e",
  gold: "#c9a84c", goldLight: "#e8c97a", amber: "#d4813a",
  text: "#f0e6d3", textMuted: "#a89880", green: "#3d8c6e",
};

// ══════════════════════════════════════
//  SVG ILLUSTRATIONS
// ══════════════════════════════════════
function TarotSVG() {
  return (
    <svg viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 12px rgba(139,92,246,0.5))" }}>
      {/* Card body */}
      <rect x="2" y="2" width="76" height="106" rx="8" fill="url(#tarotBg)" stroke="#8B5CF6" strokeWidth="2"/>
      <rect x="8" y="8" width="64" height="94" rx="4" fill="none" stroke="#8B5CF644" strokeWidth="1" strokeDasharray="3 3"/>
      {/* Star/eye symbol */}
      <circle cx="40" cy="42" r="18" fill="none" stroke="#8B5CF688" strokeWidth="1.5"/>
      <circle cx="40" cy="42" r="10" fill="none" stroke="#A78BFA" strokeWidth="1"/>
      <circle cx="40" cy="42" r="4" fill="#C4B5FD"/>
      {/* Rays */}
      <line x1="40" y1="18" x2="40" y2="26" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="58" x2="40" y2="66" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="42" x2="14" y2="42" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="58" y1="42" x2="66" y2="42" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Diagonal rays */}
      <line x1="27" y1="29" x2="22" y2="24" stroke="#8B5CF666" strokeWidth="1" strokeLinecap="round"/>
      <line x1="53" y1="29" x2="58" y2="24" stroke="#8B5CF666" strokeWidth="1" strokeLinecap="round"/>
      <line x1="27" y1="55" x2="22" y2="60" stroke="#8B5CF666" strokeWidth="1" strokeLinecap="round"/>
      <line x1="53" y1="55" x2="58" y2="60" stroke="#8B5CF666" strokeWidth="1" strokeLinecap="round"/>
      {/* Moon top */}
      <path d="M34 12 Q40 8 46 12" fill="none" stroke="#C4B5FD" strokeWidth="1"/>
      {/* Stars bottom */}
      <circle cx="30" cy="80" r="1.5" fill="#A78BFA"/>
      <circle cx="40" cy="76" r="2" fill="#C4B5FD"/>
      <circle cx="50" cy="80" r="1.5" fill="#A78BFA"/>
      {/* Roman numeral */}
      <text x="40" y="96" textAnchor="middle" fill="#8B5CF6" fontSize="10" fontFamily="serif" fontWeight="bold">XVII</text>
      <defs>
        <linearGradient id="tarotBg" x1="0" y1="0" x2="80" y2="110">
          <stop offset="0%" stopColor="#1a1030"/><stop offset="100%" stopColor="#120a24"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function NumerologiaSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 12px rgba(201,168,76,0.5))" }}>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#c9a84c33" strokeWidth="1"/>
      <circle cx="50" cy="50" r="40" fill="url(#numBg)" stroke="#c9a84c66" strokeWidth="1.5"/>
      {/* Triangle */}
      <polygon points="50,15 80,75 20,75" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="50,28 70,66 30,66" fill="none" stroke="#e8c97a44" strokeWidth="1"/>
      {/* Eye of providence */}
      <ellipse cx="50" cy="48" rx="12" ry="8" fill="none" stroke="#e8c97a" strokeWidth="1.5"/>
      <circle cx="50" cy="48" r="4" fill="#c9a84c"/>
      <circle cx="50" cy="48" r="2" fill="#e8c97a"/>
      {/* Numbers around */}
      <text x="50" y="82" textAnchor="middle" fill="#c9a84c88" fontSize="11" fontFamily="serif">1 · 3 · 7 · 9</text>
      {/* Corner decorations */}
      <circle cx="50" cy="8" r="2.5" fill="#c9a84c"/>
      <circle cx="14" cy="80" r="2" fill="#c9a84c66"/>
      <circle cx="86" cy="80" r="2" fill="#c9a84c66"/>
      {/* Inner glow */}
      <circle cx="50" cy="48" r="20" fill="url(#numGlow)"/>
      <defs>
        <linearGradient id="numBg" x1="10" y1="10" x2="90" y2="90">
          <stop offset="0%" stopColor="#1a1508"/><stop offset="100%" stopColor="#0f0d06"/>
        </linearGradient>
        <radialGradient id="numGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#c9a84c22"/><stop offset="100%" stopColor="#c9a84c00"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function AnjosSVG() {
  return (
    <svg viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 14px rgba(96,165,250,0.5))" }}>
      {/* Halo */}
      <ellipse cx="50" cy="22" rx="16" ry="5" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
      <ellipse cx="50" cy="22" rx="12" ry="3.5" fill="none" stroke="#93C5FD55" strokeWidth="1"/>
      {/* Head */}
      <circle cx="50" cy="35" r="10" fill="url(#anjoBg)" stroke="#60A5FA88" strokeWidth="1.5"/>
      {/* Body */}
      <path d="M40 45 L50 90 L60 45" fill="url(#anjoBody)" stroke="#60A5FA66" strokeWidth="1"/>
      {/* Left wing */}
      <path d="M38 42 Q15 30 10 55 Q15 50 22 52 Q12 65 20 70 Q25 60 30 62 Q22 72 28 78 Q32 68 38 65 Z" fill="url(#wingL)" stroke="#60A5FA88" strokeWidth="1"/>
      {/* Right wing */}
      <path d="M62 42 Q85 30 90 55 Q85 50 78 52 Q88 65 80 70 Q75 60 70 62 Q78 72 72 78 Q68 68 62 65 Z" fill="url(#wingR)" stroke="#60A5FA88" strokeWidth="1"/>
      {/* Chest star */}
      <circle cx="50" cy="55" r="3" fill="#93C5FD"/>
      <circle cx="50" cy="55" r="6" fill="none" stroke="#60A5FA44" strokeWidth="0.8"/>
      {/* Light rays from halo */}
      <line x1="50" y1="12" x2="50" y2="6" stroke="#93C5FD55" strokeWidth="1" strokeLinecap="round"/>
      <line x1="38" y1="14" x2="34" y2="9" stroke="#93C5FD33" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="62" y1="14" x2="66" y2="9" stroke="#93C5FD33" strokeWidth="0.8" strokeLinecap="round"/>
      <defs>
        <linearGradient id="anjoBg" x1="40" y1="25" x2="60" y2="45"><stop offset="0%" stopColor="#1e3a5f"/><stop offset="100%" stopColor="#0f1f3a"/></linearGradient>
        <linearGradient id="anjoBody" x1="40" y1="45" x2="60" y2="90"><stop offset="0%" stopColor="#1e3a5f88"/><stop offset="100%" stopColor="#0f1f3a44"/></linearGradient>
        <linearGradient id="wingL" x1="10" y1="30" x2="40" y2="78"><stop offset="0%" stopColor="#60A5FA33"/><stop offset="100%" stopColor="#60A5FA11"/></linearGradient>
        <linearGradient id="wingR" x1="90" y1="30" x2="62" y2="78"><stop offset="0%" stopColor="#60A5FA33"/><stop offset="100%" stopColor="#60A5FA11"/></linearGradient>
      </defs>
    </svg>
  );
}

function SaturnoSVG() {
  return (
    <svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 14px rgba(167,139,250,0.5))" }}>
      {/* Ring behind */}
      <ellipse cx="55" cy="52" rx="50" ry="14" fill="none" stroke="#A78BFA55" strokeWidth="1.5" strokeDasharray="4 2"/>
      {/* Planet body */}
      <circle cx="55" cy="48" r="24" fill="url(#saturnBg)" stroke="#A78BFA88" strokeWidth="2"/>
      {/* Planet bands */}
      <path d="M33 42 Q55 38 77 42" fill="none" stroke="#A78BFA33" strokeWidth="1.5"/>
      <path d="M31 48 Q55 52 79 48" fill="none" stroke="#C4B5FD22" strokeWidth="1"/>
      <path d="M33 54 Q55 58 77 54" fill="none" stroke="#A78BFA22" strokeWidth="1"/>
      {/* Highlight */}
      <circle cx="45" cy="40" r="8" fill="url(#saturnHighlight)"/>
      {/* Ring front */}
      <path d="M5 52 Q15 60 30 62" fill="none" stroke="#A78BFA88" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M80 62 Q95 60 105 52" fill="none" stroke="#A78BFA88" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Ring shine */}
      <ellipse cx="55" cy="52" rx="48" ry="12" fill="none" stroke="#C4B5FD22" strokeWidth="4"/>
      {/* Tiny moons */}
      <circle cx="14" cy="36" r="2.5" fill="#A78BFA55" stroke="#A78BFA" strokeWidth="0.5"/>
      <circle cx="96" cy="68" r="1.8" fill="#C4B5FD44" stroke="#C4B5FD" strokeWidth="0.5"/>
      {/* Stars */}
      <circle cx="8" cy="18" r="1" fill="#A78BFA44"/>
      <circle cx="100" cy="22" r="1.2" fill="#C4B5FD33"/>
      <circle cx="20" cy="82" r="0.8" fill="#A78BFA33"/>
      <defs>
        <radialGradient id="saturnBg" cx="45%" cy="40%">
          <stop offset="0%" stopColor="#2d1f5e"/><stop offset="60%" stopColor="#1a1040"/><stop offset="100%" stopColor="#0d0820"/>
        </radialGradient>
        <radialGradient id="saturnHighlight" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#A78BFA22"/><stop offset="100%" stopColor="#A78BFA00"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function OrixasSVG() {
  return (
    <svg viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 14px rgba(245,158,11,0.5))" }}>
      {/* Candle body */}
      <rect x="28" y="50" width="24" height="50" rx="3" fill="url(#candleBg)" stroke="#F59E0B66" strokeWidth="1.5"/>
      {/* Wax drips */}
      <path d="M28 55 Q26 60 28 65" fill="none" stroke="#F59E0B44" strokeWidth="1.5"/>
      <path d="M52 52 Q54 58 52 63" fill="none" stroke="#F59E0B44" strokeWidth="1.5"/>
      <path d="M30 95 Q28 100 30 100 L50 100 Q52 100 50 95" fill="#F59E0B22" stroke="#F59E0B33" strokeWidth="0.5"/>
      {/* Wick */}
      <line x1="40" y1="50" x2="40" y2="38" stroke="#8B6914" strokeWidth="2" strokeLinecap="round"/>
      {/* Flame outer */}
      <path d="M40 6 Q50 20 48 30 Q46 38 40 38 Q34 38 32 30 Q30 20 40 6 Z" fill="url(#flameOuter)"/>
      {/* Flame inner */}
      <path d="M40 14 Q46 24 44 30 Q42 36 40 36 Q38 36 36 30 Q34 24 40 14 Z" fill="url(#flameInner)"/>
      {/* Flame core */}
      <ellipse cx="40" cy="32" rx="3" ry="5" fill="#FEF3C7"/>
      {/* Glow around flame */}
      <circle cx="40" cy="28" r="18" fill="url(#flameGlow)"/>
      {/* Decorative patterns on candle */}
      <path d="M32 60 L48 60" stroke="#F59E0B33" strokeWidth="0.8"/>
      <path d="M32 68 L48 68" stroke="#F59E0B33" strokeWidth="0.8"/>
      <circle cx="40" cy="64" r="3" fill="none" stroke="#F59E0B44" strokeWidth="0.8"/>
      <circle cx="40" cy="64" r="1" fill="#F59E0B44"/>
      {/* Ritual symbols */}
      <path d="M34 76 L40 72 L46 76 L42 80 L38 80 Z" fill="none" stroke="#F59E0B33" strokeWidth="0.8"/>
      {/* Smoke wisps */}
      <path d="M38 8 Q35 2 38 -2" fill="none" stroke="#F59E0B22" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M42 6 Q45 0 42 -4" fill="none" stroke="#F59E0B22" strokeWidth="0.8" strokeLinecap="round"/>
      <defs>
        <linearGradient id="candleBg" x1="28" y1="50" x2="52" y2="100">
          <stop offset="0%" stopColor="#2a1a05"/><stop offset="100%" stopColor="#1a1008"/>
        </linearGradient>
        <linearGradient id="flameOuter" x1="40" y1="6" x2="40" y2="38">
          <stop offset="0%" stopColor="#F59E0B"/><stop offset="50%" stopColor="#EF4444"/><stop offset="100%" stopColor="#DC262666"/>
        </linearGradient>
        <linearGradient id="flameInner" x1="40" y1="14" x2="40" y2="36">
          <stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F59E0B"/>
        </linearGradient>
        <radialGradient id="flameGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#F59E0B33"/><stop offset="100%" stopColor="#F59E0B00"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

const SVG_COMPONENTS = { tarot: TarotSVG, numerologia: NumerologiaSVG, anjos: AnjosSVG, planetaria: SaturnoSVG, orixas: OrixasSVG };

// ══════════════════════════════════════
//  STYLES
// ══════════════════════════════════════
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'EB Garamond', Georgia, serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.gold}; border-radius: 3px; }
  .cinzel { font-family: 'Cinzel', serif; }
  .cinzel-deco { font-family: 'Cinzel Decorative', serif; }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse-gold { 0%, 100% { box-shadow: 0 0 15px rgba(201,168,76,0.3); } 50% { box-shadow: 0 0 35px rgba(201,168,76,0.7); } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes center-glow {
    0%, 100% { box-shadow: 0 0 40px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.1), inset 0 0 30px rgba(201,168,76,0.15); }
    50% { box-shadow: 0 0 70px rgba(201,168,76,0.6), 0 0 140px rgba(201,168,76,0.2), inset 0 0 50px rgba(201,168,76,0.25); }
  }
  @keyframes shimmer-text { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes orbit-path {
    from { transform: rotate(var(--start)) translateX(var(--radius)) rotate(calc(-1 * var(--start))); }
    to { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--radius)) rotate(calc(-1 * (var(--start) + 360deg))); }
  }

  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
  .animate-pulse-gold { animation: pulse-gold 2s ease-in-out infinite; }
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
  .card-mystical::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top left, rgba(201,168,76,0.05) 0%, transparent 60%); pointer-events: none; }
  .card-mystical:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
  .btn-primary { background: linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold}); color: #1a0f00; border: none; padding: 16px 36px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 15px; letter-spacing: 0.08em; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.5); }
  .btn-outline { background: transparent; color: ${COLORS.gold}; border: 1px solid ${COLORS.gold}; padding: 14px 32px; font-family: 'Cinzel', serif; font-weight: 600; font-size: 14px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; }
  .btn-outline:hover { background: rgba(201,168,76,0.1); transform: translateY(-2px); }
  .section-title { font-family: 'Cinzel Decorative', serif; font-size: clamp(1.5rem, 4vw, 2.5rem); text-align: center; margin-bottom: 12px; }
  .nav-link { font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.1em; color: ${COLORS.textMuted}; text-decoration: none; cursor: pointer; transition: color 0.2s; text-transform: uppercase; }
  .nav-link:hover { color: ${COLORS.gold}; }
  .tab-btn { padding: 10px 24px; border-radius: 6px; border: 1px solid rgba(201,168,76,0.3); font-family: 'Cinzel', serif; font-size: 13px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
  .tab-btn.active { background: linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold}); color: #1a0f00; border-color: transparent; font-weight: 700; }
  .tab-btn:not(.active) { background: transparent; color: ${COLORS.textMuted}; }
  .tab-btn:not(.active):hover { border-color: ${COLORS.gold}; color: ${COLORS.gold}; }
  .testimonial-card { background: linear-gradient(135deg, #110d1e, #160f28); border: 1px solid rgba(201,168,76,0.15); border-radius: 16px; padding: 28px; position: relative; }
  .testimonial-card::before { content: '"'; position: absolute; top: -10px; left: 24px; font-family: 'Cinzel Decorative', serif; font-size: 60px; color: ${COLORS.gold}; opacity: 0.3; }
  .glow-line { height: 1px; background: linear-gradient(90deg, transparent 0%, ${COLORS.gold} 30%, ${COLORS.amber} 70%, transparent 100%); opacity: 0.4; }
  .accordion-header { width: 100%; background: transparent; border: none; text-align: left; padding: 20px 24px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-family: 'Cinzel', serif; font-size: 14px; color: ${COLORS.text}; transition: color 0.2s; }
  .accordion-header:hover { color: ${COLORS.gold}; }
  .star { position: absolute; border-radius: 50%; background: white; animation: twinkle var(--duration, 3s) ease-in-out infinite; animation-delay: var(--delay, 0s); }

  .orbit-sat {
    position: absolute; top: 50%; left: 50%;
    width: 100px; height: 100px;
    margin-left: -50px; margin-top: -50px;
    animation: orbit-path 40s linear infinite;
    cursor: pointer; text-decoration: none; display: block;
    transition: filter 0.3s;
  }
  .orbit-sat:hover { filter: brightness(1.3); z-index: 20 !important; }
  .orbit-sat:hover .orbit-label { opacity: 1; transform: translateX(-50%) translateY(0); }
  .orbit-label {
    position: absolute; bottom: -20px; left: 50%;
    transform: translateX(-50%) translateY(4px);
    font-family: 'Cinzel', serif; font-size: 10px;
    white-space: nowrap; letter-spacing: 0.08em; text-transform: uppercase;
    opacity: 0; transition: all 0.3s ease; pointer-events: none;
  }

  @media (max-width: 700px) {
    .orbit-system { transform: scale(0.65) !important; }
    .orbit-sat { width: 80px; height: 80px; margin-left: -40px; margin-top: -40px; }
  }
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
      {stars.map((s) => <div key={s.id} className="star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, "--duration": `${s.duration}s`, "--delay": `${s.delay}s` }} />)}
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,30,100,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────
function Navbar({ activeSection, setActiveSection, user, login, logout }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(10,6,18,0.95)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(201,168,76,0.1)" : "none", transition: "all 0.3s ease", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="cinzel-deco gradient-text" style={{ fontSize: 18 }}>✦ Oráculo da Sorte</div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Início", "caminhos", "como-funciona", "planos", "faq"].map((item) => (
          <span key={item} className="nav-link" onClick={() => { setActiveSection(item); document.getElementById(item)?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ color: activeSection === item ? COLORS.gold : undefined }}>
            {item === 'caminhos' ? 'Caminhos' : item === 'como-funciona' ? 'Como Funciona' : item}
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
            <span className="gradient-text">Escolha seus números</span><br /><span style={{ color: COLORS.text }}>com intenção</span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.8, color: COLORS.textMuted, marginBottom: 16, maxWidth: 480 }}>
            O único app brasileiro que une <em style={{ color: COLORS.text }}>numerologia ancestral</em>, espiritualidade e análise de dados reais da Caixa Econômica — tudo em um ritual personalizado para cada jogo.
          </p>
          <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 36, fontStyle: "italic" }}>Entretenimento espiritual. Jogue com intenção, não com sorte cega.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button className="btn-primary animate-pulse-gold" onClick={() => window.location.href = "/app"}>✦ Começar Agora</button>
            <button className="btn-outline" onClick={() => document.getElementById('caminhos')?.scrollIntoView({ behavior: 'smooth' })}>Ver Caminhos Místicos</button>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
            {[["5 Rituais", "caminhos místicos"], ["7 Loterias", "suportadas"], ["R$9,99", "plano semanal"]].map(([num, label]) => (
              <div key={label}><div className="cinzel gradient-text" style={{ fontSize: 22, fontWeight: 700 }}>{num}</div><div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{label}</div></div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="animate-float" style={{ position: "relative", width: 220, height: 220 }}>
            <div style={{ position: "absolute", inset: -30, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.15)", animation: "spin-slow 20s linear infinite" }} />
            <div style={{ position: "absolute", inset: -55, borderRadius: "50%", border: "1px dashed rgba(201,168,76,0.08)", animation: "spin-reverse 30s linear infinite" }} />
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #3d2060, #1a0f35, #0d0820)", border: "2px solid rgba(201,168,76,0.4)", boxShadow: "0 0 60px rgba(61,30,100,0.6), 0 0 120px rgba(61,30,100,0.3), inset 0 0 40px rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>🔮</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ORBITAL SECTION: 5 CAMINHOS MÍSTICOS
// ══════════════════════════════════════════════════════════════════
function MysticPaths() {
  var [hoveredPath, setHoveredPath] = useState(null);

  var paths = [
    { key: 'tarot',       name: 'Tarot Místico',     color: '#8B5CF6', angle: 0,   desc: 'Três cartas do destino revelam seus números através de um ritual de Passado, Presente e Futuro.' },
    { key: 'numerologia', name: 'Numerologia',       color: '#c9a84c', angle: 72,  desc: 'Cálculos pitagóricos com seu Número de Vida, Nome e Ano Pessoal criam frequências únicas.' },
    { key: 'anjos',       name: 'Anjos da Guarda',   color: '#60A5FA', angle: 144, desc: 'Seu anjo protetor da Cabala sussurra sequências angélicas sagradas carregadas de virtude.' },
    { key: 'planetaria',  name: 'Mapa Planetário',   color: '#A78BFA', angle: 216, desc: 'O planeta regente do dia e a hora planetária influenciam os números com sua geolocalização.' },
    { key: 'orixas',      name: 'Ritual dos Orixás', color: '#F59E0B', angle: 288, desc: 'Orixá do dia e Orixá de nascimento canalizam números de poder ancestral.' },
  ];

  return (
    <section id="caminhos" style={{ padding: "100px 32px 60px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>ESCOLHA SEU CAMINHO</p>
        <h2 className="section-title gradient-text">5 Caminhos Místicos</h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 17, maxWidth: 500, margin: "0 auto 12px", fontStyle: "italic" }}>Cada caminho usa um algoritmo espiritual único para gerar seus números sagrados</p>
        <div className="divider" style={{ marginBottom: 48, marginTop: 16 }} />

        {/* ── ORBITAL SYSTEM ── */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div className="orbit-system" style={{ position: "relative", width: 520, height: 520 }}>

            {/* Orbit rings */}
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 420, height: 420, marginLeft: -210, marginTop: -210, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.07)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 340, height: 340, marginLeft: -170, marginTop: -170, borderRadius: "50%", border: "1px dashed rgba(201,168,76,0.04)", animation: "spin-reverse 80s linear infinite" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 460, height: 460, marginLeft: -230, marginTop: -230, borderRadius: "50%", border: "1px dotted rgba(201,168,76,0.03)" }} />

            {/* CENTER ORB: FORTUNA */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: 130, height: 130, marginLeft: -65, marginTop: -65,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #5a4520, #3a2a10 50%, #1a1008)",
              border: "2px solid rgba(201,168,76,0.5)",
              animation: "center-glow 3s ease-in-out infinite",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              zIndex: 10,
            }}>
              <div style={{ fontSize: 40, marginBottom: 2 }}>💰</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                background: "linear-gradient(90deg, #8a7230, #e8c97a, #c9a84c, #8a7230)",
                backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer-text 3s linear infinite",
              }}>FORTUNA</div>
            </div>

            {/* 5 ORBITING SVG SATELLITES */}
            {paths.map(function(path, i) {
              var SvgComp = SVG_COMPONENTS[path.key];
              return (
                <a key={path.key} href="/app" className="orbit-sat"
                  style={{
                    "--start": path.angle + "deg",
                    "--radius": "200px",
                    zIndex: hoveredPath === path.key ? 20 : 5,
                  }}
                  onMouseEnter={function() { setHoveredPath(path.key); }}
                  onMouseLeave={function() { setHoveredPath(null); }}
                >
                  <SvgComp />
                  <div className="orbit-label" style={{ color: path.color, textShadow: "0 0 12px " + path.color + "55" }}>
                    {path.name}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* ── FEATURE CARDS BELOW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 960, margin: "0 auto" }}>
          {paths.map(function(path) {
            var isActive = hoveredPath === path.key;
            var SvgComp = SVG_COMPONENTS[path.key];
            return (
              <a key={path.key} href="/app" style={{
                background: isActive ? "rgba(201,168,76,0.06)" : "linear-gradient(135deg, rgba(17,13,30,0.6), rgba(22,15,40,0.6))",
                border: "1px solid " + (isActive ? path.color + "55" : "rgba(201,168,76,0.1)"),
                borderRadius: 14, padding: "24px 16px", textAlign: "center",
                transition: "all 0.3s ease", textDecoration: "none", display: "block",
              }}
              onMouseEnter={function() { setHoveredPath(path.key); }}
              onMouseLeave={function() { setHoveredPath(null); }}
              >
                <div style={{ width: 48, height: 48, margin: "0 auto 12px" }}><SvgComp /></div>
                <h4 className="cinzel" style={{ fontSize: 12, color: path.color, marginBottom: 6 }}>{path.name}</h4>
                <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>{path.desc}</p>
              </a>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button className="btn-primary" onClick={() => window.location.href = "/app"} style={{ fontSize: 16, padding: "18px 44px" }}>✦ Escolher Meu Caminho</button>
        </div>
      </div>
    </section>
  );
}

// ── Como Funciona ─────────────────────────────────────────────────
function HowItWorks() {
  var steps = [
    { icon: "🗓️", title: "Informe sua data de nascimento", desc: "O Oráculo calcula seu número de vida, arquétipo e vibração numerológica pessoal." },
    { icon: "🌙", title: "Escolha seu caminho místico", desc: "Tarot, Numerologia, Anjos, Mapa Planetário ou Orixás — cada um com algoritmo próprio." },
    { icon: "🎰", title: "Selecione a loteria", desc: "Mega-Sena, Lotofácil, Quina, Lotomania, Dupla Sena, Timemania ou Dia de Sorte." },
    { icon: "✨", title: "Receba seus números sagrados", desc: "Gerados com base na sua vibração, fase lunar e ritual escolhido." },
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
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(212,129,58,0.1))", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", fontSize: 13, color: COLORS.gold, fontWeight: 700, marginBottom: 20 }}>{i + 1}</div>
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
  var res = await fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
  var data = await res.json();
  if (data.url) window.location.href = data.url;
}

function Pricing() {
  var [billingTab, setBillingTab] = useState("mensal");
  var plans = [
    { name: "3 Consultas", icon: "✧", price: { mensal: "R$6,00", anual: "R$6,00" }, period: "/ pacote", color: COLORS.textMuted, features: ["✓ 3 consultas completas", "✓ Todas as loterias brasileiras", "✓ Análise mística completa", "✓ Apenas R$2,00 por consulta"], cta: "Comprar Pacote", highlight: false },
    { name: "Místico", icon: "🔮", price: { mensal: "R$9,90", anual: "R$7,90" }, period: billingTab === "anual" ? "/semana — anual" : "/semana", color: COLORS.gold, badge: "Mais Popular", features: ["✓ Todas as 7 loterias", "✓ Consultas ilimitadas", "✓ 5 caminhos místicos completos", "✓ Orixás + Anjos + Planetária", "✓ Análise de padrões históricos", "✗ Bolão espiritual"], cta: "Assinar Místico", highlight: true },
    { name: "Sagrado", icon: "👑", price: { mensal: "R$24,90", anual: "R$19,90" }, period: billingTab === "anual" ? "/semana — anual" : "/semana", color: COLORS.amber, features: ["✓ Tudo do plano Místico", "✓ Bolão espiritual ilimitado", "✓ Consultor IA via chat", "✓ Relatório mensal", "✓ Badge de fundador", "✓ Suporte prioritário"], cta: "Assinar Sagrado", highlight: false },
  ];
  return (
    <section id="planos" style={{ padding: "100px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="cinzel" style={{ textAlign: "center", color: COLORS.gold, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>PLANOS</p>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 12 }}>Escolha seu <span className="gradient-text">caminho espiritual</span></h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 17, marginBottom: 36, fontStyle: "italic" }}>Comece grátis. Evolua quando sentir a chamada.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 56 }}>
          {["mensal", "anual"].map((t) => <button key={t} className={`tab-btn ${billingTab === t ? "active" : ""}`} onClick={() => setBillingTab(t)}>{t === "mensal" ? "Mensal" : "Anual (−20%)"}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
          {plans.map((plan) => (
            <div key={plan.name} className="card-mystical" style={{ padding: 36, ...(plan.highlight ? { border: `2px solid ${COLORS.gold}`, boxShadow: "0 0 40px rgba(201,168,76,0.15)", transform: "scale(1.03)" } : {}) }}>
              {plan.badge && <div style={{ background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold})`, color: "#1a0f00", fontSize: 11, fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 20, display: "inline-block", marginBottom: 16 }}>{plan.badge}</div>}
              <div style={{ fontSize: 40, marginBottom: 12 }}>{plan.icon}</div>
              <h3 className="cinzel" style={{ fontSize: 20, color: plan.color, marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ marginBottom: 24 }}><span className="cinzel" style={{ fontSize: 42, fontWeight: 700, color: COLORS.text }}>{plan.price[billingTab]}</span><span style={{ fontSize: 14, color: COLORS.textMuted, marginLeft: 8 }}>{plan.period}</span></div>
              <div className="glow-line" style={{ marginBottom: 24 }} />
              <ul style={{ listStyle: "none", marginBottom: 32 }}>{plan.features.map((f, i) => <li key={i} style={{ padding: "7px 0", fontSize: 14, color: f.startsWith("✗") ? COLORS.textMuted : COLORS.text, opacity: f.startsWith("✗") ? 0.5 : 1 }}>{f}</li>)}</ul>
              <button className={plan.highlight ? "btn-primary" : "btn-outline"} style={{ width: "100%" }} onClick={() => plan.name === "Místico" ? handleCheckout("mistico") : plan.name === "Sagrado" ? handleCheckout("sagrado") : window.location.href = "/app"}>{plan.cta}</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: "24px 32px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, textAlign: "center" }}>
          <span className="cinzel" style={{ color: COLORS.gold, fontSize: 14 }}>💡 Prefere não assinar?</span>
          <span style={{ color: COLORS.textMuted, fontSize: 15, marginLeft: 12 }}>Pacote de 3 consultas por <strong style={{ color: COLORS.text }}>R$6,00</strong> — sem assinatura.</span>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────
function Testimonials() {
  var items = [
    { name: "Carla M.", city: "São Paulo – SP", text: "A experiência do ritual mudou minha relação com o jogo. Os caminhos místicos são incríveis.", stars: 5 },
    { name: "Jorge P.", city: "Recife – PE", text: "A parte dos orixás é incrível. Me sinto mais conectado à minha espiritualidade.", stars: 5 },
    { name: "Ana L.", city: "BH – MG", text: "O tarot diário virou meu ritual. Uso como entretenimento espiritual e adoro.", stars: 4 },
  ];
  return (
    <section style={{ padding: "80px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="section-title" style={{ color: COLORS.text, marginBottom: 12 }}>O que a comunidade <span className="gradient-text">está dizendo</span></h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 15, fontStyle: "italic", marginBottom: 56 }}>Beta fechado com 200 usuários</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {items.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div style={{ marginBottom: 16, paddingTop: 8 }}>{"★".repeat(t.stars)}<span style={{ opacity: 0.3 }}>{"★".repeat(5 - t.stars)}</span></div>
              <p style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{t.text}</p>
              <div><div className="cinzel" style={{ fontSize: 14, color: COLORS.gold }}>{t.name}</div><div style={{ fontSize: 13, color: COLORS.textMuted }}>{t.city}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────
function FAQ() {
  var [open, setOpen] = useState(null);
  var items = [
    { q: "O Oráculo garante que vou ganhar?", a: "Não. É entretenimento espiritual. Loterias são jogos de azar — nenhum sistema pode prever resultados." },
    { q: "O que são os 5 caminhos místicos?", a: "São 5 métodos: Tarot (3 cartas), Numerologia (Pitágoras), Anjos da Guarda (Cabala), Mapa Planetário (astros) e Orixás. Cada um com algoritmo único." },
    { q: "Meus dados estão seguros?", a: "Sim. Seguimos a LGPD. Dados usados apenas para cálculos místicos. Solicite exclusão a qualquer momento." },
    { q: "Posso cancelar?", a: "Sim, sem multa. Cancele pelo app ou e-mail. Acesso ativo até fim do período pago." },
    { q: "Para que serve a geolocalização?", a: "Fuso horário e posições planetárias no Mapa Planetário. Nunca compartilhamos sua localização." },
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
                <span>{item.q}</span><span style={{ color: COLORS.gold, fontSize: 20, flexShrink: 0, marginLeft: 16 }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div style={{ padding: "0 24px 24px", color: COLORS.textMuted, fontSize: 15, lineHeight: 1.8 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Legal + Footer ────────────────────────────────────────────────
function LegalDisclaimer() {
  return (
    <section style={{ padding: "40px 32px 0", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "28px 32px" }}>
          <p className="cinzel" style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>⚖️ Aviso Legal</p>
          <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>O Oráculo da Sorte é <strong style={{ color: COLORS.text }}>entretenimento espiritual</strong>. Não garantimos resultados. <strong style={{ color: COLORS.text }}>Jogue com responsabilidade.</strong> Conformidade com a <strong style={{ color: COLORS.text }}>LGPD</strong>. Não afiliado à Caixa Econômica Federal.</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "60px 32px 32px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="glow-line" style={{ marginBottom: 40 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div><div className="cinzel-deco gradient-text" style={{ fontSize: 20, marginBottom: 8 }}>✦ Oráculo da Sorte</div><p style={{ color: COLORS.textMuted, fontSize: 13, fontStyle: "italic" }}>Entretenimento espiritual para quem joga com intenção.</p></div>
          <div style={{ display: "flex", gap: 32 }}>{["Privacidade", "Termos", "Contato", "LGPD"].map(link => <span key={link} className="nav-link" style={{ fontSize: 12 }}>{link}</span>)}</div>
        </div>
        <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 12, marginTop: 40, opacity: 0.5 }}>© 2026 Oráculo da Sorte. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  var [activeSection, setActiveSection] = useState("Início");
  var { user, profile, loading, showOnboarding, login, logout, completeOnboarding } = useAuth();
  return (
    <>
      <style>{styles}</style>
      {showOnboarding && user && <OnboardingPopup userId={user.id} onComplete={completeOnboarding} />}
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
