// src/components/InAppBrowserWarning.jsx
// Aviso exibido quando o user abre o site dentro de um WebView (Instagram, TikTok...).
// OAuth Google recusa esses UAs com 403; o modal instrui a copiar o link e abrir
// em Safari/Chrome.

import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';

const COLORS = {
  bg: '#0a0612', gold: '#c9a84c', goldLight: '#e8c97a', amber: '#d4813a',
  text: '#f0e6d3', textMuted: '#a89880',
};

function safeTrack(event) {
  try { track(event); } catch { /* analytics opcional, nunca bloquear UX */ }
}

export default function InAppBrowserWarning({ open, onClose, onProceedAnyway }) {
  const [copied, setCopied] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(true);

  useEffect(() => {
    if (!open) return;
    safeTrack('oraculo_inapp_warning_shown');
    setCopied(false);
    setClipboardSupported(true);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async () => {
    safeTrack('oraculo_inapp_copy_link');
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch {
        // cai no fallback manual
      }
    }
    setClipboardSupported(false);
  };

  const handleProceed = () => {
    safeTrack('oraculo_inapp_proceed_anyway');
    onProceedAnyway();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2100,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflowY: 'auto', overscrollBehavior: 'contain',
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0e0a1a, #150f28)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 20, padding: '40px 28px',
        maxWidth: 420, width: '100%',
        margin: 'auto 0',
      }}>
        <button
          aria-label="Fechar"
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32,
            background: 'transparent', border: 'none',
            color: COLORS.textMuted, fontSize: 20,
            cursor: 'pointer', lineHeight: 1,
          }}
        >×</button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔓</div>
          <h2 style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem',
            background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>Abra no navegador para continuar</h2>
        </div>

        <p style={{
          fontFamily: "'EB Garamond', serif", fontSize: 15, lineHeight: 1.6,
          color: COLORS.text, textAlign: 'center', marginBottom: 24,
        }}>
          O login Google não funciona dentro de apps como Instagram, TikTok ou Facebook. Para criar sua conta e ver seus números místicos, abra esta página no Safari (iPhone) ou Chrome (Android).
        </p>

        <button
          onClick={handleCopy}
          style={{
            display: 'block', width: '80%', margin: '0 auto',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
            color: '#06060e', border: 'none', borderRadius: 12,
            fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.05em',
          }}
        >
          {copied ? '✓ Copiado' : 'Copiar link'}
        </button>

        {!clipboardSupported && (
          <div style={{ marginTop: 16 }}>
            <p style={{
              fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic',
              textAlign: 'center', marginBottom: 8,
            }}>Selecione e copie manualmente:</p>
            <input
              type="text"
              readOnly
              value={window.location.href}
              onFocus={(e) => e.target.select()}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 8, color: COLORS.text,
                fontFamily: 'monospace', fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <p style={{
          fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic',
          textAlign: 'center', marginTop: 16,
        }}>Depois abra seu navegador e cole o link na barra de endereço</p>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={handleProceed}
            style={{
              background: 'transparent', border: 'none',
              color: COLORS.textMuted, fontSize: 12,
              fontFamily: "'EB Garamond', serif",
              textDecoration: 'underline', cursor: 'pointer',
            }}
          >Continuar mesmo assim</button>
        </div>
      </div>
    </div>
  );
}
