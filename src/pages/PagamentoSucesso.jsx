// src/pages/PagamentoSucesso.jsx
// Página de retorno do checkout Mercado Pago. Lê status da querystring,
// faz poll ao profile para confirmar ativação (até 60s) e renderiza um
// dos 5 estados visuais: carregando, sucesso, pendente, falha, timeout.

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { supabase } from '../auth.js';
import { track } from '@vercel/analytics';

const COLORS = {
  bg: '#0a0612', gold: '#c9a84c', goldLight: '#e8c97a', amber: '#d4813a',
  text: '#f0e6d3', textMuted: '#a89880',
};

const PLANO_LABELS = {
  consulta: 'Pacote 3 Consultas',
  mistico: 'Plano Místico',
  sagrado: 'Plano Sagrado',
  premium_anual: 'Premium Anual',
};

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');@keyframes spin-orb{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}";

// Calcula a fase inicial a partir da querystring. Lido do useState initializer
// (não do useEffect) para evitar setState síncrono no corpo do effect.
function computeFaseInicial() {
  if (typeof window === 'undefined') return 'carregando';
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  if (!status) return 'redirect_home';
  if (status === 'pending' || status === 'in_process') return 'pendente';
  if (status === 'failed' || status === 'rejected' || status === 'cancelled' || status === 'failure') return 'falha';
  if (status !== 'approved') return 'falha';
  return 'carregando';
}

