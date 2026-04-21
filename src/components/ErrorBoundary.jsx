// src/components/ErrorBoundary.jsx
// Fallback global para qualquer exception não-apanhada. Protege contra white-screen
// em crashes de render — incluindo os descendentes do AuthProvider.

import { Component } from 'react';
import { track } from '@vercel/analytics';

const COLORS = {
  bg: '#0a0612', gold: '#c9a84c', goldLight: '#e8c97a', amber: '#d4813a',
  text: '#f0e6d3', textMuted: '#a89880',
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    try {
      track('oraculo_error_boundary_caught', { message: error?.message || 'unknown' });
    } catch { /* analytics opcional */ }
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', background: COLORS.bg, color: COLORS.text,
        fontFamily: "'EB Garamond', serif",
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🔮</div>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: '1.6rem',
          background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 16,
        }}>Algo não correu como esperado</h1>
        <p style={{
          fontSize: 16, lineHeight: 1.7, color: COLORS.text,
          marginBottom: 28, maxWidth: 440,
        }}>
          Por favor recarregue a página. Se continuar, contacte-nos em{' '}
          <a href="mailto:contato@oraculo-da-sorte.com" style={{
            color: COLORS.gold, textDecoration: 'underline',
          }}>contato@oraculo-da-sorte.com</a>.
        </p>
        <button onClick={this.handleReload} style={{
          padding: '14px 32px',
          background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
          color: '#06060e', border: 'none', borderRadius: 12,
          fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700,
          cursor: 'pointer', letterSpacing: '0.05em',
        }}>✦ Recarregar página</button>
      </div>
    );
  }
}
