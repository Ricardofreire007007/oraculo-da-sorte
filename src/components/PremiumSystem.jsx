import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { supabase } from '../auth.js';

const MP_PAYMENT_LINK = 'https://mpago.la/22uo8W5';

function checkIsPremium(profile) {
  if (!profile || !profile.plano) return false;
  return ['mistico', 'sagrado', 'paid'].includes(profile.plano);
}

export function usePremium() {
  const { profile, refreshProfile } = useAuth();
  return {
    isPremium: checkIsPremium(profile),
    refreshProfile,
  };
}

export function PremiumBadge() {
  const { user, profile, refreshProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const isPremium = checkIsPremium(profile);

  if (isPremium) {
    return (
      <span style={{
        background: 'linear-gradient(135deg, #FFD700, #B8860B)',
        color: '#1a0033',
        fontFamily: "'Cinzel', serif",
        fontSize: 11, fontWeight: 700,
        padding: '4px 10px', borderRadius: 20,
        letterSpacing: '0.05em',
      }}>
        ✨ Iniciado
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #FFD700, #B8860B)',
          color: '#1a0033',
          fontFamily: "'Cinzel', serif",
          fontSize: 11, fontWeight: 700,
          padding: '6px 12px', borderRadius: 20,
          border: 'none', cursor: 'pointer',
          letterSpacing: '0.03em',
        }}
      >
        🔮 Desbloquear Mistérios
      </button>
      {modalOpen && (
        <PremiumModal
          onClose={() => setModalOpen(false)}
          user={user}
          onRedeemSuccess={() => {
            if (refreshProfile) refreshProfile();
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function PremiumModal({ onClose, user, onRedeemSuccess }) {
  const [mode, setMode] = useState('purchase');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRedeem = async () => {
    if (!user) {
      setError('Faz login primeiro para resgatar o teu código.');
      return;
    }
    if (!code.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setError('Sessão expirada. Faz login novamente.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || 'Os astros não reconhecem esse código. Verifique e tente novamente.');
        setSubmitting(false);
        return;
      }

      onRedeemSuccess();
    } catch (err) {
      console.error('Erro ao resgatar código:', err);
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #2d1b4e, #1a0f2e)',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: 20, padding: '32px 28px',
          maxWidth: 420, width: '100%', position: 'relative',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'transparent', border: 'none',
            color: '#a89880', fontSize: 24, cursor: 'pointer',
          }}
        >
          ×
        </button>

        {mode === 'purchase' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🔮</div>
              <h2 style={{
                fontFamily: "'Cinzel', serif", fontSize: 20,
                color: '#FFD700', marginBottom: 4,
              }}>
                Oráculo Premium Vitalício
              </h2>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 30,
                color: '#FFD700', fontWeight: 700, margin: '12px 0 4px',
              }}>
                R$ 29,90
              </div>
              <p style={{ color: '#a89880', fontSize: 13, margin: 0 }}>pagamento único</p>
              <p style={{
                color: '#FFD700', fontSize: 12, marginTop: 12,
                fontStyle: 'italic', fontFamily: "'Cinzel', serif",
              }}>
                🌙 Oferta dos Primeiros 100 Iniciados
              </p>
            </div>

            <a
              href={MP_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                color: '#1a0033', textDecoration: 'none',
                fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700,
                padding: '14px 20px', borderRadius: 12, marginBottom: 16,
              }}
            >
              Consultar o Oráculo (Pix / Cartão)
            </a>

            <button
              onClick={() => { setMode('activate'); setError(''); }}
              style={{
                background: 'transparent', border: 'none',
                color: '#FFD700', fontSize: 13, cursor: 'pointer',
                display: 'block', margin: '0 auto',
                textDecoration: 'underline',
                fontFamily: "'EB Garamond', serif",
              }}
            >
              Já tenho meu Código Místico
            </button>

            <p style={{
              textAlign: 'center', fontSize: 10, color: '#a89880',
              marginTop: 24, lineHeight: 1.6,
            }}>
              Pagamento processado pelo Mercado Pago. Oráculo da Sorte é entretenimento · não afiliado à Caixa Econômica Federal.
            </p>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
              <h2 style={{
                fontFamily: "'Cinzel', serif", fontSize: 18,
                color: '#FFD700', marginBottom: 8,
              }}>
                Revele Seu Código Místico
              </h2>
              {!user && (
                <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>
                  Faz login primeiro para resgatar o teu código.
                </p>
              )}
            </div>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRedeem(); }}
              placeholder="ORACULO-XXXX-XXXX"
              disabled={submitting}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: 10, padding: '14px 16px',
                color: '#FFD700', fontFamily: "'Cinzel', serif",
                fontSize: 16, letterSpacing: '0.1em',
                textAlign: 'center', textTransform: 'uppercase',
                marginBottom: 12, outline: 'none',
              }}
            />

            {error && (
              <p style={{
                color: '#f87171', fontSize: 12, textAlign: 'center',
                marginBottom: 12, lineHeight: 1.5,
              }}>
                {error}
              </p>
            )}

            <button
              onClick={handleRedeem}
              disabled={submitting || !code.trim() || !user}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                color: '#1a0033', border: 'none',
                fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700,
                padding: '14px 20px', borderRadius: 12,
                cursor: (submitting || !user || !code.trim()) ? 'not-allowed' : 'pointer',
                opacity: (submitting || !user || !code.trim()) ? 0.5 : 1,
                marginBottom: 12,
              }}
            >
              {submitting ? 'Revelando…' : 'Revelar'}
            </button>

            <button
              onClick={() => { setMode('purchase'); setError(''); setCode(''); }}
              style={{
                background: 'transparent', border: 'none',
                color: '#a89880', fontSize: 12, cursor: 'pointer',
                display: 'block', margin: '0 auto',
                fontFamily: "'EB Garamond', serif",
              }}
            >
              ← Voltar para a oferta
            </button>
          </>
        )}
      </div>
    </div>
  );
}