export default function PagamentoSucesso() {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const [fase, setFase] = useState(computeFaseInicial);
  const [planoAtivado, setPlanoAtivado] = useState(null);

  useEffect(() => {
    document.title = 'Pagamento — Oráculo da Sorte';

    if (fase === 'redirect_home') {
      window.location.href = '/';
      return;
    }
    if (fase !== 'carregando') return;
    if (loading) return;
    if (!userId) {
      window.location.href = '/app';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');

    let creditosSnapshot = null;
    let expiraSnapshot = null;
    let intervalId = null;
    let timeoutId = null;
    let cancelled = false;

    const planosPremium = ['mistico', 'sagrado', 'premium_anual'];

    const verificar = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('plano, plano_expira_em, creditos_restantes, ultimo_pagamento_mp_id')
        .eq('id', userId)
        .single();
      if (cancelled) return true;
      if (error || !data) return false;

      if (creditosSnapshot === null) creditosSnapshot = data.creditos_restantes ?? 0;
      if (expiraSnapshot === null) {
        expiraSnapshot = data.plano_expira_em ? new Date(data.plano_expira_em) : null;
      }

      // Critério 1 — match exato do payment_id (mais fiável)
      if (paymentId && data.ultimo_pagamento_mp_id && String(data.ultimo_pagamento_mp_id) === String(paymentId)) {
        setPlanoAtivado(data.plano);
        setFase('sucesso');
        track('oraculo_pagamento_ativado', { plano: data.plano });
        return true;
      }

      // Critério 2 — premium ativo E expira_em estendeu vs snapshot (evita falso positivo
      // quando user já tinha premium activo antes desta compra)
      if (planosPremium.includes(data.plano) && data.plano_expira_em) {
        const expiraAtual = new Date(data.plano_expira_em);
        const temExtensao = expiraSnapshot === null || expiraAtual > expiraSnapshot;
        if (temExtensao && expiraAtual > new Date()) {
          setPlanoAtivado(data.plano);
          setFase('sucesso');
          track('oraculo_pagamento_ativado', { plano: data.plano });
          return true;
        }
      }

      // Critério 3 — créditos aumentaram (plano consulta)
      if ((data.creditos_restantes ?? 0) > creditosSnapshot) {
        setPlanoAtivado('consulta');
        setFase('sucesso');
        track('oraculo_pagamento_ativado', { plano: 'consulta' });
        return true;
      }
      return false;
    };

    const iniciar = async () => {
      const imediato = await verificar();
      if (imediato || cancelled) return;
      intervalId = setInterval(async () => {
        const ok = await verificar();
        if (ok && intervalId) { clearInterval(intervalId); intervalId = null; }
      }, POLL_INTERVAL_MS);
      timeoutId = setTimeout(() => {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        setFase((f) => (f === 'carregando' ? 'timeout' : f));
      }, POLL_TIMEOUT_MS);
    };

    iniciar();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fase, loading, userId]);

  const wrapper = {
    minHeight: '100vh', background: COLORS.bg, color: COLORS.text,
    fontFamily: "'EB Garamond', serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, textAlign: 'center',
  };
  const box = {
    maxWidth: 480, width: '100%',
    background: 'linear-gradient(135deg, #110d1e, #160f28)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: 20, padding: '40px 32px',
  };
  const titulo = {
    fontFamily: "'Cinzel', serif", fontSize: 22,
    background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    marginBottom: 16,
  };
  const corpo = { fontSize: 16, color: COLORS.text, lineHeight: 1.7, marginBottom: 24 };
  const botaoPrimario = {
    display: 'inline-block', padding: '14px 32px',
    background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
    color: '#06060e', border: 'none', borderRadius: 10,
    fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700,
    cursor: 'pointer', textDecoration: 'none',
  };
  const botaoSecundario = {
    ...botaoPrimario,
    background: 'transparent', color: COLORS.gold,
    border: '1px solid rgba(201,168,76,0.4)',
  };

  let content = null;
  if (fase === 'redirect_home') {
    content = (
      <>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
        <p style={{ color: COLORS.textMuted, fontStyle: 'italic' }}>A redirecionar...</p>
      </>
    );
  } else if (fase === 'carregando') {
    content = (
      <>
        <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: '50%', border: '2px solid rgba(201,168,76,0.3)', borderTop: '2px solid #c9a84c', animation: 'spin-orb 1s linear infinite' }} />
        <h1 style={titulo}>Os astros estão alinhando seu acesso</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, fontStyle: 'italic' }}>
          Confirmando a energia do pagamento... isso pode levar alguns segundos.
        </p>
      </>
    );
  } else if (fase === 'sucesso') {
    const label = PLANO_LABELS[planoAtivado] || 'Acesso';
    content = (
      <>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
        <h1 style={titulo}>Acesso ativado</h1>
        <p style={corpo}>
          Seu <strong style={{ color: COLORS.goldLight }}>{label}</strong> está ativo. Os números sagrados já aguardam por você.
        </p>
        <a href="/app" style={botaoPrimario}>Entrar no Oráculo</a>
      </>
    );
  } else if (fase === 'pendente') {
    content = (
      <>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
        <h1 style={titulo}>Pagamento em processamento</h1>
        <p style={corpo}>
          Pagamentos por boleto podem levar 1 a 3 dias úteis para serem confirmados. Você receberá acesso automaticamente assim que o pagamento for aprovado.
        </p>
        <a href="/" style={botaoSecundario}>Voltar ao Início</a>
      </>
    );
  } else if (fase === 'falha') {
    content = (
      <>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h1 style={titulo}>Pagamento não concluído</h1>
        <p style={corpo}>
          O pagamento não foi finalizado. Você pode tentar novamente quando quiser.
        </p>
        <a href="/app" style={botaoPrimario}>Ver Planos</a>
      </>
    );
  } else if (fase === 'timeout') {
    content = (
      <>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⏱️</div>
        <h1 style={titulo}>Quase lá</h1>
        <p style={corpo}>
          Seu pagamento foi aceito, mas a ativação está demorando mais do que o esperado. Você receberá acesso em breve — entre no Oráculo para verificar o seu plano.
        </p>
        <a href="/app" style={botaoPrimario}>Entrar no Oráculo</a>
      </>
    );
  }

  return (
    <div style={wrapper}>
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />
      <div style={box}>{content}</div>
    </div>
  );
}
